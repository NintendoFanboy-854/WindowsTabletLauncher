/**
 * Agent 设置：模型与 Key、面板形态、语音（音色/语速/连续朗读）、人脸唤醒、联网搜索。
 * 所有项即改即存（`agent.settings`），没有“保存”按钮。
 *
 * 文案面向普通用户：工程术语（base URL / thinking / force_search / 持久化）下沉到
 * “高级设置”或换成中文说明，避免把实现细节暴露在主界面。
 */

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  Input,
  Label,
  Link,
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
  MIMO_PLUGIN_CONSOLE_URL,
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
    gap: tokens.spacingVerticalXXL,
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
  // 开关行至少 40px 高，保证平板触控目标
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '40px',
    gap: tokens.spacingHorizontalS,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '40px',
    gap: tokens.spacingHorizontalS,
  },
  sliderValue: {
    minWidth: '48px',
    textAlign: 'end',
  },
  // Fluent 的 Switch/Slider 默认 32px，加 className 把可点击区域抬到 40px
  control40: {
    minHeight: '40px',
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
                size="large"
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
              <Field
                label="模型"
                hint={MIMO_MODELS.find((item) => item.value === settings.model)?.hint}
              >
                <Dropdown size="large"
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
              <Field label="MiMo API Key" hint="只保存在这台设备上，不会上传或同步到其他地方。">
                <Input size="large"
                  type="password"
                  value={settings.mimo.apiKey}
                  placeholder="sk-…"
                  onChange={(_, data) => session.updateSettings({ mimo: { apiKey: data.value } })}
                />
              </Field>
              <Accordion collapsible>
                <AccordionItem value="advanced">
                  <AccordionHeader size="large">高级设置</AccordionHeader>
                  <AccordionPanel>
                    <Field
                      label="服务地址"
                      hint={`默认使用 MiMo 官方服务（${MIMO_BASE_URL}）；只有使用专属套餐时才需要修改。`}
                    >
                      <Input size="large"
                        value={settings.mimo.baseUrl}
                        onChange={(_, data) =>
                          session.updateSettings({ mimo: { baseUrl: data.value } })
                        }
                      />
                    </Field>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              <div className={styles.toggleRow}>
                <Switch
                  className={styles.control40}
                  checked={settings.thinking}
                  onChange={(_, data) => session.updateSettings({ thinking: data.checked })}
                  label="深度思考（回答更严谨，但会慢一些）"
                />
              </div>
            </div>

            {/* ---------- 面板 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                面板
              </Text>
              <Field
                label="形态"
                hint={
                  sidebarFallback
                    ? '当前窗口不够宽，常驻侧栏会显示为浮层。'
                    : '切换布局不会丢失对话；进入语音对话时会自动全屏。'
                }
              >
                <Dropdown size="large"
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
              <Text size={200} className={styles.hint}>
                在输入框里按 Enter 发送，Shift + Enter 换行。
              </Text>
            </div>

            {/* ---------- 语音 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                语音
              </Text>
              <div className={styles.toggleRow}>
                <Switch
                  className={styles.control40}
                  checked={settings.tts.autoPlay}
                  onChange={(_, data) =>
                    session.updateSettings({ tts: { autoPlay: data.checked } })
                  }
                  label="每条新回复自动朗读一遍"
                />
              </div>
              <div className={styles.toggleRow}>
                <Switch
                  className={styles.control40}
                  checked={settings.tts.continuous}
                  onChange={(_, data) =>
                    session.updateSettings({ tts: { continuous: data.checked } })
                  }
                  label="连续朗读（当前回答读完后，后续回答也自动读）"
                />
              </div>
              <Text size={200} className={styles.hint}>
                点标题栏的喇叭可以开始连续朗读；再点一次停止。这个选择会被记住，下次打开仍然有效。
              </Text>
              <Field label="音色">
                <Dropdown size="large"
                  value={
                    TTS_VOICES.find((item) => item.value === settings.tts.voice)?.label ??
                    settings.tts.voice
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
              <div className={styles.sliderRow}>
                <Label style={{ minWidth: '48px' }}>语速</Label>
                <Slider
                  className={styles.control40}
                  size="medium"
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

            {/* ---------- 人脸 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                人脸唤醒
              </Text>
              <FaceSetup settings={settings} onUpdate={session.updateSettings} />
            </div>

            {/* ---------- 联网搜索 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                联网搜索
              </Text>
              <div className={styles.toggleRow}>
                <Switch
                  className={styles.control40}
                  checked={settings.search.enabled}
                  onChange={(_, data) =>
                    session.updateSettings({ search: { enabled: data.checked } })
                  }
                  label="允许回答时联网搜索"
                />
              </div>
              <div className={styles.toggleRow}>
                <Switch
                  className={styles.control40}
                  checked={settings.search.forceSearch}
                  onChange={(_, data) =>
                    session.updateSettings({ search: { forceSearch: data.checked } })
                  }
                  label="每次都先联网搜索（默认关闭，由助手判断是否需要）"
                />
              </div>
              <div className={styles.inline}>
                <Label style={{ minWidth: '160px' }}>每次搜索的关键词数量</Label>
                <Input size="large"
                  style={{ maxWidth: '120px' }}
                  type="number"
                  min={1}
                  max={10}
                  value={String(settings.search.maxKeyword)}
                  onChange={(_, data) => {
                    const value = Number(data.value);
                    if (Number.isFinite(value)) {
                      session.updateSettings({
                        search: { maxKeyword: Math.min(10, Math.max(1, Math.round(value))) },
                      });
                    }
                  }}
                />
                <Text size={200} className={styles.hint}>
                  默认 3 个
                </Text>
              </div>
              <Text size={200} className={styles.hint}>
                来源会显示在回答下方（首屏最多 3 条，其余可展开）。如果提示联网搜索不可用，
                请到 MiMo 控制台 → 插件管理开通后重试。
              </Text>
              <Link href={MIMO_PLUGIN_CONSOLE_URL} target="_blank" rel="noreferrer">
                打开 MiMo 控制台
              </Link>
            </div>
          </DialogContent>
          <DialogActions>
            <Button size="large" appearance="primary" onClick={onClose}>
              完成
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
