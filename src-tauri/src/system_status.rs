//! 系统状态（桌面底部状态栏）：电量 / 充电 / 主音量。
//!
//! 只读快照，不在这里做控制；状态栏按固定节奏轮询。
//! - 电量/充电：`GetSystemPowerStatus`（Win32，免 COM）
//! - 音量：默认渲染端点上的 `IAudioEndpointVolume`（CoreAudio COM，MTA 下调用）
//!
//! 失败一律返回 `None`，不把 HRESULT 抛给前端；状态栏按可用项降级显示。

use serde::Serialize;
use windows::Win32::Media::Audio::Endpoints::IAudioEndpointVolume;
use windows::Win32::Media::Audio::{eConsole, eRender, IMMDeviceEnumerator, MMDeviceEnumerator};
use windows::Win32::System::Com::{CoCreateInstance, CLSCTX_ALL};
use windows::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};
use windows::Win32::System::WinRT::{RoInitialize, RoUninitialize, RO_INIT_MULTITHREADED};

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
}

/// 读一次系统状态。阻塞调用，调用方放 `spawn_blocking`。
pub fn snapshot() -> SystemStatus {
    let initialized = unsafe { RoInitialize(RO_INIT_MULTITHREADED).is_ok() };
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

    // 主音量 / 静音
    unsafe {
        let enumerator: windows::core::Result<IMMDeviceEnumerator> =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL);
        if let Ok(enumerator) = enumerator {
            if let Ok(device) = enumerator.GetDefaultAudioEndpoint(eRender, eConsole) {
                if let Ok(volume) = device.Activate::<IAudioEndpointVolume>(CLSCTX_ALL, None) {
                    if let Ok(scalar) = volume.GetMasterVolumeLevelScalar() {
                        // clamp 后再 round，避免异常端点值溢出 u8
                        let percent = (scalar.clamp(0.0, 1.0) * 100.0).round();
                        status.volume_percent = Some(percent as u8);
                    }
                    if let Ok(muted) = volume.GetMute() {
                        status.muted = Some(muted.as_bool());
                    }
                }
            }
        }
    }

    if initialized {
        // SAFETY: 与上方 RoInitialize 成对。
        unsafe { RoUninitialize() };
    }
    status
}
