/**
 * Agent 在桌面上的唯一入口：
 * - 右下角悬浮按钮
 * - 浮层 / 常驻侧栏 / 全屏面板（AgentPanel）
 * - 设置对话框
 * - 人脸唤醒：识别到注册的人脸 → 提示音 → 全屏语音 + 自动开始录音
 *
 * 宿主（App.tsx / 复盘页）只需要渲染 `<AgentSurface />`；需要自己控制入口时用
 * `open / onOpenChange / mode / onModeChange` 受控属性，并配合 `hideFab`。
 */

import { useEffect, useRef, useState } from 'react';
import { Button, makeStyles, tokens } from '@fluentui/react-components';
import { SparkleRegular } from '@fluentui/react-icons';
import { useAgentSession, type AgentSeed, type AgentSession } from '../hooks/useAgentSession';
import { useViewportWidth } from '../hooks/useViewportWidth';
import { faceService } from '../face/faceService';
import { playWakeChime } from '../voice/chime';
import { AGENT_PANEL_WIDTH, SIDEBAR_MIN_WIDTH, type AgentTransport, type PanelMode } from '../types';
import { AgentPanel } from './AgentPanel';
import { SettingsDialog } from './SettingsDialog';

const useStyles = makeStyles({
  fab: {
    position: 'fixed',
    insetInlineEnd: tokens.spacingHorizontalXXL,
    insetBlockEnd: tokens.spacingVerticalXXL,
    zIndex: 21,
    boxShadow: tokens.shadow16,
  },
});

export interface AgentSurfaceProps {
  /** 注入传输层（测试或截图用）；不传按 URL 参数创建 */
  transport?: AgentTransport;
  /** 测试或截图用的初始会话 */
  seed?: AgentSeed;
  /** 受控：面板是否打开 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 受控：面板形态（不传按设置） */
  mode?: PanelMode;
  onModeChange?: (mode: PanelMode) => void;
  /** 隐藏右下角入口按钮（宿主自建入口时） */
  hideFab?: boolean;
  /** 测试或截图：初始打开设置对话框 */
  defaultSettingsOpen?: boolean;
}

export function AgentSurface({
  transport,
  seed,
  open,
  onOpenChange,
  mode,
  onModeChange,
  hideFab,
  defaultSettingsOpen,
}: AgentSurfaceProps) {
  const styles = useStyles();
  const session = useAgentSession({ transport, seed });
  const viewportWidth = useViewportWidth();
  const [internalOpen, setInternalOpen] = useState(defaultSettingsOpen ?? false);
  const [settingsOpen, setSettingsOpen] = useState(defaultSettingsOpen ?? false);
  const sessionRef = useRef<AgentSession>(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const controlledOpen = open !== undefined;
  const panelOpen = controlledOpen ? open : internalOpen;
  const setPanelOpen = (next: boolean) => {
    if (!controlledOpen) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const requestedMode = mode ?? session.settings.panelMode;
  const effectiveMode: PanelMode = session.voice.active
    ? 'fullscreen'
    : requestedMode === 'sidebar' && viewportWidth < SIDEBAR_MIN_WIDTH
      ? 'overlay'
      : requestedMode;

  const wideSidebar = requestedMode === 'sidebar' && viewportWidth >= SIDEBAR_MIN_WIDTH;

  // 侧栏占用桌面宽度：把宽度写成 CSS 变量，桌面层可用它让出空间
  useEffect(() => {
    const root = document.documentElement;
    if (wideSidebar && panelOpen && !session.voice.active) {
      root.style.setProperty('--wtsl-agent-panel-width', AGENT_PANEL_WIDTH);
      root.dataset.agentPanel = 'sidebar';
    } else {
      root.style.removeProperty('--wtsl-agent-panel-width');
      delete root.dataset.agentPanel;
    }
    return () => {
      root.style.removeProperty('--wtsl-agent-panel-width');
      delete root.dataset.agentPanel;
    };
  }, [wideSidebar, panelOpen, session.voice.active]);

  // 切成侧栏/全屏时确保面板展开
  useEffect(() => {
    if (session.settings.panelMode !== 'overlay' && !panelOpen) setPanelOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.settings.panelMode]);

  // 语音交互自动切全屏（由 AgentPanel 依据 voice.active 渲染），这里保证面板打开
  useEffect(() => {
    if (session.voice.active && !panelOpen) setPanelOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.voice.active]);

  // 人脸唤醒：只在启用状态、阈值或样本数量变化时重建识别循环，
  // 避免改其他设置（如输 API Key）时反复重启摄像头
  useEffect(() => {
    const faceSettings = session.settings.face;
    if (!faceSettings.enabled || faceSettings.descriptors.length === 0) {
      faceService.stopWatch();
      return;
    }
    const controller = new AbortController();
    void faceService.startWatch({
      samples: faceSettings.descriptors,
      threshold: faceSettings.threshold,
      signal: controller.signal,
      onMatch: () => {
        const current = sessionRef.current;
        // 正在对话/已经在语音里时不打断
        if (current.status !== 'idle' || current.voice.active) return;
        playWakeChime();
        current.enterVoice();
        window.setTimeout(() => {
          void sessionRef.current.startRecording();
        }, 600);
      },
    });
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session.settings.face.enabled,
    session.settings.face.threshold,
    session.settings.face.descriptors.length,
  ]);

  useEffect(
    () => () => {
      faceService.stopWatch();
    },
    [],
  );

  // 全屏/语音下 Esc 关闭
  useEffect(() => {
    if (!panelOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || effectiveMode === 'overlay') return;
      if (sessionRef.current.voice.active) sessionRef.current.exitVoice();
      else setPanelOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [panelOpen, effectiveMode]);

  const handleModeChange = (next: PanelMode) => {
    if (onModeChange) onModeChange(next);
    else session.updateSettings({ panelMode: next });
    if (next !== 'overlay') setPanelOpen(true);
  };

  return (
    <>
      <AgentPanel
        session={session}
        mode={effectiveMode}
        open={panelOpen || session.voice.active}
        onOpenChange={setPanelOpen}
        onModeChange={handleModeChange}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      {!hideFab && !panelOpen && !session.voice.active ? (
        <Button
          className={styles.fab}
          shape="circular"
          size="large"
          appearance="primary"
          icon={<SparkleRegular />}
          onClick={() => setPanelOpen(true)}
          aria-label="打开 Agent 助手"
          title="Agent 助手"
        />
      ) : null}
      <SettingsDialog
        session={session}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
