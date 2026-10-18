/**
 * 对话主视图：标题栏（会话 / 形态 / 连续朗读 / 设置）+ 消息列表 + 输入区。
 * 浮层、侧栏、全屏（文字模式）三种容器共用这个组件，所以切换形态不会丢状态。
 */

import { type ReactElement } from 'react';
import {
  Badge,
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  Title3,
  ToggleButton,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowLeftRegular,
  BotRegular,
  CheckmarkRegular,
  DismissRegular,
  FullScreenMaximizeRegular,
  HistoryRegular,
  PanelRightRegular,
  PanelRightContractRegular,
  SettingsRegular,
  Speaker2Regular,
  SpeakerMuteRegular,
} from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';
import { useViewportWidth } from '../hooks/useViewportWidth';
import { Composer } from './Composer';
import { MessageList } from './MessageList';
import { SIDEBAR_MIN_WIDTH, type PanelMode } from '../types';
import { MIMO_MODELS } from '../types';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
  // 全屏：外层用更暗的页面背景，中间对话列用背景 1 区分，不再画左右竖线
  fullscreenShell: {
    backgroundColor: tokens.colorNeutralBackground2,
  },
  fullscreenInner: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    width: '100%',
    maxWidth: '880px',
    marginInline: 'auto',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalM,
    // DENSITY：标题栏与内容之间用留白分组，不用 1px 分割线
    minHeight: '56px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  modelBadge: {
    flexShrink: 0,
  },
});

function modelLabel(session: AgentSession): string {
  if (session.isMock) return '演示模式';
  const model = MIMO_MODELS.find((item) => item.value === session.settings.model);
  return model?.label.replace('MiMo V2.6 ', 'V2.6 ') ?? session.settings.model;
}

const PANEL_MODE_ITEMS: Array<{
  mode: PanelMode;
  label: string;
  icon: ReactElement;
  needsWide?: boolean;
}> = [
  { mode: 'overlay', label: '浮层', icon: <PanelRightRegular /> },
  { mode: 'sidebar', label: '常驻侧栏', icon: <PanelRightContractRegular />, needsWide: true },
  { mode: 'fullscreen', label: '全屏', icon: <FullScreenMaximizeRegular /> },
];

export interface ConversationPaneProps {
  session: AgentSession;
  /** panel = 浮层/侧栏；fullscreen = 文字全屏 */
  layout: 'panel' | 'fullscreen';
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function ConversationPane({
  session,
  layout,
  mode,
  onModeChange,
  onClose,
  onOpenSettings,
}: ConversationPaneProps) {
  const styles = useStyles();
  const viewportWidth = useViewportWidth();
  const reading = session.settings.tts.continuous;
  const canSidebar = viewportWidth >= SIDEBAR_MIN_WIDTH;

  const header = (
    <div className={styles.header}>
      {layout === 'fullscreen' ? (
        <Button
          size="large"
          appearance="subtle"
          icon={<ArrowLeftRegular />}
          onClick={onClose}
          aria-label="退出全屏"
          title="退出全屏"
        />
      ) : null}
      <div className={styles.headerTitle}>
        <BotRegular fontSize={20} />
        <Title3 style={{ whiteSpace: 'nowrap' }}>Agent</Title3>
        <Badge appearance="tint" color={session.isMock ? 'warning' : 'brand'} className={styles.modelBadge}>
          {modelLabel(session)}
        </Badge>
      </div>
      <div className={styles.headerActions}>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button
              size="large"
              appearance="subtle"
              icon={<HistoryRegular />}
              aria-label="会话历史"
              title="会话历史"
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<BotRegular />} onClick={session.newConversation}>
                新建对话
              </MenuItem>
              {session.conversations.map((conversation) => (
                <MenuItem
                  key={conversation.id}
                  icon={
                    conversation.id === session.conversation?.id ? (
                      <CheckmarkRegular />
                    ) : undefined
                  }
                  onClick={() => session.selectConversation(conversation.id)}
                >
                  <Text truncate>{conversation.title}</Text>
                </MenuItem>
              ))}
              {session.conversation ? (
                <MenuItem
                  icon={<DismissRegular />}
                  onClick={() => session.deleteConversation(session.conversation!.id)}
                >
                  删除当前对话
                </MenuItem>
              ) : null}
            </MenuList>
          </MenuPopover>
        </Menu>

        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button
              size="large"
              appearance="subtle"
              icon={mode === 'fullscreen' ? <FullScreenMaximizeRegular /> : <PanelRightRegular />}
              aria-label="切换面板形态"
              title="切换面板形态"
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {PANEL_MODE_ITEMS.map((item) => (
                <MenuItem
                  key={item.mode}
                  icon={item.mode === mode ? <CheckmarkRegular /> : item.icon}
                  disabled={item.needsWide ? !canSidebar : false}
                  onClick={() => onModeChange(item.mode)}
                >
                  {item.label}
                  {item.needsWide && !canSidebar ? '（需要 ≥ 1280 宽度）' : ''}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>

        <ToggleButton
          size="large"
          appearance="subtle"
          icon={reading ? <SpeakerMuteRegular /> : <Speaker2Regular />}
          checked={reading}
          onClick={session.toggleContinuousReading}
          aria-label={reading ? '关闭连续朗读' : '开启连续朗读'}
          title={reading ? '关闭连续朗读' : '连续朗读：点一次后每条回答自动读'}
        />

        <Button
          size="large"
          appearance="subtle"
          icon={<SettingsRegular />}
          onClick={onOpenSettings}
          aria-label="Agent 设置"
          title="Agent 设置"
        />

        <Button
          size="large"
          appearance="subtle"
          icon={<DismissRegular />}
          onClick={onClose}
          aria-label="关闭 Agent"
          title="关闭 Agent"
        />
      </div>
    </div>
  );

  const content = (
    <>
      {header}
      <MessageList session={session} />
      <Composer session={session} onOpenSettings={onOpenSettings} />
    </>
  );

  if (layout === 'fullscreen') {
    return (
      <div className={`${styles.root} ${styles.fullscreenShell}`}>
        <div className={styles.fullscreenInner}>{content}</div>
      </div>
    );
  }
  return <div className={styles.root}>{content}</div>;
}
