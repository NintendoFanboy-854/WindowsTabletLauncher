//! 插件目录管理：`plugins/<id>/` 的扫描、读写、zip 安装。
//!
//! 目录位置的优先级：
//! 1. 环境变量 `WTSL_PLUGINS_DIR`（调试 / 便携模式强制指定）；
//! 2. 开发模式：从当前 exe 向上找到仓库根（同时含 `src-tauri/` 与 `public/plugins/`），
//!    直接用 `public/plugins`，这样 vite dev 与前端 HTTP `/plugins/` 是同一份文件；
//! 3. 发布模式：`app_data_dir()/plugins`；首次运行时把打进前端的 `plugins/**`
//!    资源种一份进去（用户装新插件后不再覆盖）。
//!
//! 名单 `index.json` 只用来定顺序和记录安装过的插件；目录里手动放进去的插件
//! 也会被扫到（DESIGN：手动放文件夹同样生效）。

use std::path::{Path, PathBuf};

use serde::Serialize;
use tauri::Manager;

use crate::{zip, protocol};

/// 全局插件目录状态，`setup` 时解析并 manage。
pub struct PluginState {
    pub root: PathBuf,
}

impl PluginState {
    pub fn resolve(app: &tauri::AppHandle) -> Result<Self, String> {
        let root = resolve_root(app)?;
        log::info!("插件目录: {}", root.display());
        Ok(Self { root })
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginEnv {
    pub plugins_dir: String,
    /// 插件 iframe 的 URL 根（自定义协议）
    pub frame_base: String,
    pub writable: bool,
    pub runtime: &'static str,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginRecord {
    /// 以目录名为准（iframe 路径用它）
    pub id: String,
    pub dir: String,
    pub manifest: Option<serde_json::Value>,
    /// 扫描阶段发现的问题，前端可展示/跳过
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

pub fn env(state: &PluginState) -> PluginEnv {
    PluginEnv {
        plugins_dir: state.root.display().to_string(),
        frame_base: protocol::frame_base(),
        writable: true,
        runtime: "tauri",
    }
}

/// 扫描插件目录：`index.json` 的顺序优先，其余带 manifest 的目录按名字补在后面。
pub fn list(state: &PluginState) -> Result<Vec<PluginRecord>, String> {
    let root = &state.root;
    std::fs::create_dir_all(root).map_err(|err| format!("创建插件目录失败: {err}"))?;

    let mut seen = std::collections::HashSet::new();
    let mut ids: Vec<String> = Vec::new();
    for id in read_index(root) {
        if seen.insert(id.clone()) {
            ids.push(id);
        }
    }

    let mut extra: Vec<String> = Vec::new();
    let entries = std::fs::read_dir(root).map_err(|err| format!("读取插件目录失败: {err}"))?;
    for entry in entries.flatten() {
        if !entry
            .file_type()
            .map(|kind| kind.is_dir())
            .unwrap_or(false)
        {
            continue;
        }
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.starts_with('.') || seen.contains(&name) {
            continue;
        }
        // 只认带 manifest.json 的目录
        if entry.path().join("manifest.json").is_file() {
            extra.push(name);
        }
    }
    extra.sort();
    ids.extend(extra);

    let mut records = Vec::with_capacity(ids.len());
    for id in ids {
        if validate_plugin_id(&id).is_err() {
            log::warn!("跳过非法插件 id: {id}");
            continue;
        }
        let dir = root.join(&id);
        if !dir.is_dir() {
            records.push(PluginRecord {
                id: id.clone(),
                dir: dir.display().to_string(),
                manifest: None,
                error: Some("插件目录不存在".to_string()),
            });
            continue;
        }
        let manifest_path = dir.join("manifest.json");
        let manifest = match std::fs::read(&manifest_path) {
            Ok(bytes) => match serde_json::from_slice::<serde_json::Value>(&bytes) {
                Ok(value) => value,
                Err(err) => {
                    records.push(PluginRecord {
                        id: id.clone(),
                        dir: dir.display().to_string(),
                        manifest: None,
                        error: Some(format!("manifest.json 不是合法 JSON: {err}")),
                    });
                    continue;
                }
            },
            Err(err) => {
                records.push(PluginRecord {
                    id: id.clone(),
                    dir: dir.display().to_string(),
                    manifest: None,
                    error: Some(format!("读 manifest.json 失败: {err}")),
                });
                continue;
            }
        };

        let mut error = None;
        if let Some(manifest_id) = manifest.get("id").and_then(|value| value.as_str()) {
            if manifest_id != id {
                error = Some(format!(
                    "manifest.id「{manifest_id}」与目录名「{id}」不一致，按目录名加载"
                ));
            }
        }
        records.push(PluginRecord {
            id: id.clone(),
            dir: dir.display().to_string(),
            manifest: Some(manifest),
            error,
        });
    }
    Ok(records)
}

pub fn read_manifest(state: &PluginState, plugin_id: &str) -> Result<String, String> {
    let dir = plugin_dir(state, plugin_id)?;
    let path = dir.join("manifest.json");
    std::fs::read_to_string(&path).map_err(|err| format!("读 manifest 失败: {err}"))
}

pub fn read_text(state: &PluginState, plugin_id: &str, rel_path: &str) -> Result<String, String> {
    let path = plugin_file(state, plugin_id, rel_path)?;
    std::fs::read_to_string(&path).map_err(|err| format!("读插件文件失败: {err}"))
}

pub fn write_text(
    state: &PluginState,
    plugin_id: &str,
    rel_path: &str,
    contents: &str,
) -> Result<(), String> {
    let path = plugin_file(state, plugin_id, rel_path)?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|err| format!("创建插件子目录失败: {err}"))?;
    }
    std::fs::write(&path, contents).map_err(|err| format!("写插件文件失败: {err}"))
}

pub fn remove(state: &PluginState, plugin_id: &str) -> Result<(), String> {
    let dir = plugin_dir(state, plugin_id)?;
    if dir.exists() {
        std::fs::remove_dir_all(&dir).map_err(|err| format!("删除插件目录失败: {err}"))?;
    }
    index_remove(&state.root, plugin_id)
}

/// zip 安装：解压到瞬态目录 → 读 id → 替换 `plugins/<id>/` → 更新 index.json。
pub fn install_zip(root: &Path, zip_path: &str) -> Result<PluginRecord, String> {
    std::fs::create_dir_all(root).map_err(|err| format!("创建插件目录失败: {err}"))?;

    let source = Path::new(zip_path);
    if !source.is_file() {
        return Err(format!("找不到 zip 文件: {zip_path}"));
    }
    if source
        .extension()
        .map(|ext| ext.to_string_lossy().to_ascii_lowercase() != "zip")
        .unwrap_or(true)
    {
        return Err("只支持 .zip 文件".to_string());
    }

    let entries = strip_common_prefix(zip::read_zip(source)?)?;
    let manifest_entry = entries
        .iter()
        .find(|entry| entry.name == "manifest.json")
        .ok_or_else(|| "zip 根目录缺少 manifest.json".to_string())?;
    let manifest: serde_json::Value = serde_json::from_slice(&manifest_entry.data)
        .map_err(|err| format!("zip 内 manifest.json 不是合法 JSON: {err}"))?;
    let plugin_id = manifest
        .get("id")
        .and_then(|value| value.as_str())
        .ok_or_else(|| "zip 内 manifest.json 缺少 id".to_string())?
        .to_string();
    validate_plugin_id(&plugin_id)?;

    let staging = root.join(format!(".install-{}-{}", std::process::id(), plugin_id));
    if staging.exists() {
        let _ = std::fs::remove_dir_all(&staging);
    }
    std::fs::create_dir_all(&staging).map_err(|err| format!("创建安装临时目录失败: {err}"))?;

    let write_result = (|| -> Result<(), String> {
        for entry in &entries {
            let rel = safe_relative_path(&entry.name)?;
            if rel.as_os_str().is_empty() {
                continue;
            }
            let target = staging.join(&rel);
            if let Some(parent) = target.parent() {
                std::fs::create_dir_all(parent)
                    .map_err(|err| format!("创建插件子目录失败: {err}"))?;
            }
            std::fs::write(&target, &entry.data)
                .map_err(|err| format!("写出插件文件失败（{}）: {err}", entry.name))?;
        }
        Ok(())
    })();
    if let Err(err) = write_result {
        let _ = std::fs::remove_dir_all(&staging);
        return Err(err);
    }

    let target = root.join(&plugin_id);
    if target.exists() {
        std::fs::remove_dir_all(&target).map_err(|err| {
            let _ = std::fs::remove_dir_all(&staging);
            format!("替换旧插件目录失败: {err}")
        })?;
    }
    std::fs::rename(&staging, &target).map_err(|err| {
        let _ = std::fs::remove_dir_all(&staging);
        format!("就位插件目录失败: {err}")
    })?;
    index_add(root, &plugin_id)?;

    Ok(PluginRecord {
        id: plugin_id,
        dir: target.display().to_string(),
        manifest: Some(manifest),
        error: None,
    })
}

fn resolve_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if let Ok(dir) = std::env::var("WTSL_PLUGINS_DIR") {
        let dir = PathBuf::from(dir);
        std::fs::create_dir_all(&dir).map_err(|err| format!("创建 WTSL_PLUGINS_DIR 失败: {err}"))?;
        return Ok(dir);
    }

