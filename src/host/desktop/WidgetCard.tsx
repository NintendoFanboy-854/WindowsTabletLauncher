/**
 * 桌面上的一个小组件卡片。
 *
 * 普通模式：iframe 占满卡片内容区，宿主只保留一圈很窄的材质边框（长按进编辑模式的手势区，
 * iframe 内部的指针事件不会冒泡给宿主，这是 iframe 隔离的代价）。
 * 编辑模式：卡片上方盖一层宿主控制的浮层，负责拖拽、删除、改尺寸、设置。
 */
import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import {
  Button,
  Card,
  Menu,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tooltip,
  tokens,
} from '@fluentui/react-components';
import { Delete20Regular, Resize20Regular, Settings20Regular } from '@fluentui/react-icons';
import type { HostBridge } from '../bridge';
import type { ThemePayload, WidgetInstance, WidgetSize } from '../bridge/types';
import type { GridMetrics } from '../layout';
import { CARD_MATERIAL, CARD_RADIUS, useStyles } from './desktop.styles';
import { LONG_PRESS_MS, LONG_PRESS_MOVE_TOLERANCE } from './interaction';
import { useLongPress } from './useLongPress';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetFrameHandle } from './WidgetFrame';

export interface WidgetCardProps {
  widget: WidgetInstance;
  metrics: GridMetrics;
  origin: { x: number; y: number };
  editMode: boolean;
  focused: boolean;
  dragging: boolean;
  /** 插件管理器生成的 iframe 地址（PluginManager.widgetFrameSrc） */
  src: string;
  /** 宿主桥接层（iframe 的 API 调用、焦点交接都经过它） */
  bridge: HostBridge;
  /** FluentProvider 现读的主题 token（插件 init 用） */
  theme?: ThemePayload;
  notify(text: string): void;
  onLongPress(widget: WidgetInstance): void;
  onTap(widget: WidgetInstance): void;
  onFocus(widget: WidgetInstance): void;
  onDelete(widget: WidgetInstance): void;
  onOpenSettings(widget: WidgetInstance): void;
  onChangeSize(widget: WidgetInstance, size: WidgetSize): void;
  onEditPointerDown(event: ReactPointerEvent<HTMLDivElement>, widget: WidgetInstance): void;
  /** 把 iframe 句柄登记给桌面层（Enter 进入组件时用 FocusPlugin） */
  registerFrameHandle(uid: string, handle: WidgetFrameHandle | null): void;
  registerNode(uid: string, node: HTMLDivElement | null): void;
}

export function WidgetCard({
  widget,
  metrics,
  origin,
  editMode,
  focused,
  dragging,
  src,
  bridge,
  theme,
  notify,
  onLongPress,
  onTap,
  onFocus,
  onDelete,
  onOpenSettings,
  onChangeSize,
  onEditPointerDown,
  registerFrameHandle,
  registerNode,
}: WidgetCardProps) {
  const styles = useStyles();
  const frameRef = useRef<WidgetFrameHandle>(null);

  useEffect(() => {
    registerFrameHandle(widget.uid, frameRef.current);
    return () => registerFrameHandle(widget.uid, null);
  }, [registerFrameHandle, widget.uid]);

  const longPress = useLongPress({
    delay: LONG_PRESS_MS,
    moveTolerance: LONG_PRESS_MOVE_TOLERANCE,
    onLongPress: () => onLongPress(widget),
    onTap: () => onTap(widget),
  });

  const [widthCells, heightCells] = widget.size;
  const x = origin.x + widget.col * (metrics.cell + metrics.gap);
  const y = origin.y + widget.row * (metrics.cell + metrics.gap);
  const width = widthCells * metrics.cell + (widthCells - 1) * metrics.gap;
  const height = heightCells * metrics.cell + (heightCells - 1) * metrics.gap;

  const cardStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: `translate(${x}px, ${y}px) scale(${editMode ? 0.97 : 1})`,
    width,
    height,
    padding: 0,
    gap: 0,
    borderRadius: CARD_RADIUS,
    ...CARD_MATERIAL,
    boxShadow: editMode ? tokens.shadow8 : tokens.shadow4,
  };

  const availableSizes = useMemo(() => {
    const seen = new Set<string>();
    const result: WidgetSize[] = [];
    for (const size of widget.sizes) {
      if (size[0] > metrics.columns || size[1] > metrics.rows) continue;
      const key = `${size[0]}x${size[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(size);
    }
    const currentKey = `${widget.size[0]}x${widget.size[1]}`;
    if (!seen.has(currentKey)) result.push([widget.size[0], widget.size[1]]);
    return result;
  }, [widget.sizes, widget.size, metrics.columns, metrics.rows]);

  return (
    <Card
      ref={(node: HTMLDivElement | null) => registerNode(widget.uid, node)}
      className={styles.card}
      style={cardStyle}
      tabIndex={focused ? 0 : -1}
      aria-label={`${widget.title} 小组件`}
      data-widget-card="true"
      data-widget-uid={widget.uid}
      data-widget-page={widget.page}
      onFocus={() => onFocus(widget)}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: tokens.spacingHorizontalSNudge,
        }}
        onPointerDown={longPress.onPointerDown}
        onPointerMove={longPress.onPointerMove}
        onPointerUp={longPress.onPointerUp}
        onPointerCancel={longPress.onPointerCancel}
      >
        <WidgetFrame
          ref={frameRef}
          bridge={bridge}
          theme={theme}
          instanceUid={widget.uid}
          pluginId={widget.pluginId}
          widgetId={widget.widgetId}
          src={src}
          size={widget.size}
          notify={notify}
        />
      </div>

      {editMode && (
        <div
          className={styles.editOverlay}
          data-widget-overlay="true"
          onPointerDown={(event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.closest('[data-card-controls]')) return;
            onEditPointerDown(event, widget);
          }}
        >
          <div
            className={styles.editControls}
            data-card-controls="true"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Tooltip content="删除" relationship="label">
              <Button
                size="small"
                appearance="subtle"
                icon={<Delete20Regular />}
                aria-label={`删除 ${widget.title}`}
                onClick={() => onDelete(widget)}
              />
            </Tooltip>
            <Menu
              defaultCheckedValues={{
                'widget-size': [`${widget.size[0]}x${widget.size[1]}`],
              }}
            >
              <MenuTrigger disableButtonEnhancement>
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<Resize20Regular />}
                  aria-label={`改变 ${widget.title} 的尺寸`}
                  title="改尺寸"
                />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {availableSizes.map((size) => (
                    <MenuItemRadio
                      key={`${size[0]}x${size[1]}`}
                      name="widget-size"
                      value={`${size[0]}x${size[1]}`}
                      onClick={() => onChangeSize(widget, size)}
                    >
                      {`${size[0]} × ${size[1]}`}
                    </MenuItemRadio>
                  ))}
                </MenuList>
              </MenuPopover>
            </Menu>
            <Tooltip content="设置" relationship="label">
              <Button
                size="small"
                appearance="subtle"
                icon={<Settings20Regular />}
                aria-label={`${widget.title} 设置`}
                onClick={() => onOpenSettings(widget)}
              />
            </Tooltip>
          </div>
        </div>
      )}
    </Card>
  );
}
