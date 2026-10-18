/**
 * 组件设置弹窗：编辑模式下按「设置」或按 Enter 打开。
 *
 * 这里只展示宿主掌握的组件信息；插件自己的配置面板要等桥接层（A5）接通
 * postMessage 后再挂进来，当前不伪造插件配置项。
 */
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Text,
} from '@fluentui/react-components';
import type { WidgetInstance, WidgetSize } from '../bridge/types';
import { useStyles } from './desktop.styles';

interface WidgetSettingsDialogProps {
  widget: WidgetInstance | null;
  metrics: { columns: number; rows: number };
  onChangeSize(widget: WidgetInstance, size: WidgetSize): void;
  onClose(): void;
}

export function WidgetSettingsDialog({
  widget,
  onClose,
}: WidgetSettingsDialogProps) {
  const styles = useStyles();
  if (!widget) return null;

  const sizeText = widget.sizes
    .map((size) => `${size[0]} × ${size[1]}`)
    .join('、');

  return (
    <Dialog
      open
      onOpenChange={(_event, data) => {
        if (!data.open) onClose();
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{`${widget.title} 设置`}</DialogTitle>
          <DialogContent>
            <div className={styles.dialogText}>
              <Text size={200}>{`插件：${widget.pluginId}`}</Text>
              <Text size={200}>{`组件：${widget.widgetId}`}</Text>
              <Text size={200}>{`当前尺寸：${widget.size[0]} × ${widget.size[1]}`}</Text>
              <Text size={200}>{`支持尺寸：${sizeText || '未声明'}`}</Text>
              <Text size={200}>
                插件自己的配置面板由桥接层接入后显示在这里；尺寸可以在卡片右上角的「改尺寸」里切换。
              </Text>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              关闭
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
