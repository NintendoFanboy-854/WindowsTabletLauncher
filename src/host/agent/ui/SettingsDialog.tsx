/**
 * Agent 设置：模型与 Key、面板形态、语音（音色/语速/连续朗读）、人脸唤醒、联网搜索。
 * 所有项即改即存（`agent.settings`），没有“保存”按钮。
 */

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Divider,
  Dropdown,
  Field,
  Input,
  Label,
  Option,
  Slider,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';
import { useViewportWidth } from '../hooks/useViewportWidth';
import {
  MIMO_BASE_URL,
  MIMO_MODELS,
  SIDEBAR_MIN_WIDTH,
  TTS_VOICES,
  type PanelMode,
} from '../types';
import { FaceSetup } from './FaceSetup';

const useStyles = makeStyles({
  surface: {
    maxWidth: '720px',
    width: 'min(720px, 94vw)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxHeight: '70vh',
    overflowY: 'auto',
    paddingInlineEnd: tokens.spacingHorizontalXS,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  sectionTitle: {
    color: tokens.colorNeutralForeground2,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  inline: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  sliderValue: {
    minWidth: '48px',
    textAlign: 'end',
  },
});

const PANEL_MODE_OPTIONS: Array<{ value: PanelMode; label: string }> = [
  { value: 'overlay', label: '浮层（默认，右侧滑出）' },
  { value: 'sidebar', label: '常驻侧栏（大屏 ≥ 1280）' },
  { value: 'fullscreen', label: '全屏' },
];

function panelModeLabel(mode: PanelMode): string {
  return PANEL_MODE_OPTIONS.find((item) => item.value === mode)?.label ?? mode;
}

export function SettingsDialog({
  session,
  open,
  onClose,
}: {
  session: AgentSession;
  open: boolean;
  onClose: () => void;
}) {
  const styles = useStyles();
  const { settings } = session;
  const viewportWidth = useViewportWidth();
  const canSidebar = viewportWidth >= SIDEBAR_MIN_WIDTH;
  const sidebarFallback = settings.panelMode === 'sidebar' && !canSidebar;

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
    >
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                icon={<DismissRegular />}
                aria-label="关闭 Agent 设置"
                onClick={onClose}
              />
            }
          >
            Agent 设置
          </DialogTitle>
          <DialogContent className={styles.content}>
            {/* ---------- 模型 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                模型
              </Text>
              <Field label="模型" hint={MIMO_MODELS.find((item) => item.value === settings.model)?.hint}>
                <Dropdown
                  value={MIMO_MODELS.find((item) => item.value === settings.model)?.label ?? ''}
                  selectedOptions={[settings.model]}
                  onOptionSelect={(_, data) => {
                    const next = MIMO_MODELS.find((item) => item.value === data.optionValue);
                    if (next) session.updateSettings({ model: next.value });
                  }}
                >
                  {MIMO_MODELS.map((item) => (
                    <Option key={item.value} value={item.value} text={item.label}>
                      {item.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              <Field
                label="MiMo API Key"
                hint="只保存在本机 localStorage；请求直接发往 https://api.xiaomimimo.com"
              >
                <Input
                  type="password"
                  value={settings.mimo.apiKey}
                  placeholder="sk-…"
                  onChange={(_, data) => session.updateSettings({ mimo: { apiKey: data.value } })}
                />
              </Field>
              <Field label="Base URL" hint={`默认 ${MIMO_BASE_URL}；Token Plan 可换成专属地址`}>
                <Input
                  value={settings.mimo.baseUrl}
                  onChange={(_, data) => session.updateSettings({ mimo: { baseUrl: data.value } })}
                />
              </Field>
              <div className={styles.inline}>
                <Switch
                  checked={settings.thinking}
                  onChange={(_, data) => session.updateSettings({ thinking: data.checked })}
                  label="深度思考（thinking）"
                />
                <Switch
                  checked={settings.mock}
                  onChange={(_, data) => session.updateSettings({ mock: data.checked })}
                  label="Mock 演示模式（不发真实请求）"
                />
              </div>
            </div>

            <Divider />

            {/* ---------- 面板 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                面板
              </Text>
              <Field
                label="形态"
                hint={
                  sidebarFallback
                    ? '当前窗口不足 1280，常驻侧栏会退化为浮层。'
                    : '三种形态共用同一份对话状态，切换不断话；语音交互会自动切全屏。'
                }
              >
                <Dropdown
                  value={panelModeLabel(settings.panelMode)}
                  selectedOptions={[settings.panelMode]}
                  onOptionSelect={(_, data) => {
                    const next = PANEL_MODE_OPTIONS.find((item) => item.value === data.optionValue);
                    if (next && !(next.value === 'sidebar' && !canSidebar)) {
                      session.updateSettings({ panelMode: next.value });
                    }
                  }}
                >
                  {PANEL_MODE_OPTIONS.map((item) => (
                    <Option
                      key={item.value}
                      value={item.value}
                      text={item.label}
                      disabled={item.value === 'sidebar' && !canSidebar}
                    >
                      {item.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
            </div>

            <Divider />

            {/* ---------- 语音 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                语音
              </Text>
              <div className={styles.inline}>
                <Switch
                  checked={settings.tts.autoPlay}
                  onChange={(_, data) => session.updateSettings({ tts: { autoPlay: data.checked } })}
                  label="每条新回复自动朗读一次"
                />
                <Switch
                  checked={settings.tts.continuous}
                  onChange={(_, data) =>
                    session.updateSettings({ tts: { continuous: data.checked } })
                  }
                  label="连续朗读（持久化）"
                />
              </div>
              <Text size={200} className={styles.hint}>
                点标题栏喇叭一次会打开连续朗读：本条读完，之后每条回复都自动读；再点一次停止。
                状态存在本地，重启后沿用。
              </Text>
              <Field label="音色">
                <Dropdown
                  value={
                    TTS_VOICES.find((item) => item.value === settings.tts.voice)?.label ?? settings.tts.voice
                  }
                  selectedOptions={[settings.tts.voice]}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) {
                      session.updateSettings({ tts: { voice: data.optionValue } });
                    }
                  }}
                >
                  {TTS_VOICES.map((item) => (
                    <Option key={item.value} value={item.value} text={item.label}>
                      {item.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              <div className={styles.inline}>
                <Label style={{ minWidth: '48px' }}>语速</Label>
                <Slider
                  style={{ flex: 1, minWidth: '160px' }}
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={settings.tts.rate}
                  onChange={(_, data) => session.updateSettings({ tts: { rate: data.value } })}
                />
                <Text className={styles.sliderValue}>{settings.tts.rate.toFixed(1)}×</Text>
              </div>
            </div>

            <Divider />

            {/* ---------- 人脸 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                人脸唤醒
              </Text>
              <FaceSetup settings={settings} onUpdate={session.updateSettings} />
            </div>

            <Divider />

            {/* ---------- 联网搜索 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                联网搜索
              </Text>
              <Field
                label="Tavily API Key"
                hint="内置 web.search 用 Tavily 实现；没配 Key 时工具会返回“未配置搜索服务”。"
              >
                <Input
                  type="password"
                  value={settings.search.apiKey}
                  placeholder="tvly-…"
                  onChange={(_, data) =>
                    session.updateSettings({ search: { apiKey: data.value } })
                  }
                />
              </Field>
              <Text size={200} className={styles.hint}>
                搜索路由由模型判断：只有需要实时信息（新闻、价格、最新消息）才调用；
                回答必须带来源链接，来源会显示在回答下方。
              </Text>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onClose}>
              完成
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
