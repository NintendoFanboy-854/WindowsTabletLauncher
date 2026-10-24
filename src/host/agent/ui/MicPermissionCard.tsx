/**
 * 麦克风授权 / 状态卡（应用内同意 + 失败引导）。
 *
 * 现状（`wtsl-touch-voice-design.md` §2.2）：0.4.4 里「授权页」完全不存在，唯一的麦克风痕迹
 * 是 AgentAlerts 的一行 warning 和 orb 上 12px 的红三角。这里补上两张 Fluent 表面：
 *
 * - `MicPermissionCard`：折叠态就地浮出的一张卡（不是新路由页，也不是自造弹窗），
 *   出现在「用户已经表达了要说话」之后（HIG Privacy：等到真用到才请求）；
 * - `MicStatusRow`：设置页「麦克风」行，用户唯一能在应用内自查权限的地方。
 *
 * 四类失败必须分开写（不能都写「权限被拒」）：系统层开关只能把用户导到
 * `ms-settings:privacy-microphone`；没有设备与设备被占用只能重试。
 */

import type { ReactElement } from 'react';
import {
  Button,
  Card,
  Spinner,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  CheckmarkCircleRegular,
  DismissRegular,
  ErrorCircleRegular,
  MicOffRegular,
  OpenRegular,
  SettingsRegular,
} from '@fluentui/react-icons';
import { TOUCH_TARGET_CSS } from '../../design/metrics';
import type { MicState } from './micPermission';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    boxSizing: 'border-box',
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusXLarge,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  headMark: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  headSpacer: {
    flex: 1,
  },
  body: {
    color: tokens.colorNeutralForeground2,
    margin: 0,
  },
  error: {
    color: tokens.colorStatusDangerForeground1,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBlockStart: tokens.spacingVerticalXS,
  },
  // 44 触控目标：Fluent 的 large 按钮实测 ≈40，触控口径要兜到 44
  touchTarget: {
    minWidth: TOUCH_TARGET_CSS,
    minHeight: TOUCH_TARGET_CSS,
  },
  statusRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: TOUCH_TARGET_CSS,
  },
  statusText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  okMark: {
    color: tokens.colorStatusSuccessForeground1,
  },
  failMark: {
    color: tokens.colorStatusWarningForeground1,
  },
});

/** 设置页/胶囊共用的一句状态（不写工程术语） */
export function micStatusLabel(state: MicState): string {
  if (state.checking) return '正在检查…';
  // 应用内还没同意时，「系统层能不能用」不是主状态：这里只说未允许 / 系统已允许
  if (state.consent !== 'granted' && (state.status === 'unchecked' || state.status === 'ok')) {
    return state.status === 'ok' ? '系统已允许' : '未允许';
  }
  switch (state.status) {
    case 'ok':
      return '已允许';
    case 'system':
      return '系统关闭';
    case 'denied':
      return '未允许';
    case 'nodevice':
      return '没有找到麦克风';
    case 'busy':
      return '被其它应用占用';
    case 'unsupported':
      return '当前环境不支持录音';
    case 'unknown':
      return '无法开启';
    default:
      return state.consent === 'granted' ? '已允许' : '未允许';
  }
}

interface MicAction {
  label: string;
  icon?: ReactElement;
  primary?: boolean;
  onClick: () => void;
}

function actionsFor(
  state: MicState,
  handlers: {
    onAllow: () => void;
    onDecline: () => void;
    onRetry: () => void;
    onOpenSystemSettings: () => void;
    onOpenSettings: () => void;
  },
): { title: string; body: string; actions: MicAction[] } {
  const consentGate = state.consent !== 'granted' && state.status !== 'system';
  if (consentGate) {
    return {
      title: '麦克风',
      body: '说话前需要开启麦克风。录音会发给你配置的 MiMo 服务，不保存到本地。',
      actions: [
        { label: '允许', primary: true, onClick: handlers.onAllow },
        { label: '先用文字', onClick: handlers.onDecline },
      ],
    };
  }
  switch (state.status) {
    case 'system':
      return {
        title: '麦克风被系统关掉了',
        body: 'Windows 的麦克风隐私开关没有允许这个应用。在系统设置里打开后再试一次。',
        actions: [
          {
            label: '打开 Windows 设置',
            icon: <OpenRegular />,
            primary: true,
            onClick: handlers.onOpenSystemSettings,
          },
          { label: '重试', icon: <ArrowClockwiseRegular />, onClick: handlers.onRetry },
        ],
      };
    case 'nodevice':
      return {
        title: '没有找到麦克风',
        body: '这台设备没有可用的录音设备，或驱动没有就绪。',
        actions: [
          { label: '重试', icon: <ArrowClockwiseRegular />, primary: true, onClick: handlers.onRetry },
          { label: '打开 Windows 设置', icon: <OpenRegular />, onClick: handlers.onOpenSystemSettings },
        ],
      };
    case 'busy':
      return {
        title: '麦克风被别的应用占用',
        body: '关掉正在使用麦克风的其它应用，然后重试。',
        actions: [
          { label: '重试', icon: <ArrowClockwiseRegular />, primary: true, onClick: handlers.onRetry },
        ],
      };
    case 'unsupported':
      return {
        title: '当前环境不支持录音',
        body: '需要在安装版里使用语音提问。',
        actions: [
          { label: '去设置', icon: <SettingsRegular />, primary: true, onClick: handlers.onOpenSettings },
        ],
      };
    case 'ok':
    case 'unchecked':
      // 已在授权卡上点过允许、探测也通过：直接给「开始说话」，不再是错误态
      return {
        title: '麦克风',
        body: '麦克风已经可用。',
        actions: [{ label: '开始说话', primary: true, onClick: handlers.onAllow }],
      };
    default:
      return {
        title: '无法开启麦克风',
        body: state.message || '重试一次，或到 Windows 设置里检查麦克风权限。',
        actions: [
          { label: '重试', icon: <ArrowClockwiseRegular />, primary: true, onClick: handlers.onRetry },
          { label: '打开 Windows 设置', icon: <OpenRegular />, onClick: handlers.onOpenSystemSettings },
        ],
      };
  }
}

