/**
 * Agent 设置：语音（音色 / 语速 / 文字提问也朗读）、模型、联网搜索、输入与权限。
 * 所有项即改即存（`agent.settings`；输入方式与麦克风同意各自独立键），没有“保存”按钮。
 *
 * v0.4.5 触控改造（`wtsl-touch-voice-design.md` §4.7 的 13 条，逐条对应）：
 * 命中性 ≥44、语速给 −/＋ 步进与可读当前值、下拉列表行高 44、API Key 可显示/粘贴/清空、
 * 关键词数量改成下拉、链接变按钮、滚动区 overscroll 限制、分组锚点、Switch label 去括号、
 * 禁用态给原因、新增「输入方式」与「麦克风」两行。
 * 所有颜色/间距/字号取 `tokens.*`，命中区高度取 `TOUCH_TARGET_CSS`（项目唯一常量出口）。
 */

import { useRef, useState } from 'react';
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
  Option,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  AddRegular,
  ArrowSyncRegular,
  ClipboardPasteRegular,
  DeleteRegular,
  DismissRegular,
  EyeOffRegular,
  EyeRegular,
  OpenRegular,
  SubtractRegular,
} from '@fluentui/react-icons';
import { TOUCH_TARGET_CSS } from '../../design/metrics';
import type { AgentSession } from '../hooks/useAgentSession';
import {
  INPUT_MODE_OPTIONS,
  setInputMode,
  useInputMode,
  type InputModeSetting,
} from './inputModality';
import { MicStatusRow } from './MicPermissionCard';
import {
  checkMicrophone,
  grantMicConsent,
  openMicPrivacySettings,
  useMicState,
} from './micPermission';
import {
  MIMO_BASE_URL,
  MIMO_MODELS,
  MIMO_PLUGIN_CONSOLE_URL,
  TTS_VOICES,
} from '../types';
import { setExpandProcessAll, useExpandProcessAll } from './useTurnBlocks';

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
    // 触控惯性滚动不传出去（外层不应跟着滚）
    overscrollBehavior: 'contain',
    paddingInlineEnd: tokens.spacingHorizontalXS,
    // 最后一行不贴住「完成」按钮
    paddingBlockEnd: tokens.spacingVerticalXXL,
  },
  // 分组锚点：手指一次滑不到目标组时，上面这排按钮直接跳过去
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  error: {
    color: tokens.colorStatusDangerForeground1,
  },
  // 开关 / 滑杆 / 选项行至少 44 逻辑像素（Fluent 2 layout 44×44 / HIG §6）
  touchRow: {
    display: 'flex',
    alignItems: 'center',
    minHeight: TOUCH_TARGET_CSS,
    gap: tokens.spacingHorizontalS,
  },
  switchGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: TOUCH_TARGET_CSS,
    gap: tokens.spacingHorizontalS,
  },
  slider: {
    flex: 1,
    // 最小轨道宽度按 Fluent 间距档推导（5 × XXXL = 160），不写第二套像素
    minWidth: `calc(${tokens.spacingHorizontalXXXL} * 5)`,
    // 横拖滑杆、纵滚列表：别让滚动容器把滑杆手势吃掉
    touchAction: 'pan-y',
  },
  sliderValue: {
    minWidth: '4ch',
    textAlign: 'end',
  },
  inline: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  // 44 触控目标：Fluent large 按钮实测 ≈40，触控口径要兜到 44
  touchTarget: {
    minWidth: TOUCH_TARGET_CSS,
    minHeight: TOUCH_TARGET_CSS,
  },
  /** 下拉列表项行高 44：Fluent 默认按 size 走 32 级，手指容易误选相邻项 */
  optionRow: {
    minHeight: TOUCH_TARGET_CSS,
    display: 'flex',
    alignItems: 'center',
  },
  rateLabel: {
    minWidth: '4ch',
  },
  keywordLabel: {
    minWidth: '10ch',
  },
  linkButton: {
    alignSelf: 'flex-start',
    minHeight: TOUCH_TARGET_CSS,
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
  const inputMode = useInputMode();
  const micState = useMicState();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const voiceSectionRef = useRef<HTMLDivElement | null>(null);
  const modelSectionRef = useRef<HTMLDivElement | null>(null);
  const searchSectionRef = useRef<HTMLDivElement | null>(null);
  const accessSectionRef = useRef<HTMLDivElement | null>(null);
  const displaySectionRef = useRef<HTMLDivElement | null>(null);

  const selectedModel = MIMO_MODELS.find((item) => item.value === settings.model);
  const selectedVoice =
    TTS_VOICES.find((item) => item.value === settings.tts.voice)?.label ?? settings.tts.voice;

  /** 过程块全局展开开关（「显示全部过程细节」，独立键，跨窗口同步） */
  const expandProcessAll = useExpandProcessAll();

  const jumpTo = (target: 'voice' | 'model' | 'search' | 'display' | 'access') => {
    const refs = {
      voice: voiceSectionRef,
      model: modelSectionRef,
      search: searchSectionRef,
      display: displaySectionRef,
      access: accessSectionRef,
    } as const;
    refs[target].current?.scrollIntoView({ block: 'start' });
  };

  /** 语速步进：0.5–2.0、step 0.1（与滑杆同一取整口径，避免 1.3000000000000003） */
  const setRate = (next: number) => {
    const clamped = Math.min(2, Math.max(0.5, Math.round(next * 10) / 10));
    session.updateSettings({ tts: { rate: clamped } });
  };

  /** 触屏盲输 40+ 字符密钥不可行：提供粘贴（读不到剪贴板时给可见的替代动作） */
  const pasteApiKey = async () => {
    setApiKeyError(null);
    try {
      if (!navigator.clipboard?.readText) {
        throw new Error('这个环境不能直接读剪贴板');
      }
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) throw new Error('剪贴板里没有文字');
      session.updateSettings({ mimo: { apiKey: text } });
    } catch (error) {
      setApiKeyError(
        `不能读取剪贴板：${error instanceof Error ? error.message : String(error)}。可以在输入框里长按，用系统的「粘贴」。`,
      );
    }
  };

  const openSystemMicSettings = () => {
    setMicError(null);
    void openMicPrivacySettings().catch((error: unknown) => {
      setMicError(`打开 Windows 设置失败：${error instanceof Error ? error.message : String(error)}`);
    });
  };

  const checkMic = () => {
    setMicError(null);
    void checkMicrophone();
  };

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
                className={styles.touchTarget}
                icon={<DismissRegular />}
                aria-label="关闭 Agent 设置"
                onClick={onClose}
              />
            }
          >
            Agent 设置
          </DialogTitle>
          <DialogContent className={styles.content}>
            {/* ---------- 分组锚点 ---------- */}
            <div className={styles.nav} role="navigation" aria-label="设置分组">
              <Button size="large" className={styles.touchTarget} appearance="subtle" onClick={() => jumpTo('voice')}>
                语音
              </Button>
              <Button size="large" className={styles.touchTarget} appearance="subtle" onClick={() => jumpTo('model')}>
                模型
              </Button>
              <Button size="large" className={styles.touchTarget} appearance="subtle" onClick={() => jumpTo('search')}>
                联网搜索
              </Button>
              <Button size="large" className={styles.touchTarget} appearance="subtle" onClick={() => jumpTo('display')}>
                显示
              </Button>
              <Button size="large" className={styles.touchTarget} appearance="subtle" onClick={() => jumpTo('access')}>
                输入与权限
              </Button>
            </div>

            {/* ---------- 语音 ---------- */}
            <div className={styles.section} ref={voiceSectionRef}>
              <Text size={400} weight="semibold">
                语音
              </Text>
              <div className={styles.switchGroup}>
                <Switch
                  className={styles.touchTarget}
                  checked={settings.tts.autoRead}
                  onChange={(_, data) =>
                    session.updateSettings({ tts: { autoRead: data.checked } })
                  }
                  label="自动朗读回答"
                />
                <Text size={200} className={styles.hint}>
                  关掉后语音和文字回答都只显示文字，单条回答仍可手动朗读
                </Text>
              </div>
              <div className={styles.switchGroup}>
                <Switch
                  className={styles.touchTarget}
                  checked={settings.tts.readTextReplies}
                  disabled={!settings.tts.autoRead}
                  onChange={(_, data) =>
                    session.updateSettings({ tts: { readTextReplies: data.checked } })
                  }
                  label="文字提问的回答也朗读"
                />
                {!settings.tts.autoRead ? (
                  <Text size={200} className={styles.hint}>
                    先打开「自动朗读回答」
                  </Text>
                ) : null}
              </div>
              <Field label="音色">
                <Dropdown
                  size="large"
                  className={styles.touchTarget}
                  value={selectedVoice}
                  selectedOptions={[settings.tts.voice]}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) {
                      session.updateSettings({ tts: { voice: data.optionValue } });
                    }
                  }}
                >
                  {TTS_VOICES.map((item) => (
                    <Option
                      key={item.value}
                      value={item.value}
                      text={item.label}
                      className={styles.optionRow}
                    >
                      {item.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              <div className={styles.sliderRow}>
                <Label className={styles.rateLabel}>语速</Label>
                <Button
                  size="large"
                  appearance="subtle"
                  className={styles.touchTarget}
                  icon={<SubtractRegular />}
                  aria-label="语速慢一档"
                  disabled={settings.tts.rate <= 0.5}
                  onClick={() => setRate(settings.tts.rate - 0.1)}
                />
                <Slider
                  className={styles.slider}
                  size="medium"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={settings.tts.rate}
                  onChange={(_, data) => setRate(data.value)}
                  aria-label="语速"
                />
                <Button
                  size="large"
                  appearance="subtle"
                  className={styles.touchTarget}
                  icon={<AddRegular />}
                  aria-label="语速快一档"
                  disabled={settings.tts.rate >= 2}
                  onClick={() => setRate(settings.tts.rate + 0.1)}
                />
                <Text size={300} className={styles.sliderValue} aria-live="polite">
                  {settings.tts.rate.toFixed(1)}×
                </Text>
              </div>
              <Text size={200} className={styles.hint}>
                手指拖动看不清时用两侧的 −／＋，每按一次 0.1 倍
              </Text>
            </div>

            {/* ---------- 模型 ---------- */}
            <div className={styles.section} ref={modelSectionRef}>
              <Text size={400} weight="semibold">
                模型
              </Text>
              <Field label="模型" hint={selectedModel?.hint}>
                <Dropdown
                  size="large"
                  className={styles.touchTarget}
                  value={selectedModel?.label ?? ''}
                  selectedOptions={[settings.model]}
                  onOptionSelect={(_, data) => {
                    const next = MIMO_MODELS.find((item) => item.value === data.optionValue);
                    if (next) session.updateSettings({ model: next.value });
                  }}
                >
                  {MIMO_MODELS.map((item) => (
                    <Option
                      key={item.value}
                      value={item.value}
                      text={item.label}
                      className={styles.optionRow}
                    >
                      {item.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              <Field label="MiMo API Key" hint="只保存在这台设备上，不会上传或同步到其他地方。">
                <Input
                  size="large"
                  type={showApiKey ? 'text' : 'password'}
                  autoComplete="off"
                  value={settings.mimo.apiKey}
                  placeholder="sk-…"
                  onChange={(_, data) =>
                    session.updateSettings({ mimo: { apiKey: data.value } })
                  }
                />
              </Field>
              <div className={styles.actions}>
                <Button
                  size="large"
                  appearance="secondary"
                  className={styles.touchTarget}
                  icon={showApiKey ? <EyeOffRegular /> : <EyeRegular />}
                  onClick={() => setShowApiKey((previous) => !previous)}
                >
                  {showApiKey ? '隐藏' : '显示'}
                </Button>
                <Button
                  size="large"
                  appearance="secondary"
                  className={styles.touchTarget}
                  icon={<ClipboardPasteRegular />}
                  onClick={() => void pasteApiKey()}
                >
                  粘贴
                </Button>
                <Button
                  size="large"
                  appearance="secondary"
                  className={styles.touchTarget}
                  icon={<DeleteRegular />}
                  disabled={!settings.mimo.apiKey}
                  onClick={() => {
                    setApiKeyError(null);
                    session.updateSettings({ mimo: { apiKey: '' } });
                  }}
                >
                  清空
                </Button>
              </div>
              {apiKeyError ? (
                <Text size={200} className={styles.error} role="alert">
                  {apiKeyError}
                </Text>
              ) : null}
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
              <div className={styles.switchGroup}>
                <Switch
                  className={styles.touchTarget}
                  checked={settings.thinking}
                  onChange={(_, data) => session.updateSettings({ thinking: data.checked })}
                  label="深度思考"
                />
                <Text size={200} className={styles.hint}>
                  回答更严谨，会慢一些
                </Text>
              </div>
            </div>

            {/* ---------- 联网搜索 ---------- */}
            <div className={styles.section} ref={searchSectionRef}>
              <Text size={400} weight="semibold">
                联网搜索
              </Text>
              <div className={styles.switchGroup}>
                <Switch
                  className={styles.touchTarget}
                  checked={settings.search.enabled}
                  onChange={(_, data) =>
                    session.updateSettings({ search: { enabled: data.checked } })
                  }
                  label="允许回答时联网搜索"
                />
                <Text size={200} className={styles.hint}>
                  默认交给助手判断是否需要联网
                </Text>
              </div>
              <div className={styles.switchGroup}>
                <Switch
                  className={styles.touchTarget}
                  checked={settings.search.forceSearch}
                  onChange={(_, data) =>
                    session.updateSettings({ search: { forceSearch: data.checked } })
                  }
                  label="每次都先联网搜索"
                />
              </div>
              <div className={styles.inline}>
                <Label className={styles.keywordLabel}>每次搜索的关键词数量</Label>
                <Dropdown
                  size="large"
                  className={styles.touchTarget}
                  style={{ minWidth: `calc(${tokens.spacingHorizontalXXXL} * 3)` }}
                  value={String(settings.search.maxKeyword)}
                  selectedOptions={[String(settings.search.maxKeyword)]}
                  onOptionSelect={(_, data) => {
                    const value = Number(data.optionValue);
                    if (Number.isFinite(value)) {
                      session.updateSettings({
                        search: { maxKeyword: Math.min(10, Math.max(1, Math.round(value))) },
                      });
                    }
                  }}
                >
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                    <Option
                      key={count}
                      value={String(count)}
                      text={String(count)}
                      className={styles.optionRow}
                    >
                      {count}
                    </Option>
                  ))}
                </Dropdown>
              </div>
              <Button
                size="large"
                appearance="secondary"
                className={`${styles.touchTarget} ${styles.linkButton}`}
                icon={<OpenRegular />}
                onClick={() => window.open(MIMO_PLUGIN_CONSOLE_URL, '_blank', 'noopener,noreferrer')}
              >
                打开 MiMo 控制台
              </Button>
            </div>

            {/* ---------- 显示 ---------- */}
            <div className={styles.section} ref={displaySectionRef}>
              <Text size={400} weight="semibold">
                显示
              </Text>
              <div className={styles.switchGroup}>
                <Switch
                  className={styles.touchTarget}
                  checked={expandProcessAll}
                  onChange={(_, data) => setExpandProcessAll(data.checked)}
                  label="显示全部过程细节"
                />
                <Text size={200} className={styles.hint}>
                  打开后思考与工具块默认展开；关掉时每个过程块只占一行摘要，点那一行单独展开
                </Text>
              </div>
            </div>

            {/* ---------- 输入与权限 ---------- */}
            <div className={styles.section} ref={accessSectionRef}>
              <Text size={400} weight="semibold">
                输入与权限
              </Text>
              <Field
                label="输入方式"
                hint={INPUT_MODE_OPTIONS.find((item) => item.value === inputMode)?.hint}
              >
                <RadioGroup
                  value={inputMode}
                  onChange={(_, data) => {
                    setInputMode(data.value as InputModeSetting);
                  }}
                >
                  {INPUT_MODE_OPTIONS.map((option) => (
                    <Radio
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      className={styles.touchTarget}
                    />
                  ))}
                </RadioGroup>
              </Field>
              <Field
                label="麦克风"
                hint="系统关掉麦克风时，应用内无法再弹系统提示，只能到 Windows 设置里打开。"
              >
                <MicStatusRow
                  state={micState}
                  error={micError}
                  onAllow={grantMicConsent}
                  onCheck={checkMic}
                  onOpenSystemSettings={openSystemMicSettings}
                />
              </Field>
              <div className={styles.inline}>
                <Button
                  size="large"
                  appearance="secondary"
                  className={styles.touchTarget}
                  icon={<ArrowSyncRegular />}
                  onClick={checkMic}
                >
                  检查麦克风
                </Button>
                <Tooltip content="打开 Windows 的麦克风隐私设置" relationship="description">
                  <Button
                    size="large"
                    appearance="secondary"
                    className={styles.touchTarget}
                    icon={<OpenRegular />}
                    onClick={openSystemMicSettings}
                  >
                    打开系统设置
                  </Button>
                </Tooltip>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              size="large"
              appearance="primary"
              className={styles.touchTarget}
              onClick={onClose}
            >
              完成
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
