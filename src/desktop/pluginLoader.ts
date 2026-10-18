import type { PluginManifest, WidgetInstance } from './types';

const BASE = '/plugins/';

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** 读 plugins/index.json，逐个加载插件清单；坏插件直接跳过 */
export async function loadPlugins(): Promise<PluginManifest[]> {
  const ids = await getJson<string[]>(`${BASE}index.json`);
  if (!ids) return [];

  const plugins: PluginManifest[] = [];
  for (const id of ids) {
    const manifest = await getJson<PluginManifest>(`${BASE}${id}/manifest.json`);
    if (manifest && Array.isArray(manifest.widgets)) plugins.push(manifest);
  }
  return plugins;
}

/** 把插件声明转成桌面上的小组件实例，并做简单的自动摆放 */
export function createInstances(plugins: PluginManifest[], cols: number, rows: number): WidgetInstance[] {
  const instances: WidgetInstance[] = [];
  const occupied = new Set<string>();

  const free = (col: number, row: number, w: number, h: number) => {
    for (let c = col; c < col + w; c++) {
      for (let r = row; r < row + h; r++) {
        if (occupied.has(`${c}:${r}`)) return false;
      }
    }
    return true;
  };
  const occupy = (col: number, row: number, w: number, h: number) => {
    for (let c = col; c < col + w; c++) {
      for (let r = row; r < row + h; r++) occupied.add(`${c}:${r}`);
    }
  };

  for (const plugin of plugins) {
    for (const decl of plugin.widgets) {
      const w = Math.max(1, Math.min(cols, decl.size[0]));
      const h = Math.max(1, Math.min(rows, decl.size[1]));

      let col = decl.cell?.[0] ?? -1;
      let row = decl.cell?.[1] ?? -1;
      if (col < 0 || row < 0 || col + w > cols || row + h > rows || !free(col, row, w, h)) {
        col = -1;
        row = -1;
        outer: for (let r = 0; r + h <= rows; r++) {
          for (let c = 0; c + w <= cols; c++) {
            if (free(c, r, w, h)) {
              col = c;
              row = r;
              break outer;
            }
          }
        }
      }
      if (col < 0 || row < 0) continue; // 桌面放不下了，先不摆

      occupy(col, row, w, h);
      instances.push({
        uid: `${plugin.id}:${decl.id}`,
        pluginId: plugin.id,
        widgetId: decl.id,
        title: decl.title,
        page: 0,
        col,
        row,
        w,
        h,
      });
    }
  }

  return instances;
}
