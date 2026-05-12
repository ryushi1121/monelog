import { formatDateForAPI, getDayOfWeek } from './dateUtils';

const PREFIX = '【MoneLog】 ';

export const parseEvent = (calendarEvent) => {
  if (!calendarEvent.summary) return null;
  if (!calendarEvent.summary.startsWith(PREFIX)) return null;

  const dateStr = calendarEvent.start?.date
    || (calendarEvent.start?.dateTime ? calendarEvent.start.dateTime.split('T')[0] : formatDateForAPI(new Date()));

  const entry = {
    id: calendarEvent.id,
    date: dateStr,
    type: '支出',
    category: '',
    subcategory: '',
    amount: 0,
    memo: '',
    dayOfWeek: getDayOfWeek(dateStr),
  };

  const description = calendarEvent.description || '';
  const lines = description.split(/\s+(?=種別：|カテゴリ：|小カテゴリ：|金額：|メモ：)/);
  lines.forEach(line => {
    const colonIndex = line.indexOf('：');
    if (colonIndex === -1) return;
    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    switch (key) {
      case '種別':      entry.type = value; break;
      case 'カテゴリ':  entry.category = value; break;
      case '小カテゴリ': entry.subcategory = value; break;
      case '金額':      entry.amount = parseInt(value.replace(/[^\d]/g, ''), 10) || 0; break;
      case 'メモ':      entry.memo = value; break;
    }
  });

  return entry;
};

export const formatEvent = (entryData) => {
  const type = entryData.type || '支出';
  const amount = entryData.amount || 0;
  const category = entryData.category || '';

  const summary = `${PREFIX}${type} ${category} ¥${amount.toLocaleString()}`;

  const descriptionLines = [
    `種別：${type}`,
    `カテゴリ：${category}`,
    `小カテゴリ：${entryData.subcategory || ''}`,
    `金額：${amount.toLocaleString()}円`,
  ];
  if (entryData.memo) descriptionLines.push(`メモ：${entryData.memo}`);

  const dateStr = entryData.date;
  const nextDate = new Date(dateStr);
  nextDate.setDate(nextDate.getDate() + 1);

  // 収入=Sage(2), 支出=Tomato(11)
  const colorId = type === '収入' ? '2' : '11';

  return {
    summary,
    description: descriptionLines.join('\n'),
    start: { date: dateStr },
    end: { date: formatDateForAPI(nextDate) },
    colorId,
    reminders: { useDefault: false, overrides: [] },
  };
};
