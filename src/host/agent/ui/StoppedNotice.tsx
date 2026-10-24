/**
 * 停止后的状态行：`已停止` + 状态色图标，几秒后自然淡出。
 *
 * 为什么需要它（验证报告 §5-④）：点「停止生成」后，半高窗里状态行直接卸载、peek 停在
 * 半句回答上——用户看不到任何「刚才是我停的」的确认，只能看到内容突然不动了。
 * 轮次卡里的「已停止」只在全高的元信息角落（12px 图标），半高没有对应节点。
 *
 * 三条口径：
 * - **状态行改述，不是新加一条说明**：文案只有「已停止」三个字（`wait-ux.md:47`：
 *   完成态用过去时；content-design：不加句号、不解释原因、不给建议）。
 * - **颜色 + 图标 + 文字三重编码**（Fluent color：不只靠颜色；HIG §4）：warning 不用 danger
 *   ——是用户主动停止、不是系统错误，但「内容不完整」需要留意，正是 warning 的语义。
 * - **自动消失**：`STOP_NOTICE_MS` 是提示停留时长这个功能常量（与 `PendingLine` 的
 *   `ELAPSED_TICK_MS` 同类），不是动效时长；淡出这一步才用 `motionTokens.durationFast`
 *   与 `curveAccelerateMid`（motion.md：退出用 accelerate），reduced-motion 下同样只是透明度。
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Text, makeStyles, motionTokens, tokens } from '@fluentui/react-components';
import { StopRegular } from '@fluentui/react-icons';

/** 提示停留时长（功能计时，不是动效时长）：够读完三个字，又不至于长期占着 dock */
export const STOP_NOTICE_MS = 3000;
/** 淡出时长：取 motionTokens，退出用 accelerate（motion.md:29-35） */
const STOP_FADE_MS = motionTokens.durationFast;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    width: '100%',
    minWidth: 0,
    color: tokens.colorStatusWarningForeground1,
    transitionProperty: 'opacity',
    transitionDuration: `${STOP_FADE_MS}ms`,
    transitionTimingFunction: motionTokens.curveAccelerateMid,
  },
  leaving: {
    opacity: 0,
  },
});

export interface StoppedNoticeProps {
  /** 淡出结束后由父层卸载本行 */
  onDismiss: () => void;
}

export function StoppedNotice({ onDismiss }: StoppedNoticeProps): ReactNode {
  const styles = useStyles();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), STOP_NOTICE_MS);
    const removeTimer = window.setTimeout(onDismiss, STOP_NOTICE_MS + STOP_FADE_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [onDismiss]);

  return (
    <div
      className={`${styles.root} ${leaving ? styles.leaving : ''}`}
      role="status"
      aria-live="polite"
      data-wtsl-agent-stopped="true"
    >
      <StopRegular aria-hidden="true" fontSize={16} />
      <Text size={300}>已停止</Text>
    </div>
  );
}
