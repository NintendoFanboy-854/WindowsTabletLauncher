/**
 * 设置页的分组 / 行原语。
 *
 * 为什么单独一个文件：设置页里新增的分区（壁纸、以及后续分区）都要沿用同一套
 * 留白与行结构（DENSITY §4：一屏一个主任务、分组靠留白与字阶、控件之间不画分割线）。
 * 原语放在单独模块，分区文件只声明「有哪些行、每行放什么控件」，不必复制样式。
 */

import { Text, makeStyles, tokens } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  group: {
    display: 'grid',
    gap: tokens.spacingVerticalL,
    minWidth: 0,
  },
  groupHead: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
  },
  groupHint: {
    color: tokens.colorNeutralForeground3,
  },
  groupBody: {
    display: 'grid',
    gap: tokens.spacingVerticalL,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    /** 设置行高 48 = 32 + 16，全部来自 spacing ramp */
    minHeight: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalL})`,
  },
  rowText: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  rowControl: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  description: {
    color: tokens.colorNeutralForeground3,
  },
});

export interface SettingsGroupProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

export function SettingsGroup({ title, hint, children }: SettingsGroupProps) {
  const styles = useStyles();
  return (
    <section className={styles.group} aria-label={title}>
      <header className={styles.groupHead}>
        <Text size={500} weight="semibold">
          {title}
        </Text>
        {hint && (
          <Text size={200} className={styles.groupHint}>
            {hint}
          </Text>
        )}
      </header>
      <div className={styles.groupBody}>{children}</div>
    </section>
  );
}

export interface SettingsRowProps {
  label: string;
  description?: string;
  children?: ReactNode;
}

export function SettingsRow({ label, description, children }: SettingsRowProps) {
  const styles = useStyles();
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <Text size={400}>{label}</Text>
        {description && (
          <Text size={200} className={styles.description}>
            {description}
          </Text>
        )}
      </div>
      {children && <div className={styles.rowControl}>{children}</div>}
    </div>
  );
}
