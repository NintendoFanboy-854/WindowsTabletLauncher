//! 系统状态（桌面底部状态栏 + 快速设置面板）：电量 / 充电 / 主音量 / 静音 / 亮度 / 自动亮度。
//!
//! 只读快照 + 少量系统控制（音量、静音、亮度、自动亮度）都在本模块：
//! - 电量/充电：`GetSystemPowerStatus`（Win32，免 COM）
//! - 音量：默认渲染端点上的 `IAudioEndpointVolume`（CoreAudio COM，MTA 下调用）
//! - 亮度：WMI `root\wmi` 的 `WmiMonitorBrightness`（读）/ `WmiMonitorBrightnessMethods`
//!   的 `WmiSetBrightness`（写）。本机验证只有内置屏 DISPLAY\BOE06D0 这类面板支持。
//! - 自动亮度能力：WinRT `LightSensor.GetDefault()` 探测环境光传感器，失败再用 WMI
//!   （`MSAcpi_AmbientLightSensor` / ACPI0008 设备）兜底；能力探测结果进程内缓存。
//! - 自动亮度开关：电源方案设置 `GUID_VIDEO_ADAPTIVE_DISPLAY_BRIGHTNESS`，读
//!   `PowerReadACValueIndex`/`PowerReadDCValueIndex`，写 `PowerWriteACValueIndex` +
//!   `PowerWriteDCValueIndex` + `PowerSetActiveScheme`；写不进去（权限/策略）返回 `Err`。
//!
//! 快照里读不到的项一律 `None`，不把 HRESULT 抛给前端；控制命令失败才返回 `Err`。

use serde::Serialize;
use windows::Devices::Sensors::LightSensor;
use windows::Win32::Foundation::{LocalFree, HLOCAL, WIN32_ERROR};
use windows::Win32::Media::Audio::Endpoints::IAudioEndpointVolume;
use windows::Win32::Media::Audio::{eConsole, eRender, IMMDeviceEnumerator, MMDeviceEnumerator};
use windows::Win32::System::Com::{
    CoCreateInstance, CoSetProxyBlanket, CLSCTX_ALL, CLSCTX_INPROC_SERVER, EOAC_NONE,
    RPC_C_AUTHN_LEVEL_CALL, RPC_C_IMP_LEVEL_IMPERSONATE,
};
use windows::Win32::System::Power::{
    GetSystemPowerStatus, PowerGetActiveScheme, PowerReadACValueIndex, PowerReadDCValueIndex,
    PowerSetActiveScheme, PowerWriteACValueIndex, PowerWriteDCValueIndex, SYSTEM_POWER_STATUS,
};
use windows::Win32::System::Variant::{
    VariantClear, VariantToUInt32, VARIANT, VARIANT_0, VARIANT_0_0, VARIANT_0_0_0, VT_BSTR,
    VT_I4, VT_UI1, VT_UI4,
};
use windows::Win32::System::WinRT::{RoInitialize, RoUninitialize, RO_INIT_MULTITHREADED};
use windows::Win32::System::Wmi::{
    IWbemClassObject, IWbemLocator, IWbemServices, WbemLocator, CIM_UINT32, CIM_UINT8,
    WBEM_FLAG_FORWARD_ONLY, WBEM_FLAG_RETURN_IMMEDIATELY, WBEM_GENERIC_FLAG_TYPE, WBEM_INFINITE,
};
use windows::core::{GUID, BSTR};

/// 电源方案里的「启用自适应亮度」设置（powercfg 别名 ADAPTBRIGHT / SUB_VIDEO）。
const GUID_VIDEO_ADAPTIVE_DISPLAY_BRIGHTNESS: GUID =
    GUID::from_u128(0xFBD9AA66_9553_4097_BA44_ED6E9D65EAB8);
/// 显示子组（powercfg 别名 SUB_VIDEO）；PowerRead/Write 系列要同时给子组 GUID。
const GUID_VIDEO_SUBGROUP: GUID = GUID::from_u128(0x7516B95F_F776_4464_8C53_06167F40CC99);

