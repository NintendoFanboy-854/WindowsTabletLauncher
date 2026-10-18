/**
 * 工具调用卡片：运行中 / 成功 / 失败三种状态 + 参数与结果（可折叠）。
 */

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Badge,
  Card,
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
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: tokens.spacingHorizontalM,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  name: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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

/** 模型看到的 `web__search` 还原成人类可读的 `web.search` */
function displayName(name: string): string {
  return name.replace(/__/g, '.');
}

export function ToolCallCard({ record }: { record: ToolCallRecord }) {
  const styles = useStyles();
  const statusBadge =
    record.status === 'running' ? (
      <Badge appearance="tint" color="informative">
        运行中
      </Badge>
    ) : record.status === 'success' ? (
      <Badge appearance="tint" color="success">
        已完成
      </Badge>
    ) : (
      <Badge appearance="tint" color="danger">
        失败
      </Badge>
    );

  const resultText = summarizeToolResult(record.result);

  return (
    <Card size="small" appearance="filled-alternative" className={styles.card}>
      <div className={styles.head}>
        {record.status === 'running' ? <Spinner size="extra-tiny" /> : <WrenchRegular />}
        <Text className={styles.name} weight="semibold">
          {displayName(record.name)}
        </Text>
        {statusBadge}
      </div>
      <Text className={styles.args}>{summarizeToolArgs(record.args)}</Text>
      {record.status === 'error' && record.error ? (
        <Text className={styles.error} as="p">
          {record.error}
        </Text>
      ) : null}
      {record.status === 'success' && resultText ? (
        <Accordion collapsible>
          <AccordionItem value="result">
            <AccordionHeader size="small">查看返回结果</AccordionHeader>
            <AccordionPanel>
              <pre className={styles.result}>{resultText}</pre>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      ) : null}
    </Card>
  );
}
