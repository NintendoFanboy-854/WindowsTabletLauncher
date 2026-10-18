/**
 * 工具调用卡片（按 docs/DENSITY.md：默认折叠成一行「图标 + 动作 + 状态」，
 * 展开后才看参数与结果）。
 */

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Badge,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { WrenchRegular } from '@fluentui/react-icons';
import type { ToolCallRecord } from '../types';
import { summarizeToolArgs, summarizeToolResult } from '../tools/registry';

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  header: {
    paddingInline: tokens.spacingHorizontalS,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
    width: '100%',
  },
  name: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    flexShrink: 0,
  },
  action: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase100,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    paddingBlockEnd: tokens.spacingVerticalS,
  },
  args: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    overflowWrap: 'anywhere',
  },
  result: {
    margin: 0,
    maxHeight: '200px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground2,
  },
  error: {
    margin: 0,
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
    whiteSpace: 'pre-wrap',
  },
});

/** 模型看到的 `clock__now` 还原成人类可读的 `clock.now` */
function displayName(name: string): string {
  return name.replace(/__/g, '.');
}

export function ToolCallCard({ record }: { record: ToolCallRecord }) {
  const styles = useStyles();
  const resultText = summarizeToolResult(record.result);

  const status =
    record.status === 'running' ? (
      <Spinner size="extra-tiny" aria-label="工具运行中" />
    ) : record.status === 'success' ? (
      <Badge appearance="tint" color="success">
        已完成
      </Badge>
    ) : (
      <Badge appearance="tint" color="danger">
        失败
      </Badge>
    );

  return (
    <Accordion collapsible className={styles.card}>
      <AccordionItem value="call">
        <AccordionHeader size="small" className={styles.header}>
          <span className={styles.head}>
            <WrenchRegular />
            <Text className={styles.name} weight="semibold">
              {displayName(record.name)}
            </Text>
            <Text className={styles.action}>{summarizeToolArgs(record.args)}</Text>
            {status}
          </span>
        </AccordionHeader>
        <AccordionPanel>
          <div className={styles.panel}>
            <Text className={styles.args}>{summarizeToolArgs(record.args)}</Text>
            {record.status === 'error' && record.error ? (
              <Text className={styles.error} as="p">
                {record.error}
              </Text>
            ) : null}
            {record.status === 'success' && resultText ? (
              <pre className={styles.result}>{resultText}</pre>
            ) : null}
          </div>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