#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemStatus {
    /// 电量 0–100；未知/无电池为 None
    pub battery_percent: Option<u8>,
    /// 是否接通电源（充电/外接供电）；未知为 None
    pub charging: Option<bool>,
    /// 主音量 0–100；拿不到为 None
    pub volume_percent: Option<u8>,
    /// 是否静音；拿不到为 None
    pub muted: Option<bool>,
    /// 屏幕亮度 0–100；WMI 拿不到（如外接显示器 / 无内置屏）为 None
    pub brightness_percent: Option<u8>,
    /// 是否检测到环境光传感器（支持自动亮度）；检测不到时前端不渲染该行
    pub auto_brightness_supported: bool,
    /// 系统「自适应亮度」开关；读不到为 None
    pub auto_brightness_enabled: Option<bool>,
}

/// 在当前线程初始化 COM/WinRT（MTA），执行结束后配对反初始化。
/// 线程已初始化过（如 RPC_E_CHANGED_MODE）不算失败：调用方只关心 COM 可用。
fn with_com<R>(action: impl FnOnce() -> R) -> R {
    let initialized = unsafe { RoInitialize(RO_INIT_MULTITHREADED).is_ok() };
    let result = action();
    if initialized {
        // SAFETY: 与上方 RoInitialize 成对。
        unsafe { RoUninitialize() };
    }
    result
}

/// 读默认渲染端点的主音量/静音。失败项为 None。
fn read_playback_endpoint() -> (Option<u8>, Option<bool>) {
    unsafe {
        let Ok(enumerator) =
            CoCreateInstance::<_, IMMDeviceEnumerator>(&MMDeviceEnumerator, None, CLSCTX_ALL)
        else {
            return (None, None);
        };
        let Ok(device) = enumerator.GetDefaultAudioEndpoint(eRender, eConsole) else {
            return (None, None);
        };
        let Ok(volume) = device.Activate::<IAudioEndpointVolume>(CLSCTX_ALL, None) else {
            return (None, None);
        };
        let percent = volume.GetMasterVolumeLevelScalar().ok().map(|scalar| {
            // clamp 后再 round，避免异常端点值溢出 u8
            (scalar.clamp(0.0, 1.0) * 100.0).round() as u8
        });
        let muted = volume.GetMute().ok().map(|value| value.as_bool());
        (percent, muted)
    }
}

/// 取默认渲染端点的 `IAudioEndpointVolume`（控制命令用）。
fn default_endpoint_volume() -> Result<IAudioEndpointVolume, String> {
    unsafe {
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)
                .map_err(|failure| format!("打开音频设备枚举器失败: {failure}"))?;
        let device = enumerator
            .GetDefaultAudioEndpoint(eRender, eConsole)
            .map_err(|failure| format!("找不到默认音频输出设备: {failure}"))?;
        device
            .Activate::<IAudioEndpointVolume>(CLSCTX_ALL, None)
            .map_err(|failure| format!("打开音量控制失败: {failure}"))
    }
}

// ---------- WMI（root\wmi，亮度） ----------

/// 连接指定 WMI namespace。同进程内每次重新取 locator/services，避免跨线程缓存 COM 对象。
fn wmi_connect(namespace: &str) -> Result<IWbemServices, String> {
    unsafe {
        let locator: IWbemLocator = CoCreateInstance(&WbemLocator, None, CLSCTX_INPROC_SERVER)
            .map_err(|failure| format!("创建 WMI locator 失败: {failure}"))?;
        let services = locator
            .ConnectServer(
                &BSTR::from(namespace),
                &BSTR::new(),
                &BSTR::new(),
                &BSTR::new(),
                0,
                &BSTR::new(),
                None,
            )
            .map_err(|failure| format!("连接 WMI {namespace} 失败: {failure}"))?;
        // 本机验证：不设置代理安全级别时 root\wmi 查询会失败；
        // 用当前用户默认凭据（WINNT + 无授权检查 + Call/Impersonate）即可。
        let _ = CoSetProxyBlanket(
            &services,
            10, // RPC_C_AUTHN_WINNT
            0,  // RPC_C_AUTHZ_NONE
            None,
            RPC_C_AUTHN_LEVEL_CALL,
            RPC_C_IMP_LEVEL_IMPERSONATE,
            None,
            EOAC_NONE,
        );
        Ok(services)
    }
}

