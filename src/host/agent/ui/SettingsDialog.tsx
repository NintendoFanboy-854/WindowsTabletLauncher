/**
 * Agent 设置：语音（音色 / 语速 / 文字提问也朗读）、模型、联网搜索。
 * 所有项即改即存（`agent.settings`），没有“保存”按钮。
 *
 * 面板形态 / 人脸唤醒 / continuous / autoPlay 已随契约删除；文案面向普通用户，
 * 工程术语（服务地址、关键词数量）收进“高级设置”或换成中文说明。
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
import {
  MIMO_BASE_URL,
  MIMO_MODELS,
  MIMO_PLUGIN_CONSOLE_URL,
  TTS_VOICES,
} from '../types';

const useStyles = makeStyles({
  surface: {
    maxWidth: '640px',
    width: 'min(640px, 94vw)',
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
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  // 开关 / 滑杆行至少 40px 高，保证平板触控目标（DESIGN §1.2）
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
  inline: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  control40: {
    minHeight: '40px',
  },
});

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
  const selectedModel = MIMO_MODELS.find((item) => item.value === settings.model);
  const selectedVoice =
    TTS_VOICES.find((item) => item.value === settings.tts.voice)?.label ?? settings.tts.voice;

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
            {/* ---------- 语音 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                语音
              </Text>
              <div className={styles.toggleRow}>
                <Switch
                  className={styles.control40}
                  checked={settings.tts.readTextReplies}
                  onChange={(_, data) =>
                    session.updateSettings({ tts: { readTextReplies: data.checked } })
                  }
                  label="文字提问的回答也朗读"
                />
              </div>
              <Text size={200} className={styles.hint}>
                语音提问的回答总会朗读；文字提问默认只显示文字。
              </Text>
              <Field label="音色">
                <Dropdown
                  size="large"
                  value={selectedVoice}
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

            {/* ---------- 模型 ---------- */}
            <div className={styles.section}>
              <Text size={400} weight="semibold">
                模型
              </Text>
              <Field label="模型" hint={selectedModel?.hint}>
                <Dropdown
                  size="large"
                  value={selectedModel?.label ?? ''}
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
                <Input
                  size="large"
                  type="password"
                  value={settings.mimo.apiKey}
                  placeholder="sk-…"
                  onChange={(_, data) =>
                    session.updateSettings({ mimo: { apiKey: data.value } })
                  }
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
                      <Input
                        size="large"
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
                  label="深度思考（回答更严谨，会慢一些）"
                />
              </div>
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
                  label="每次都先联网搜索"
                />
              </div>
              <Text size={200} className={styles.hint}>
                默认关闭，由助手判断是否需要联网。
              </Text>
              <div className={styles.inline}>
                <Label style={{ minWidth: '160px' }}>每次搜索的关键词数量</Label>
                <Input
                  size="large"
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
              </div>
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