export interface MicPermissionCardProps {
  /** 由栅格推导的浮层宽度（与录音胶囊同宽）；不传 = 占满父容器（语音窗 dock 内） */
  width?: number;
  state: MicState;
  /** 系统设置命令/探测的失败信息（必须上屏，不许静默） */
  error?: string | null;
  onAllow: () => void;
  onDecline: () => void;
  onRetry: () => void;
  onOpenSystemSettings: () => void;
  onOpenSettings: () => void;
  onDismiss: () => void;
}

export function MicPermissionCard({
  width,
  state,
  error,
  onAllow,
  onDecline,
  onRetry,
  onOpenSystemSettings,
  onOpenSettings,
  onDismiss,
}: MicPermissionCardProps) {
  const styles = useStyles();
  const { title, body, actions } = actionsFor(state, {
    onAllow,
    onDecline,
    onRetry,
    onOpenSystemSettings,
    onOpenSettings,
  });

  return (
    <Card
      className={styles.card}
      style={width ? { width: `${width}px` } : undefined}
      data-wtsl-agent-mic-card="true"
      data-wtsl-agent-mic-status={state.status}
      aria-label="麦克风授权"
    >
      <div className={styles.head}>
        <MicOffRegular fontSize={20} className={styles.headMark} aria-hidden="true" />
        <Text size={400} weight="semibold">
          {title}
        </Text>
        <div className={styles.headSpacer} />
        <Tooltip content="关闭" relationship="label">
          <Button
            size="large"
            appearance="subtle"
            className={styles.touchTarget}
            icon={<DismissRegular />}
            aria-label="关闭麦克风提示"
            onClick={onDismiss}
          />
        </Tooltip>
      </div>
      <Text size={200} className={styles.body}>
        {body}
      </Text>
      {error ? (
        <Text size={200} className={styles.error} role="alert">
          {error}
        </Text>
      ) : null}
      <div className={styles.actions}>
        {actions.map((action) => (
          <Button
            key={action.label}
            size="large"
            className={styles.touchTarget}
            appearance={action.primary ? 'primary' : 'secondary'}
            icon={action.icon}
            disabled={state.checking}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
        {state.checking ? <Spinner size="extra-tiny" aria-hidden="true" /> : null}
      </div>
    </Card>
  );
}

export interface MicStatusRowProps {
  state: MicState;
  error?: string | null;
  onAllow: () => void;
  onCheck: () => void;
  onOpenSystemSettings: () => void;
}

/** 设置页「麦克风」行：状态 + 检查 + 打开 Windows 设置（审计 §2.2 ③ 的落点） */
export function MicStatusRow({
  state,
  error,
  onAllow,
  onCheck,
  onOpenSystemSettings,
}: MicStatusRowProps) {
  const styles = useStyles();
  const label = micStatusLabel(state);
  const ok = state.status === 'ok';

  return (
    <div className={styles.statusRow} data-wtsl-agent-mic-row="true">
      <span className={styles.statusText}>
        {ok ? (
          <CheckmarkCircleRegular className={styles.okMark} aria-hidden="true" />
        ) : (
          <ErrorCircleRegular className={styles.failMark} aria-hidden="true" />
        )}
        <Text size={300}>{label}</Text>
      </span>
      {state.consent !== 'granted' ? (
        <Button size="large" className={styles.touchTarget} appearance="primary" onClick={onAllow}>
          允许
        </Button>
      ) : null}
      <Button
        size="large"
        className={styles.touchTarget}
        appearance="secondary"
        icon={<ArrowClockwiseRegular />}
        disabled={state.checking}
        onClick={onCheck}
      >
        检查
      </Button>
      <Button
        size="large"
        className={styles.touchTarget}
        appearance="secondary"
        icon={<OpenRegular />}
        onClick={onOpenSystemSettings}
      >
        打开 Windows 设置
      </Button>
      {state.checking ? <Spinner size="extra-tiny" aria-hidden="true" /> : null}
      {error ? (
        <Text size={200} className={styles.error} role="alert">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
