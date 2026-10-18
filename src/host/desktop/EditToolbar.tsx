/**
 * 编辑模式顶部工具栏（Fluent Toolbar）：
 * 增删页、左右移动当前页的顺序、完成退出。
 *
 * 常驻 DOM、用 `visible` 切换 opacity/transform 过渡（motionTokens），
 * 隐藏时 inert + pointer-events:none，不参与布局也不响应点击。
 */
import { Text, Toolbar, ToolbarButton, ToolbarDivider, mergeClasses } from '@fluentui/react-components';
import {
  Add20Regular,
  Checkmark20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  Delete20Regular,
} from '@fluentui/react-icons';
import { useStyles } from './desktop.styles';

interface EditToolbarProps {
  visible: boolean;
  pages: number;
  activePage: number;
  onAddPage(): void;
  onRemovePage(): void;
  onMovePage(from: number, to: number): void;
  onDone(): void;
}

export function EditToolbar({
  visible,
  pages,
  activePage,
  onAddPage,
  onRemovePage,
  onMovePage,
  onDone,
}: EditToolbarProps) {
  const styles = useStyles();

  return (
    <Toolbar
      className={mergeClasses(styles.toolbar, visible && styles.toolbarVisible)}
      aria-label="编辑桌面"
      aria-hidden={!visible}
      inert={!visible}
      data-no-desktop-gesture="true"
      size="small"
    >
      <ToolbarButton
        icon={<ChevronLeft20Regular />}
        aria-label="当前页左移"
        title="当前页左移"
        disabled={activePage <= 0}
        onClick={() => onMovePage(activePage, activePage - 1)}
      />
      <ToolbarButton
        icon={<ChevronRight20Regular />}
        aria-label="当前页右移"
        title="当前页右移"
        disabled={activePage >= pages - 1}
        onClick={() => onMovePage(activePage, activePage + 1)}
      />
      <Text className={styles.toolbarText}>{`第 ${activePage + 1} / ${pages} 页`}</Text>
      <ToolbarDivider />
      <ToolbarButton
        icon={<Add20Regular />}
        aria-label="添加一页"
        title="添加一页"
        onClick={onAddPage}
      />
      <ToolbarButton
        icon={<Delete20Regular />}
        aria-label="删除当前页"
        title="删除当前页"
        disabled={pages <= 1}
        onClick={onRemovePage}
      />
      <ToolbarDivider />
      <ToolbarButton
        appearance="primary"
        icon={<Checkmark20Regular />}
        onClick={onDone}
      >
        完成
      </ToolbarButton>
    </Toolbar>
  );
}
