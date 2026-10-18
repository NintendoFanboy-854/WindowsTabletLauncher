//! 开机自启：写 HKCU\...\CurrentVersion\Run，值为当前 exe 的完整路径。
//!
//! 选注册表而不是启动项快捷方式：一个值就是全部状态，读取/关闭都只是读写这个值。

use std::io::ErrorKind;

use winreg::enums::{HKEY_CURRENT_USER, KEY_QUERY_VALUE, KEY_SET_VALUE};
use winreg::RegKey;

const RUN_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
const VALUE_NAME: &str = "WindowsTabletLauncher";

fn open_run_key(access: u32) -> Result<RegKey, String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    hkcu.open_subkey_with_flags(RUN_KEY, access)
        .map_err(|err| format!("打开注册表 Run 项失败: {err}"))
}

pub fn is_enabled() -> Result<bool, String> {
    let key = match open_run_key(KEY_QUERY_VALUE) {
        Ok(key) => key,
        // Run 项不存在 = 没设置过自启
        Err(_) => return Ok(false),
    };
    match key.get_value::<String, _>(VALUE_NAME) {
        Ok(value) => Ok(!value.trim().is_empty()),
        Err(err) if err.kind() == ErrorKind::NotFound => Ok(false),
        Err(err) => Err(format!("读取自启注册表值失败: {err}")),
    }
}

pub fn set_enabled(enabled: bool) -> Result<(), String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    if enabled {
        let exe = std::env::current_exe()
            .map_err(|err| format!("取当前 exe 路径失败: {err}"))?;
        // 带引号，路径含空格时也能正确启动
        let command = format!("\"{}\"", exe.display());
        let (key, _) = hkcu
            .create_subkey(RUN_KEY)
            .map_err(|err| format!("创建注册表 Run 项失败: {err}"))?;
        key.set_value(VALUE_NAME, &command)
            .map_err(|err| format!("写入自启注册表值失败: {err}"))?;
        Ok(())
    } else {
        let key = match open_run_key(KEY_SET_VALUE) {
            Ok(key) => key,
            Err(_) => return Ok(()), // 没有 Run 项，本来就等于关闭
        };
        match key.delete_value(VALUE_NAME) {
            Ok(()) => Ok(()),
            Err(err) if err.kind() == ErrorKind::NotFound => Ok(()),
            Err(err) => Err(format!("删除自启注册表值失败: {err}")),
        }
    }
}

/// 当前 exe 路径是否就是注册表里登记的那一个。设置页可用来提示“自启指向旧路径”。
#[allow(dead_code)]
pub fn is_current_exe() -> Result<bool, String> {
    let key = match open_run_key(KEY_QUERY_VALUE) {
        Ok(key) => key,
        Err(_) => return Ok(false),
    };
    let registered = match key.get_value::<String, _>(VALUE_NAME) {
        Ok(value) => value,
        Err(err) if err.kind() == ErrorKind::NotFound => return Ok(false),
        Err(err) => return Err(format!("读取自启注册表值失败: {err}")),
    };
    let current = std::env::current_exe().map_err(|err| format!("取当前 exe 路径失败: {err}"))?;
    let normalize = |value: &str| value.trim().trim_matches('"').to_lowercase();
    Ok(normalize(&registered) == normalize(&current.display().to_string()))
}
