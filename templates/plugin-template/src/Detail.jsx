/**
 * 模板详情：L1 页栈 + L2 子页。
 *
 * L1：DetailHeader（标题 + 页面动作）/ DetailToolbar（编辑示例 + 设置…）/
 *      DetailTabs（概览 / 条目，CrossFade 切换）/ DetailScroll + ListRow。
 * L2：Subpage（标题 + footer 取消/保存）；保存只写当前详情会话的演示 state 后 pop，
 *     不会写宿主配置。设置统一走宿主设置页，不在这里画表单。
 */

import { useState } from 'react';
import {
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { requestHostSettings, useStoredConfig } from './shared/host.js';
import { CrossFade } from './shared/motion.js';
import {
  ActionButton,
  DetailHeader,
  DetailPage,
  DetailScroll,
  DetailTabs,
  DetailToolbar,
  ListRow,
  Subpage,
} from './shared/ui.jsx';
import { useDemoCount } from './demo.js';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  normalizeSettings,
  describeSummary,
} from './settings.js';

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  muted: {
    color: tokens.colorNeutralForeground2,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '480px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    width: '100%',
  },
});

const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
});

export default function Detail() {
  const styles = useStyles();
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [savedTitle, setSavedTitle] = useState('示例条目');
  const [savedHint, setSavedHint] = useState(true);
  const [draftTitle, setDraftTitle] = useState('示例条目');
  const [draftHint, setDraftHint] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const [count] = useDemoCount();

  const summary = describeSummary(count, settings);

  const openEditor = () => {
    setDraftTitle(savedTitle);
    setDraftHint(savedHint);
    setEditing(true);
  };

  /**
   * 契约 §4.1/§5 要求「设置…」= 关闭详情浮层 + 跳到宿主设置页。
   * 宿主收到 `plugin:request-host-settings` 后会自动收起当前浮层再导航（E3.0b 修复），
   * 插件只发这一条协议消息；不要再自己发 `plugin:request-overlay-close`。
   */
  const openHostSettings = () => {
    requestHostSettings();
  };

  const saveEditor = (close) => {
    setSavedTitle(draftTitle.trim() || '示例条目');
    setSavedHint(draftHint);
    close();
  };

  return (
    <DetailPage>
      <DetailHeader
        trailing={
          <ActionButton onClick={() => setRefreshedAt(new Date())} aria-label="刷新示例摘要">
            刷新
          </ActionButton>
        }
      >
        <Text size={400} weight="semibold">
          模板详情
        </Text>
      </DetailHeader>

      <DetailToolbar>
        <ActionButton appearance="primary" onClick={openEditor}>
          编辑示例
        </ActionButton>
        <ActionButton onClick={openHostSettings}>设置…</ActionButton>
      </DetailToolbar>

      <DetailTabs
        items={[
          { value: 'overview', label: '概览' },
          { value: 'items', label: '条目' },
        ]}
        value={tab}
        onChange={setTab}
        ariaLabel="模板详情视图"
      />

      <DetailScroll>
        <CrossFade value={tab}>
          {tab === 'overview' ? (
            <section className={styles.stack} aria-label="概览内容">
              <Text size={400} weight="semibold">
                已完成 {summary.count} {summary.unit}
              </Text>
              <Text size={300} className={styles.muted}>
                这是模板的 L1 概览：展示更多信息与具体操作，不是把卡片放大。
              </Text>
              {savedHint ? (
                <MessageBar intent="info">
                  <MessageBarBody>
                    L2 保存只更新当前详情会话的演示数据；取消、返回、X 和 Esc 的语义由共享骨架保证。
                  </MessageBarBody>
                </MessageBar>
              ) : null}
              <ListRow
                title={savedTitle}
                subtitle={`当前 ${summary.count} ${summary.unit} · 每次 +${summary.step}`}
                trailing={<Text size={200}>{summary.unit}</Text>}
              />
              <Text size={200} className={styles.muted}>
                更新于 {timeFormatter.format(refreshedAt)}
              </Text>
            </section>
          ) : (
            <section className={styles.stack} aria-label="条目内容">
              <Text size={400} weight="semibold">
                条目视图
              </Text>
              <Text size={300} className={styles.muted}>
                两个 Tab 是平级内容，用 CrossFade 切换；列表行点击由宿主详情容器承载。
              </Text>
              <ListRow
                title={savedTitle}
                subtitle="这个 ListRow 在两个 Tab 中复用同一份演示数据"
                trailing={<Text size={200}>只读</Text>}
              />
            </section>
          )}
        </CrossFade>
      </DetailScroll>

      {editing ? (
        <Subpage
          title="编辑示例"
          onClosed={() => setEditing(false)}
          footer={(close) => (
            <div className={styles.footer}>
              <ActionButton onClick={close}>取消</ActionButton>
              <ActionButton appearance="primary" onClick={() => saveEditor(close)}>
                保存
              </ActionButton>
            </div>
          )}
        >
          <div className={styles.form}>
            <Field label="示例名称" hint="保存后更新 L1 的列表行">
              <Input
                value={draftTitle}
                maxLength={24}
                onChange={(_event, data) => setDraftTitle(data.value)}
                aria-label="示例名称"
              />
            </Field>
            <Switch
              checked={draftHint}
              label="在概览中显示说明"
              onChange={(_event, data) => setDraftHint(data.checked)}
            />
            <Text size={200} className={styles.muted}>
              这里的保存只写当前详情会话的示例 state，用于演示 Subpage 的保存/取消语义；宿主配置请到设置页修改。
            </Text>
          </div>
        </Subpage>
      ) : null}
    </DetailPage>
  );
}