fn wmi_flag_forward() -> windows::Win32::System::Wmi::WBEM_GENERIC_FLAG_TYPE {
    WBEM_FLAG_FORWARD_ONLY | WBEM_FLAG_RETURN_IMMEDIATELY
}

/// VARIANT → u32（WMI 的 CIM_UINT8 是 VT_UI1，CIM_UINT32 是 VT_I4/VT_UI4）。
fn variant_u32(variant: &VARIANT) -> Option<u32> {
    unsafe {
        let inner = &variant.Anonymous.Anonymous;
        if inner.vt == VT_UI1 {
            Some(inner.Anonymous.bVal as u32)
        } else if inner.vt == VT_UI4 {
            Some(inner.Anonymous.ulVal)
        } else if inner.vt == VT_I4 {
            Some(inner.Anonymous.lVal as u32)
        } else {
            VariantToUInt32(variant).ok()
        }
    }
}

/// 构造 VT_I4 的 VARIANT（WMI 的 CIM_UINT32 参数按 VARIANT 映射表用 VT_I4）。
fn variant_i32_value(value: i32) -> VARIANT {
    let mut variant = VARIANT::default();
    variant.Anonymous = VARIANT_0 {
        Anonymous: core::mem::ManuallyDrop::new(VARIANT_0_0 {
            vt: VT_I4,
            wReserved1: 0,
            wReserved2: 0,
            wReserved3: 0,
            Anonymous: VARIANT_0_0_0 { lVal: value },
        }),
    };
    variant
}

/// 构造 VT_UI1 的 VARIANT（WMI 的 CIM_UINT8 参数）。
fn variant_u8_value(value: u8) -> VARIANT {
    let mut variant = VARIANT::default();
    variant.Anonymous = VARIANT_0 {
        Anonymous: core::mem::ManuallyDrop::new(VARIANT_0_0 {
            vt: VT_UI1,
            wReserved1: 0,
            wReserved2: 0,
            wReserved3: 0,
            Anonymous: VARIANT_0_0_0 { bVal: value },
        }),
    };
    variant
}

/// VARIANT → String（只接受 VT_BSTR）。
fn variant_string(variant: &VARIANT) -> Option<String> {
    unsafe {
        let inner = &variant.Anonymous.Anonymous;
        if inner.vt != VT_BSTR {
            return None;
        }
        let bstr: &BSTR = &inner.Anonymous.bstrVal;
        Some(bstr.to_string())
    }
}

/// 读内置屏当前亮度（`WmiMonitorBrightness.CurrentBrightness`）。
fn read_brightness_inner() -> Result<u8, String> {
    let services = wmi_connect("root\\wmi")?;
    unsafe {
        let enumerator = services
            .ExecQuery(
                &BSTR::from("WQL"),
                &BSTR::from("SELECT CurrentBrightness FROM WmiMonitorBrightness"),
                wmi_flag_forward(),
                None,
            )
            .map_err(|failure| format!("查询屏幕亮度失败: {failure}"))?;
        loop {
            let mut objects = [None; 1];
            let mut returned = 0u32;
            let _ = enumerator.Next(WBEM_INFINITE, &mut objects, &mut returned);
            if returned == 0 {
                break;
            }
            let Some(object) = objects[0].take() else {
                continue;
            };
            let mut variant = VARIANT::default();
            let got = object.Get(&BSTR::from("CurrentBrightness"), 0, &mut variant, None, None);
            let value = if got.is_ok() {
                variant_u32(&variant)
            } else {
                None
            };
            let _ = VariantClear(&mut variant);
            if let Some(value) = value {
                return Ok(value.clamp(0, 100) as u8);
            }
        }
    }
    Err("没有可读的 WmiMonitorBrightness 实例（可能是外接屏）".to_string())
}