    if cfg!(debug_assertions) {
        if let Some(repo) = dev_repo_root() {
            let dir = repo.join("public").join("plugins");
            if dir.is_dir() {
                return Ok(dir);
            }
        }
    }

    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("取应用数据目录失败: {err}"))?;
    let root = data_dir.join("plugins");
    std::fs::create_dir_all(&root).map_err(|err| format!("创建插件目录失败: {err}"))?;
    seed_bundled_plugins(app, &root)?;
    Ok(root)
}

fn dev_repo_root() -> Option<PathBuf> {
    let looks_like_repo = |dir: &Path| dir.join("src-tauri").is_dir() && dir.join("public/plugins").is_dir();
    if let Ok(exe) = std::env::current_exe() {
        for ancestor in exe.ancestors() {
            if looks_like_repo(ancestor) {
                return Some(ancestor.to_path_buf());
            }
        }
    }
    // `tauri dev` 的工作目录通常是 src-tauri/
    if let Ok(cwd) = std::env::current_dir() {
        for candidate in [Some(cwd.clone()), cwd.parent().map(Path::to_path_buf)]
            .into_iter()
            .flatten()
        {
            if looks_like_repo(&candidate) {
                return Some(candidate);
            }
        }
    }
    None
}

/// 种子标记：记录种入时的应用版本；升级安装后会重新种一遍内置插件，
/// 避免旧版本种下的坏文件（例如压缩字节）永远留在用户目录里。
const SEED_MARKER: &str = ".seed-version";

