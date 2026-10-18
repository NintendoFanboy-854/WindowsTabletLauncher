//! 极简 zip 读取器（只做插件安装需要的事）。
//!
//! 只支持 store(0) 与 deflate(8)、不支持 zip64 / 加密 / 分卷 —— 插件包就是普通
//! 的小 zip，不引第三方 zip crate 是为了少一个依赖面。解压前会把条目读进内存，
//! 完全按中央目录给出的长度取数据，不信任 local header，避免 data descriptor 干扰。

use std::io::Read;

use flate2::read::DeflateDecoder;

const EOCD_SIG: u32 = 0x0605_4b50;
const CENTRAL_SIG: u32 = 0x0201_4b50;
const LOCAL_SIG: u32 = 0x0403_4b50;
const SIG_LEN: usize = 4;
const EOCD_MIN_LEN: usize = 22;
const MAX_COMMENT_LEN: usize = 0xffff;

/// zip 里的一个文件（目录条目已丢弃）
pub struct ZipEntry {
    pub name: String,
    pub data: Vec<u8>,
}

/// 读取 zip 的全部文件条目。失败返回人类可读的错误。
pub fn read_zip(path: &std::path::Path) -> Result<Vec<ZipEntry>, String> {
    let bytes = std::fs::read(path).map_err(|err| format!("读取 zip 失败: {err}"))?;
    let central = parse_central_directory(&bytes)?;
    let mut entries = Vec::with_capacity(central.len());
    for entry in central {
        if entry.is_dir {
            continue;
        }
        let data = extract(&bytes, &entry)?;
        entries.push(ZipEntry {
            name: entry.name,
            data,
        });
    }
    if entries.is_empty() {
        return Err("zip 里没有文件".to_string());
    }
    Ok(entries)
}

struct CentralEntry {
    name: String,
    method: u16,
    compressed_size: u32,
    uncompressed_size: u32,
    local_offset: u32,
    is_dir: bool,
}

fn parse_central_directory(bytes: &[u8]) -> Result<Vec<CentralEntry>, String> {
    let eocd = find_eocd(bytes).ok_or_else(|| "不是有效的 zip（找不到 EOCD）".to_string())?;
    let total = u32::from(read_u16(bytes, eocd + 10)?) as usize;
    let cd_offset = read_u32(bytes, eocd + 16)? as usize;

    let mut entries = Vec::with_capacity(total);
    let mut cursor = cd_offset;
    for index in 0..total {
        if read_u32(bytes, cursor)? != CENTRAL_SIG {
            return Err(format!("zip 中央目录损坏（第 {index} 条）"));
        }
        let flags = read_u16(bytes, cursor + 8)?;
        let method = read_u16(bytes, cursor + 10)?;
        let compressed_size = read_u32(bytes, cursor + 20)?;
        let uncompressed_size = read_u32(bytes, cursor + 24)?;
        let name_len = u32::from(read_u16(bytes, cursor + 28)?) as usize;
        let extra_len = u32::from(read_u16(bytes, cursor + 30)?) as usize;
        let comment_len = u32::from(read_u16(bytes, cursor + 32)?) as usize;
        let local_offset = read_u32(bytes, cursor + 42)?;

        let name_start = cursor + 46;
        let name_end = name_start
            .checked_add(name_len)
            .filter(|end| *end <= bytes.len())
            .ok_or_else(|| "zip 文件名越界".to_string())?;
        let raw_name = &bytes[name_start..name_end];
        // bit 11 = UTF-8 名称；没设置时按 UTF-8 宽松解（中文 zip 多半也会带这个位）
        let name = String::from_utf8_lossy(raw_name).into_owned();

        if method != 0 && method != 8 {
            return Err(format!("不支持 zip 压缩方式 {method}（{name}）"));
        }
        if compressed_size == u32::MAX || uncompressed_size == u32::MAX {
            return Err("不支持 zip64 格式".to_string());
        }

        entries.push(CentralEntry {
            is_dir: name.ends_with('/') || name.ends_with('\\'),
            name,
            method,
            compressed_size,
            uncompressed_size,
            local_offset,
        });

        let _ = flags; // 保留读取，说明 data descriptor 位不影响（长度以中央目录为准）
        cursor = name_end
            .checked_add(extra_len)
            .and_then(|pos| pos.checked_add(comment_len))
            .ok_or_else(|| "zip 中央目录越界".to_string())?;
    }
    Ok(entries)
}

fn extract(bytes: &[u8], entry: &CentralEntry) -> Result<Vec<u8>, String> {
    let header = entry.local_offset as usize;
    if read_u32(bytes, header)? != LOCAL_SIG {
        return Err(format!("zip 本地头损坏（{}）", entry.name));
    }
    let name_len = u32::from(read_u16(bytes, header + 26)?) as usize;
    let extra_len = u32::from(read_u16(bytes, header + 28)?) as usize;
    let data_start = header
        .checked_add(30 + name_len + extra_len)
        .ok_or_else(|| format!("zip 条目偏移越界（{}）", entry.name))?;
    let data_end = data_start
        .checked_add(entry.compressed_size as usize)
        .filter(|end| *end <= bytes.len())
        .ok_or_else(|| format!("zip 条目数据越界（{}）", entry.name))?;
    let raw = &bytes[data_start..data_end];

    match entry.method {
        0 => Ok(raw.to_vec()),
        8 => {
            let mut out = Vec::with_capacity(entry.uncompressed_size as usize);
            DeflateDecoder::new(raw)
                .read_to_end(&mut out)
                .map_err(|err| format!("解压失败（{}）: {err}", entry.name))?;
            Ok(out)
        }
        other => Err(format!("不支持 zip 压缩方式 {other}（{}）", entry.name)),
    }
}

fn find_eocd(bytes: &[u8]) -> Option<usize> {
    if bytes.len() < EOCD_MIN_LEN {
        return None;
    }
    let last = bytes.len() - EOCD_MIN_LEN;
    let first = last.saturating_sub(MAX_COMMENT_LEN);
    (first..=last)
        .rev()
        .find(|pos| read_u32(bytes, *pos).ok() == Some(EOCD_SIG))
}

fn read_u16(bytes: &[u8], offset: usize) -> Result<u16, String> {
    let slice = bytes
        .get(offset..offset + 2)
        .ok_or_else(|| "zip 数据截断".to_string())?;
    Ok(u16::from_le_bytes([slice[0], slice[1]]))
}

fn read_u32(bytes: &[u8], offset: usize) -> Result<u32, String> {
    let slice = bytes
        .get(offset..offset + SIG_LEN)
        .ok_or_else(|| "zip 数据截断".to_string())?;
    Ok(u32::from_le_bytes([slice[0], slice[1], slice[2], slice[3]]))
}
