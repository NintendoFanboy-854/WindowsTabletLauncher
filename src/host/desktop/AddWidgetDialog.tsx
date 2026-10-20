/**
 * 编辑模式「添加组件」对话框（D-18 修订：删除持久化后的恢复入口）。
 *
 * 列出「已启用、但当前不在桌面」的小组件（标题 + 插件名 + 支持尺寸），每行一个
 * primary「添加」按钮；空态分两种：所有组件都在桌面 / 还有被禁用的插件需要先启用。
 *
 * 尺寸/触控：Fluent Dialog 自带进出动效与焦点管理；行高与按钮 ≥40（DESIGN §1.2）。
 * 宽度限制在 1024×768 里仍留出遮罩边距（92vw / 560px 取小）。
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
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';
import type { WidgetSize } from '../layout';
import { EmptyState } from '../pages/shared/EmptyState';

const useStyles = makeStyles({
  surface: {
    maxWidth: 'min(560px, 92vw)',
  },
  list: {
    display: 'grid',
    gap: tokens.spacingVerticalXS,
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minHeight: '56px',
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalS,
  },
  rowText: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  meta: {
    color: tokens.colorNeutralForeground3,
  },
});

export interface AddWidgetCandidate {
  /** pluginId:widgetId */
  key: string;
  pluginId: string;
  widgetId: string;
  title: string;
  pluginName: string;
  sizes: WidgetSize[];
}

export interface AddWidgetDialogProps {
  open: boolean;
  /** 已启用且不在桌面上的小组件；按插件目录顺序 */
  candidates: AddWidgetCandidate[];
  /** 有哪些“含小组件但被禁用”的插件：空态里提示去插件管理启用 */
  disabledPluginNames: string[];
  /** 返回 true = 添加成功，Dialog 关闭；false = 保持打开（插件不存在等异常由桌面层 toast） */
  onAdd(candidate: AddWidgetCandidate): boolean;
  onOpenChange(open: boolean): void;
}

function sizesLabel(sizes: WidgetSize[]): string {
  return sizes.map((size) => `${size[0]} × ${size[1]}`).join('、');
}

export function AddWidgetDialog({
  open,
  candidates,
  disabledPluginNames,
  onAdd,
  onOpenChange,
}: AddWidgetDialogProps) {
  const styles = useStyles();

  const add = (candidate: AddWidgetCandidate) => {
    if (onAdd(candidate)) onOpenChange(false);
  };

  const emptyState =
    disabledPluginNames.length > 0 ? (
      <EmptyState
        title="已启用的小组件都在桌面上了"
        description={`还有被禁用的插件：${disabledPluginNames.join('、')}。去「插件管理」启用后就能添加。`}
      />
    ) : (
      <EmptyState
        title="所有小组件都在桌面上了"
        description="没有可添加的小组件；需要腾位置时可在编辑模式删除卡片，再从这里放回。"
      />
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(_event, data) => onOpenChange(data.open)}
    >
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>添加组件</DialogTitle>
          <DialogContent>
            {candidates.length === 0 ? (
              emptyState
            ) : (
              <div className={styles.list} role="list" aria-label="可添加的小组件">
                {candidates.map((candidate) => (
                  <div key={candidate.key} className={styles.row} role="listitem">
                    <div className={styles.rowText}>
                      <Text size={400} weight="semibold">
                        {candidate.title}
                      </Text>
                      <Text size={200} className={styles.meta}>
                        {`${candidate.pluginName} · 支持 ${sizesLabel(candidate.sizes)}`}
                      </Text>
                    </div>
                    <Button
                      appearance="primary"
                      size="large"
                      icon={<Add20Regular />}
                      aria-label={`添加「${candidate.title}」`}
                      onClick={() => add(candidate)}
                    >
                      添加
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" size="large" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
