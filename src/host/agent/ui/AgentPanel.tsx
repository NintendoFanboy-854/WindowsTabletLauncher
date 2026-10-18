/**
 * Agent 面板容器：浮层（OverlayDrawer）/ 常驻侧栏 / 全屏三种形态，
 * 内部共用 ConversationPane / VoiceStage，所以切换形态不丢对话。
 */

import {
  DrawerBody,
  OverlayDrawer,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import './agent.css';
import type { AgentSession } from '../hooks/useAgentSession';
import { AGENT_PANEL_WIDTH, type PanelMode } from '../types';
import { ConversationPane } from './ConversationPane';
import { VoiceStage } from './VoiceStage';

const useStyles = makeStyles({
  sidebar: {
    position: 'fixed',
    insetBlock: 0,
    insetInlineEnd: 0,
    width: AGENT_PANEL_WIDTH,
    maxWidth: '92vw',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 20,
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: tokens.colorNeutralStroke2,
    boxShadow: tokens.shadow16,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  fullscreen: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 20,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    overflow: 'hidden',
  },
});

export interface AgentPanelProps {
  session: AgentSession;
  /** 生效中的形态（侧栏在窄窗口时由调用方降级为 overlay） */
  mode: PanelMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: PanelMode) => void;
  onOpenSettings: () => void;
}

export function AgentPanel({
  session,
  mode,
  open,
  onOpenChange,
  onModeChange,
  onOpenSettings,
}: AgentPanelProps) {
  const styles = useStyles();
  const voiceActive = session.voice.active;

  if (!open && !voiceActive) return null;

  if (mode === 'fullscreen' || voiceActive) {
    return (
      <div className={styles.fullscreen} role="dialog" aria-modal="true" aria-label="Agent">
        {voiceActive ? (
          <VoiceStage
            session={session}
            onExit={() => {
              // 退出语音后回到原来的面板形态，面板保持打开（切换形态不丢对话）
              session.exitVoice();
            }}
            onOpenSettings={onOpenSettings}
          />
        ) : (
          <ConversationPane
            session={session}
            layout="fullscreen"
            mode={mode}
            onModeChange={onModeChange}
            onClose={() => onOpenChange(false)}
            onOpenSettings={onOpenSettings}
          />
        )}
      </div>
    );
  }

  if (mode === 'sidebar') {
    return (
      <aside className={styles.sidebar} aria-label="Agent 侧栏">
        <ConversationPane
          session={session}
          layout="panel"
          mode={mode}
          onModeChange={onModeChange}
          onClose={() => onOpenChange(false)}
          onOpenSettings={onOpenSettings}
        />
      </aside>
    );
  }

  return (
    <OverlayDrawer
      open={open}
      position="end"
      size="small"
      modalType="non-modal"
      onOpenChange={(_, data) => onOpenChange(data.open)}
      style={{ width: AGENT_PANEL_WIDTH, maxWidth: '92vw' }}
      aria-label="Agent 浮层面板"
    >
      <DrawerBody className={styles.drawerBody}>
        <ConversationPane
          session={session}
          layout="panel"
          mode={mode}
          onModeChange={onModeChange}
          onClose={() => onOpenChange(false)}
          onOpenSettings={onOpenSettings}
        />
      </DrawerBody>
    </OverlayDrawer>
  );
}