/// 首次发布运行（以及每次版本升级）把前端内嵌的 `plugins/**` 种到用户插件目录。
/// 只覆盖内置插件文件；用户自己放进来的额外插件目录不受影响。
fn seed_bundled_plugins(app: &tauri::AppHandle, root: &Path) -> Result<(), String> {
    let version = env!("CARGO_PKG_VERSION");
    let marker = root.join(SEED_MARKER);
    if std::fs::read_to_string(&marker)
        .map(|value| value.trim() == version)
        .unwrap_or(false)
    {
        return Ok(());
    }
    let resolver = app.asset_resolver();
    let mut written = 0usize;
    for (path, _compressed) in resolver.iter() {
        // tauri-utils 的 AssetKey 会把路径规范成以 `/` 开头（assets.rs 的 From<Path> 实现），
        // 所以这里必须先去掉前导 `/`，否则 strip_prefix("plugins/") 永远匹配不到，
        // 发布安装后 app_data/plugins 会是空目录，桌面卡在“正在加载桌面”（v0.2.0 安装包问题）。
        let path = path.trim_start_matches('/');
        let Some(relative) = path.strip_prefix("plugins/") else {
            continue;
        };
        if relative.is_empty() {
            continue;
        }
        // iter() 返回的是构建期压缩（brotli）后的字节，直接写盘会得到不可读文件；
        // 必须走 get() 拿解压后的 Asset.bytes（protocol.rs 的 plugin-sdk.js 也是这样取的）。
        let Some(asset) = resolver.get(path.to_string()) else {
            continue;
        };
        let target = root.join(relative.replace('/', std::path::MAIN_SEPARATOR_STR));
        if let Some(parent) = target.parent() {
            std::fs::create_dir_all(parent).map_err(|err| format!("创建插件目录失败: {err}"))?;
        }
        std::fs::write(&target, asset.bytes)
            .map_err(|err| format!("写入内置插件失败: {err}"))?;
        written += 1;
    }
    if written == 0 {
        log::warn!("没有可种入的内置插件资源（plugins/**）");
    } else {
        std::fs::write(&marker, version).map_err(|err| format!("写入种子标记失败: {err}"))?;
        log::info!("已种入 {written} 个内置插件文件（版本 {version}）");
    }
    Ok(())
}

fn plugin_dir(state: &PluginState, plugin_id: &str) -> Result<PathBuf, String> {
    validate_plugin_id(plugin_id)?;
    Ok(state.root.join(plugin_id))
}

