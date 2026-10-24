/**
 * 演示数据：仅在 URL 带 ?demo=1 且本地没有任何数据时注入。
 * 用于截图 / 独立开发验收，不影响宿主里的真实数据。
 */
import { dayKey, addDays, startOfDay, fmtTime } from './date.js';
import { store } from './store.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function at(dayOffset, hour, minute = 0) {
  const day = addDays(startOfDay(new Date()), dayOffset);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, 0, 0).toISOString();
}

const TAG_POOL = ['工作', '生活', '学习', '健康', '重要'];

export function shouldSeedDemo() {
  const params = new URLSearchParams(location.search);
  return params.get('demo') === '1' && store.state.tasks.length === 0;
}

export function seedDemo() {
  const random = mulberry32(20261018);
  const lists = [{ name: '工作' }, { name: '生活' }, { name: '学习' }];
  const created = lists.map((item) => store.addList(item.name));
  const [work, life, study] = created;
  const byName = { 工作: work.id, 生活: life.id, 学习: study.id };

  const add = (input) => {
    try {
      return store.addTask(input);
    } catch (error) {
      console.warn('[todo demo] 跳过一条演示任务', error.message);
      return null;
    }
  };

  // ---- 今天 / 逾期待办 ----
  add({
    title: '整理产品周报，把本周评审结论同步给设计组',
    listId: byName['工作'],
    priority: 3,
    dueAt: at(0, 17, 0),
    status: 'todo',
    tags: ['工作', '重要'],
    subtasks: ['汇总本周数据', '整理评审结论', '发送给设计组'],
    note: '周五 17:00 前发出，抄送产品负责人。',
  });
  const todayMain = store.state.tasks[store.state.tasks.length - 1];
  if (todayMain) {
    store.completeSubtask(todayMain.id, todayMain.subtasks[0].id, true);
    store.updateTask(todayMain.id, { remindAt: at(1, 9, 30) });
  }
  add({
    title: '和设计评审 Fluent 动效 token',
    listId: byName['工作'],
    priority: 2,
    dueAt: at(0, 10, 30),
    tags: ['工作'],
    subtasks: ['准备动效示例', '确认 duration 档位'],
  });
  add({ title: '提交上周差旅报销单', listId: byName['工作'], priority: 2, dueAt: at(-1, 23, 59), tags: ['工作'] });
  add({ title: '买牛奶和面包', listId: byName['生活'], priority: 1, dueAt: at(0, 20, 0), tags: ['生活'] });
  add({
    title: '背单词 20 个（每日）',
    listId: byName['学习'],
    priority: 1,
    dueAt: at(0, 22, 0),
    recurrence: 'daily',
    tags: ['学习', '健康'],
  });
  add({
    title: '给妈妈打电话',
    listId: byName['生活'],
    priority: 0,
    dueAt: at(0, 19, 30),
    tags: ['生活'],
  });

  // ---- 明天 ----
  add({
    title: '准备下周一的方案初稿',
    listId: byName['工作'],
    priority: 3,
    dueAt: at(1, 11, 0),
    tags: ['工作', '重要'],
    subtasks: ['列大纲', '补竞品截图', '写结论'],
  });
  add({ title: '健身房练腿', listId: byName['生活'], priority: 1, dueAt: at(1, 18, 30), tags: ['健康'] });
  add({ title: '读完《设计中的设计》第三章', listId: byName['学习'], priority: 0, dueAt: at(1, 21, 0), tags: ['学习'] });
  add({ title: '每周复盘（每周）', listId: byName['工作'], priority: 2, dueAt: at(1, 20, 0), recurrence: 'weekly', tags: ['工作'] });

  // ---- 以后 ----
  add({ title: '预约牙医', listId: byName['生活'], priority: 1, dueAt: at(3, 9, 0), tags: ['健康'] });
  add({ title: '季度目标对齐会', listId: byName['工作'], priority: 2, dueAt: at(4, 14, 0), tags: ['工作'] });
  add({ title: '整理书桌和文件', listId: byName['生活'], priority: 0, dueAt: at(6, 10, 0), tags: ['生活'] });
  add({ title: '学习 CSS Container Queries', listId: byName['学习'], priority: 1, dueAt: at(8, 20, 0), tags: ['学习'] });
  add({ title: '给桌面插件写使用说明', listId: byName['工作'], priority: 2, dueAt: at(12, 16, 0), tags: ['工作'] });

  // ---- 无日期 ----
  add({ title: '整理插件截图，更新 README', listId: byName['工作'], priority: 1, tags: ['工作'] });
  add({ title: '想一个周末短途目的地', listId: byName['生活'], priority: 0, tags: ['生活'] });
  add({ title: '把 Fluent token 表补齐', listId: byName['学习'], priority: 2, tags: ['学习'] });

  // ---- 已完成（近 12 周，供工作量热力图） ----
  const completedTitles = [
    '清理收件箱',
    '写日报',
    '快走 30 分钟',
    '阅读 20 页',
    '复盘昨日计划',
    '联系客户确认需求',
    '整理会议纪要',
    '采购日用品',
    '拉伸放松',
    '记 10 个单词',
    '检查部署日志',
    '给团队写同步说明',
    '冥想 10 分钟',
    '整理待办清单',
  ];
  const days = 84;
  for (let offset = -days + 1; offset <= 0; offset += 1) {
    const day = addDays(startOfDay(new Date()), offset);
    const roll = random();
    let count = 0;
    if (roll > 0.4) count = 1;
    if (roll > 0.75) count = 2;
    if (roll > 0.92) count = 3;
    if (roll > 0.985) count = 4;
    for (let i = 0; i < count; i += 1) {
      const title = completedTitles[Math.floor(random() * completedTitles.length)];
      const listNames = ['工作', '生活', '学习'];
      const listName = listNames[Math.floor(random() * listNames.length)];
      const tags = [listName === '工作' ? '工作' : listName === '生活' ? '生活' : '学习'];
      const task = add({
        title,
        listId: byName[listName],
        priority: random() > 0.82 ? 3 : random() > 0.55 ? 2 : random() > 0.4 ? 1 : 0,
        tags,
        dueAt: at(offset, 9 + Math.floor(random() * 10), 0),
      });
      if (task) {
        const doneHour = 8 + Math.floor(random() * 14);
        const doneMinute = Math.floor(random() * 60);
        task.done = true;
        task.doneAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), doneHour, doneMinute, 0, 0).toISOString();
        task.updatedAt = task.doneAt;
      }
    }
  }
  store.persistTasks();
  // 首次进入时 store 会兜底建“我的待办”清单；演示数据里用三个有内容的清单替换它
  const placeholder = store.lists.find((list) => list.name === '我的待办' && !store.state.tasks.some((task) => task.listId === list.id));
  if (placeholder && store.lists.length > 1) {
    try {
      store.removeList(placeholder.id);
    } catch (error) {
      console.warn('[todo demo] 删除占位清单失败', error.message);
    }
  }
  store.updateSettings({ defaultListId: work.id, weekStart: 1 });
  store.emit();
  console.info('[todo] 演示数据已注入：', store.state.tasks.length, '条任务，', dayKey(new Date()));
}

/** 给截图用的固定演示数据时间文案（不参与逻辑，仅调试） */
export function demoNowText() {
  return `${dayKey(new Date())} ${fmtTime(new Date().toISOString())}`;
}
