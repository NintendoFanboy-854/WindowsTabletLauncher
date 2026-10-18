//! 系统定位（Windows Geolocator）。
//!
//! 出错/未授权/定位服务关闭一律返回 `None` —— 插件侧 `getLocation()` 的契约就是
//! “定位失败返回 null”，调用方自己降级（天气插件用缓存或手动城市）。

use serde::Serialize;
use windows::Devices::Geolocation::{GeolocationAccessStatus, Geolocator};
use windows::Win32::System::WinRT::{RoInitialize, RoUninitialize, RO_INIT_MULTITHREADED};

#[derive(Debug, Clone, Serialize)]
pub struct GeoLocation {
    pub lat: f64,
    pub lon: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub city: Option<String>,
}

/// 同步版本，供 `spawn_blocking` 在独立线程里调用。
pub fn locate() -> Option<GeoLocation> {
    // WinRT 异步 API 需要当前线程初始化 COM（MTA 即可）。
    // 已初始化过（RPC_E_CHANGED_MODE 等）不算失败，继续调用。
    let initialized = unsafe { RoInitialize(RO_INIT_MULTITHREADED).is_ok() };
    let result = locate_inner();
    if initialized {
        // SAFETY: 与上方 RoInitialize 成对。
        unsafe { RoUninitialize() };
    }
    result
}

fn locate_inner() -> Option<GeoLocation> {
    let access = Geolocator::RequestAccessAsync().ok()?.join().ok()?;
    if access != GeolocationAccessStatus::Allowed {
        log::info!("定位权限未授予: {access:?}");
        return None;
    }

    let geolocator = Geolocator::new().ok()?;
    let position = geolocator.GetGeopositionAsync().ok()?.join().ok()?;
    let coordinate = position.Coordinate().ok()?;
    let point = coordinate.Point().ok()?;
    let basic = point.Position().ok()?;
    Some(GeoLocation {
        lat: basic.Latitude,
        lon: basic.Longitude,
        city: None,
    })
}