fn plugin_file(state: &PluginState, plugin_id: &str, rel_path: &str) -> Result<PathBuf, String> {
    let dir = plugin_dir(state, plugin_id)?;
    let rel = safe_relative_path(rel_path)?;
    if rel.as_os_str().is_empty() {
        return Err("插件内相对路径不能为空".to_string());
    }
    Ok(dir.join(rel))
}

pub fn validate_plugin_id(plugin_id: &str) -> Result<(), String> {
    let valid = !plugin_id.is_empty()
        && !plugin_id.starts_with('.')
        && plugin_id
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '.'));
    if valid {
        Ok(())
    } else {
        Err(format!("非法插件 id: {plugin_id:?}"))
    }
}

fn safe_relative_path(raw: &str) -> Result<PathBuf, String> {
    let normalized = raw.replace('\\', "/");
    let mut path = PathBuf::new();
    for part in normalized.split('/') {
        if part.is_empty() || part == "." {
            continue;
        }
        if part == ".." {
            return Err(format!("非法相对路径（含 ..）: {raw}"));
        }
        if part.contains(':') {
            return Err(format!("非法相对路径（含盘符）: {raw}"));
        }
        path.push(part);
    }
    Ok(path)
}

fn read_index(root: &Path) -> Vec<String> {
    let path = root.join("index.json");
    let Ok(contents) = std::fs::read_to_string(&path) else {
        return Vec::new();
    };
    match serde_json::from_str::<Vec<String>>(&contents) {
        Ok(ids) => ids,
        Err(err) => {
            log::warn!("plugins/index.json 格式不对，忽略: {err}");
            Vec::new()
        }
    }
}

fn write_index(root: &Path, ids: &[String]) -> Result<(), String> {
    let path = root.join("index.json");
    let contents = serde_json::to_string_pretty(ids).map_err(|err| format!("序列化 index.json 失败: {err}"))?;
    let tmp = root.join("index.json.tmp");
    std::fs::write(&tmp, format!("{contents}\n"))
        .map_err(|err| format!("写 index.json 失败: {err}"))?;
    std::fs::rename(&tmp, &path).map_err(|err| format!("更新 index.json 失败: {err}"))
}

fn index_add(root: &Path, plugin_id: &str) -> Result<(), String> {
    let mut ids = read_index(root);
    if !ids.iter().any(|id| id == plugin_id) {
        ids.push(plugin_id.to_string());
        write_index(root, &ids)?;
    }
    Ok(())
}

fn index_remove(root: &Path, plugin_id: &str) -> Result<(), String> {
    let mut ids = read_index(root);
    let before = ids.len();
    ids.retain(|id| id != plugin_id);
    if ids.len() != before {
        write_index(root, &ids)?;
    }
    Ok(())
}

/// 常见打包方式：zip 里多一层顶层目录（`clock/manifest.json`）。去掉这一层。
/// 同时忽略 macOS 的 `__MACOSX/` 与 `._*` 垃圾文件。
fn strip_common_prefix(entries: Vec<zip::ZipEntry>) -> Result<Vec<zip::ZipEntry>, String> {
    let mut entries: Vec<zip::ZipEntry> = entries
        .into_iter()
        .filter(|entry| {
            let name = entry.name.replace('\\', "/");
            let first = name.split('/').next().unwrap_or("");
            first != "__MACOSX" && !name.starts_with("._") && !name.ends_with(".DS_Store")
        })
        .collect();

    let has_root_manifest = entries.iter().any(|entry| {
        let name = entry.name.replace('\\', "/");
        name.trim_start_matches('/') == "manifest.json"
    });
    if has_root_manifest {
        return Ok(entries);
    }

    let mut prefix: Option<String> = None;
    for entry in &entries {
        let name = entry.name.replace('\\', "/");
        let first = name
            .trim_start_matches('/')
            .split('/')
            .next()
            .unwrap_or("")
            .to_string();
        if first.is_empty() {
            continue;
        }
        match &prefix {
            None => prefix = Some(first),
            Some(existing) if *existing != first => {
                return Err("zip 结构不支持：没有根 manifest.json，且有多个顶层目录".to_string())
            }
            _ => {}
        }
    }

    if let Some(prefix) = prefix {
        for entry in &mut entries {
            let name = entry.name.replace('\\', "/");
            let stripped = name
                .trim_start_matches('/')
                .strip_prefix(&format!("{prefix}/"))
                .or_else(|| {
                    if name.trim_start_matches('/') == prefix {
                        Some("")
                    } else {
                        None
                    }
                })
                .unwrap_or(&name)
                .to_string();
            entry.name = stripped;
        }
    }
    Ok(entries)
}