/// 写内置屏亮度（`WmiMonitorBrightnessMethods.WmiSetBrightness(0, percent)`）。
///
/// 流程：枚举实例拿 `__PATH` → 取类定义拿方法入参签名 → SpawnInstance 填入
/// Timeout(UINT32=0) 与 Brightness(UINT8) → `ExecMethod`。
fn set_brightness_inner(percent: u8) -> Result<(), String> {
    let percent = percent.min(100);
    let services = wmi_connect("root\\wmi")?;
    unsafe {
        // 1) 实例的 __PATH
        let path = {
            let enumerator = services
                .ExecQuery(
                    &BSTR::from("WQL"),
                    &BSTR::from("SELECT * FROM WmiMonitorBrightnessMethods"),
                    wmi_flag_forward(),
                    None,
                )
                .map_err(|failure| format!("查询亮度控制失败: {failure}"))?;
            let mut path = None;
            loop {
                let mut objects = [None; 1];
                let mut returned = 0u32;
                let _ = enumerator.Next(WBEM_INFINITE, &mut objects, &mut returned);
                if returned == 0 {
                    break;
                }
                let Some(object) = objects[0].take() else {
                    continue;
                };
                let mut variant = VARIANT::default();
                if object
                    .Get(&BSTR::from("__PATH"), 0, &mut variant, None, None)
                    .is_ok()
                {
                    path = variant_string(&variant);
                }
                let _ = VariantClear(&mut variant);
                if path.is_some() {
                    break;
                }
            }
            path.ok_or_else(|| "没有可写的 WmiMonitorBrightnessMethods 实例".to_string())?
        };

        // 2) 方法入参模板
        let mut class_object: Option<IWbemClassObject> = None;
        services
            .GetObject(
                &BSTR::from("WmiMonitorBrightnessMethods"),
                WBEM_GENERIC_FLAG_TYPE(0),
                None,
                Some(&mut class_object),
                None,
            )
            .map_err(|failure| format!("读取亮度控制类失败: {failure}"))?;
        let class_object =
            class_object.ok_or_else(|| "亮度控制类为空".to_string())?;
        let mut in_signature: Option<IWbemClassObject> = None;
        let mut out_signature: Option<IWbemClassObject> = None;
        class_object
            .GetMethod(
                &BSTR::from("WmiSetBrightness"),
                0,
                &mut in_signature,
                &mut out_signature,
            )
            .map_err(|failure| format!("读取 WmiSetBrightness 签名失败: {failure}"))?;
        let in_params = in_signature
            .ok_or_else(|| "WmiSetBrightness 没有入参签名".to_string())?
            .SpawnInstance(0)
            .map_err(|failure| format!("创建亮度方法入参失败: {failure}"))?;

        // WmiSetBrightness([in] uint32 Timeout, [in] uint8 Brightness)：
        // 本机验证 CIM_UINT32 入参必须用 VT_I4（用 VT_UI4 会得到 WBEM_E_TYPE_MISMATCH）。
        let timeout_variant = variant_i32_value(0);
        in_params
            .Put(&BSTR::from("Timeout"), 0, &timeout_variant, CIM_UINT32.0)
            .map_err(|failure| format!("设置亮度 Timeout 失败: {failure}"))?;

        let brightness_variant = variant_u8_value(percent);
        in_params
            .Put(
                &BSTR::from("Brightness"),
                0,
                &brightness_variant,
                CIM_UINT8.0,
            )
            .map_err(|failure| format!("设置亮度入参失败: {failure}"))?;

        // 3) 调用
        services
            .ExecMethod(
                &BSTR::from(path),
                &BSTR::from("WmiSetBrightness"),
                WBEM_GENERIC_FLAG_TYPE(0),
                None,
                &in_params,
                None,
                None,
            )
            .map_err(|failure| format!("设置屏幕亮度失败: {failure}"))?;
    }
    Ok(())
}

