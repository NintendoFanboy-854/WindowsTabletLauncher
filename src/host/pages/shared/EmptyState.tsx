/** 空状态：Fluent 的字阶/间距排版，不自己画插画。 */
import type { ReactNode } from 'react';
import { Text, Title3, makeStyles, tokens } from '@fluentui/react-components';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const useStyles = makeStyles({
  root: {
    display: 'grid',
    justifyItems: 'center',
    alignContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalXL}`,
    textAlign: 'center',
    color: tokens.colorNeutralForeground1,
  },
  description: {
    maxWidth: '52ch',
    color: tokens.colorNeutralForeground3,
  },
});

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Title3>{title}</Title3>
      {description && (
        <Text size={300} className={styles.description}>
          {description}
        </Text>
      )}
      {action}
    </div>
  );
}
