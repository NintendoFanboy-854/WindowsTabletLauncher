import { useEffect, useRef, useState } from 'react';
import type { WidgetInstance } from './types';
import { createInstances, loadPlugins } from '../plugins/loader';
import WidgetFrame from './WidgetFrame';

const COLS = 8;
const ROWS = 5;
const STORAGE_KEY = 'wtsl.layout.v1';

interface Props {
  notify: (text: string) => void;
}

interface DragState {
  uid: string;
  pointerId: number;
  startX: number;
  startY: number;
  startCol: number;
  startRow: number;
  cellW: number;
  cellH: number;
}

export default function Desktop({ notify }: Props) {
  const [widgets, setWidgets] = useState<WidgetInstance[] | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as WidgetInstance[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWidgets(parsed);
            return;
          }
        } catch {
          /* 存档坏了就重新生成 */
        }
      }
      const plugins = await loadPlugins();
      if (!cancelled) setWidgets(createInstances(plugins, COLS, ROWS));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (widgets) localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const resetLayout = async () => {
    localStorage.removeItem(STORAGE_KEY);
    const plugins = await loadPlugins();
    setWidgets(createInstances(plugins, COLS, ROWS));
    notify('布局已重置');
  };

  const onHeadPointerDown = (widget: WidgetInstance) => (event: React.PointerEvent<HTMLElement>) => {
    const grid = gridRef.current;
    if (!grid || event.button !== 0) return;
    const rect = grid.getBoundingClientRect();
    dragRef.current = {
      uid: widget.uid,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startCol: widget.col,
      startRow: widget.row,
      cellW: rect.width / COLS,
      cellH: rect.height / ROWS,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const onHeadPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dCol = Math.round((event.clientX - drag.startX) / drag.cellW);
    const dRow = Math.round((event.clientY - drag.startY) / drag.cellH);

    setWidgets((prev) => {
      if (!prev) return prev;
      return prev.map((widget) => {
        if (widget.uid !== drag.uid) return widget;
        const col = Math.max(0, Math.min(COLS - widget.w, drag.startCol + dCol));
        const row = Math.max(0, Math.min(ROWS - widget.h, drag.startRow + dRow));
        if (col === widget.col && row === widget.row) return widget;
        return { ...widget, col, row };
      });
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className="desktop">
      <div
        className="desktop-grid"
        ref={gridRef}
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {widgets?.map((widget) => (
          <section
            key={widget.uid}
            className="widget"
            style={{
              gridColumn: `${widget.col + 1} / span ${widget.w}`,
              gridRow: `${widget.row + 1} / span ${widget.h}`,
            }}
          >
            <header
              className="widget-head"
              onPointerDown={onHeadPointerDown(widget)}
              onPointerMove={onHeadPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <span className="widget-title">{widget.title}</span>
            </header>
            <WidgetFrame pluginId={widget.pluginId} widgetId={widget.widgetId} onNotify={notify} />
          </section>
        ))}
      </div>

      {!widgets && <div className="desktop-hint">正在加载插件…</div>}
      {widgets && widgets.length === 0 && <div className="desktop-hint">没有找到插件，检查 public/plugins/index.json</div>}

      <button type="button" className="reset-layout" onClick={resetLayout}>
        重置布局
      </button>
    </div>
  );
}