// ---------- 自动亮度（电源方案设置） ----------

/// 环境光传感器能力探测：WinRT `LightSensor` 优先，失败再查 ACPI0008 设备。
///
/// 结果进程内缓存：能力不会在运行中变化，避免每次快照都付一次失败探测的成本。
fn auto_brightness_supported() -> bool {
    static SUPPORTED: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
    *SUPPORTED.get_or_init(|| {
        if LightSensor::GetDefault().is_ok() {
            return true;
        }
        // 兜底：ACPI0008 就是 ACPI 环境光传感器（PnP ID 形如 ACPI\ACPI0008\...）。
        auto_light_sensor_device_present()
    })
}

fn auto_light_sensor_device_present() -> bool {
    let Ok(services) = wmi_connect("root\\cimv2") else {
        return false;
    };
    unsafe {
        // WQL 的 LIKE 里一个反斜杠要写成两个；Rust 源码因此是 4 个。
        let query = "SELECT Name FROM Win32_PnPEntity WHERE PNPDeviceID LIKE 'ACPI\\\\ACPI0008%'";
        let Ok(enumerator) = services.ExecQuery(
            &BSTR::from("WQL"),
            &BSTR::from(query),
            wmi_flag_forward(),
            None,
        ) else {
            return false;
        };
        let mut objects = [None; 1];
        let mut returned = 0u32;
        let _ = enumerator.Next(WBEM_INFINITE, &mut objects, &mut returned);
        returned > 0
    }
}

/// 取当前激活的电源方案 GUID。`PowerGetActiveScheme` 用 LocalAlloc 分配，读完必须 LocalFree。
fn active_power_scheme() -> Result<GUID, String> {
    let mut pointer: *mut GUID = core::ptr::null_mut();
    let error = unsafe { PowerGetActiveScheme(None, &mut pointer) };
    if error != WIN32_ERROR(0) || pointer.is_null() {
        return Err(format!("读取当前电源方案失败（错误码 {}）", error.0));
    }
    let scheme = unsafe { *pointer };
    unsafe {
        // SAFETY: PowerGetActiveScheme 分配的内存由调用方负责释放。
        let _ = LocalFree(Some(HLOCAL(pointer as *mut core::ffi::c_void)));
    }
    Ok(scheme)
}

/// 读系统「自适应亮度」开关：优先当前供电方式对应的值（AC 接电 / DC 电池），
/// 该方式读失败时回落到另一种。
///
/// 本机验证：scheme 必须传当前激活方案（传 NULL 会得到 ERROR_INVALID_PARAMETER），
/// 子组必须传显示子组 GUID（不传会得到 ERROR_FILE_NOT_FOUND）。
fn read_auto_brightness_inner(on_ac: Option<bool>) -> Result<bool, String> {
    let scheme = active_power_scheme()?;
    let mut ac = 0u32;
    let mut dc = 0u32;
    let (ac_error, dc_error) = unsafe {
        (
            PowerReadACValueIndex(
                None,
                Some(&scheme),
                Some(&GUID_VIDEO_SUBGROUP),
                Some(&GUID_VIDEO_ADAPTIVE_DISPLAY_BRIGHTNESS),
                &mut ac,
            ),
            PowerReadDCValueIndex(
                None,
                Some(&scheme),
                Some(&GUID_VIDEO_SUBGROUP),
                Some(&GUID_VIDEO_ADAPTIVE_DISPLAY_BRIGHTNESS),
                &mut dc,
            ),
        )
    };
    match on_ac {
        Some(false) if dc_error == 0 => Ok(dc != 0),
        _ if ac_error.0 == 0 => Ok(ac != 0),
        _ if dc_error == 0 => Ok(dc != 0),
        _ => Err(format!(
            "读取自适应亮度设置失败（AC={} DC={dc_error}）",
            ac_error.0
        )),
    }
}

