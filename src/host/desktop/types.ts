/** 插件声明的小组件 */
export interface WidgetDecl {
  /** 小组件 id，插件内唯一 */
  id: string;
  title: string;
  /** 网格占用 [列, 行] */
  size: [number, number];
  /** 默认摆放位置 [列, 行]，不填则自动找空位 */
  cell?: [number, number];
}

/** 插件清单 */
export interface PluginManifest {
  id: string;
  name: string;
  version?: string;
  widgets: WidgetDecl[];
}

/** 桌面上的一个小组件实例 */
export interface WidgetInstance {
  uid: string;
  pluginId: string;
  widgetId: string;
  title: string;
  page: number;
  col: number;
  row: number;
  w: number;
  h: number;
}
