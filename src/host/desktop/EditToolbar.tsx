/**
 * 编辑模式顶部工具栏（Fluent Toolbar）：
 * 增删页、左右移动当前页的顺序、完成退出。
 *
 * 常驻 DOM、用 `visible` 切换 opacity/transform 过渡（motionTokens），
 * 隐藏时 inert + pointer-events:none，不参与布局也不响应点击。
 *
 * 触控：ToolbarButton 没有 size 入口（Fluent v9），按钮内部改用 Button size="large"
 * 保证 ≥40×40（DESIGN §1.2 / AUDIT V-06）。
 */
import { Button, Text, Toolbar, ToolbarDivider, mergeClasses } from '@fluentui/react-components';
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
    >
      <Button
        size="large"
        appearance="subtle"
        icon={<ChevronLeft20Regular />}
        aria-label="当前页左移"
        title="当前页左移"
        disabled={activePage <= 0}
        onClick={() => onMovePage(activePage, activePage - 1)}
      />
      <Button
        size="large"
        appearance="subtle"
        icon={<ChevronRight20Regular />}
        aria-label="当前页右移"
        title="当前页右移"
        disabled={activePage >= pages - 1}
        onClick={() => onMovePage(activePage, activePage + 1)}
      />
      <Text className={styles.toolbarText}>{`第 ${activePage + 1} / ${pages} 页`}</Text>
      <ToolbarDivider />
      <Button
        size="large"
        appearance="subtle"
        icon={<Add20Regular />}
        aria-label="添加一页"
        title="添加一页"
        onClick={onAddPage}
      />
      <Button
        size="large"
        appearance="subtle"
        icon={<Delete20Regular />}
        aria-label="删除当前页"
        title="删除当前页"
        disabled={pages <= 1}
        onClick={onRemovePage}
      />
      <ToolbarDivider />
      <Button size="large" appearance="primary" icon={<Checkmark20Regular />} onClick={onDone}>
        完成
      </Button>
    </Toolbar>
  );
}