/// 写系统「自适应亮度」开关（AC + DC 都写，然后重新应用当前电源方案）。
fn set_auto_brightness_inner(enabled: bool) -> Result<(), String> {
    let scheme = active_power_scheme()?;
    let value = u32::from(enabled);
    unsafe {
        let ac_error = PowerWriteACValueIndex(
            None,
            &scheme,
            Some(&GUID_VIDEO_SUBGROUP),
            Some(&GUID_VIDEO_ADAPTIVE_DISPLAY_BRIGHTNESS),
            value,
        );
        if ac_error.0 != 0 {
            return Err(format!(
                "写入自适应亮度设置失败（AC，错误码 {}）；可能被电源策略锁定",
                ac_error.0
            ));
        }
        let dc_error = PowerWriteDCValueIndex(
            None,
            &scheme,
            Some(&GUID_VIDEO_SUBGROUP),
            Some(&GUID_VIDEO_ADAPTIVE_DISPLAY_BRIGHTNESS),
            value,
        );
        if dc_error != 0 {
            return Err(format!(
                "写入自适应亮度设置失败（DC，错误码 {dc_error}）；可能被电源策略锁定"
            ));
        }
        let apply_error = PowerSetActiveScheme(None, Some(&scheme));
        if apply_error.0 != 0 {
            return Err(format!(
                "应用自适应亮度设置失败（错误码 {}）",
                apply_error.0
            ));
        }
    }
    Ok(())
}

// ---------- 对外：快照与控制 ----------

/// 读一次系统状态。阻塞调用，调用方放 `spawn_blocking`。
pub fn snapshot() -> SystemStatus {
    with_com(|| {
        let mut status = SystemStatus::default();

        // 电量 / 电源（BatteryLifePercent=255 表示未知）
        let mut power = SYSTEM_POWER_STATUS::default();
        if unsafe { GetSystemPowerStatus(&mut power) }.is_ok() {
            if power.BatteryLifePercent != 255 {
                status.battery_percent = Some(power.BatteryLifePercent);
            }
            // ACLineStatus: 0=离线 1=在线 255=未知
            status.charging = match power.ACLineStatus {
                0 => Some(false),
                1 => Some(true),
                _ => None,
            };
        }

        let (volume_percent, muted) = read_playback_endpoint();
        status.volume_percent = volume_percent;
        status.muted = muted;

        status.brightness_percent = read_brightness_inner().ok();

        status.auto_brightness_supported = auto_brightness_supported();
        if status.auto_brightness_supported {
            status.auto_brightness_enabled = read_auto_brightness_inner(status.charging).ok();
        }

        status
    })
}

/// 设置主音量（0–100）。阻塞调用，调用方放 `spawn_blocking`。
pub fn set_volume(percent: u8) -> Result<(), String> {
    let percent = percent.min(100);
    with_com(|| {
        let volume = default_endpoint_volume()?;
        unsafe {
            volume
                .SetMasterVolumeLevelScalar(percent as f32 / 100.0, core::ptr::null())
                .map_err(|failure| format!("设置主音量失败: {failure}"))
        }
    })
}

/// 设置静音。阻塞调用，调用方放 `spawn_blocking`。
pub fn set_muted(muted: bool) -> Result<(), String> {
    with_com(|| {
        let volume = default_endpoint_volume()?;
        unsafe {
            volume
                .SetMute(muted, core::ptr::null())
                .map_err(|failure| format!("设置静音失败: {failure}"))
        }
    })
}

/// 设置屏幕亮度（0–100，WMI WmiSetBrightness）。阻塞调用，调用方放 `spawn_blocking`。
pub fn set_brightness(percent: u8) -> Result<(), String> {
    with_com(|| set_brightness_inner(percent))
}

/// 设置系统「自适应亮度」开关。阻塞调用，调用方放 `spawn_blocking`。
/// 写权限不足（策略/权限）时返回 `Err`，前端保留原开关状态。
pub fn set_auto_brightness(enabled: bool) -> Result<(), String> {
    with_com(|| set_auto_brightness_inner(enabled))
}
