import fecha from 'element-ui/src/utils/date';
import { t } from 'element-ui/src/locale'; // 多语言
// 定义一周以及一月的常量
const weeks = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// 生成一个新的数组
const newArray = function(start, end) {
  let result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};
// 获取日期，月份的名字
export const getI18nSettings = () => {
  return {
    dayNamesShort: weeks.map(week => t(`el.datepicker.weeks.${ week }`)),
    dayNames: weeks.map(week => t(`el.datepicker.weeks.${ week }`)),
    monthNamesShort: months.map(month => t(`el.datepicker.months.${ month }`)),
    monthNames: months.map((month, index) => t(`el.datepicker.month${ index + 1 }`)),
    amPm: ['am', 'pm']
  };
};

// 如果是日期格式，转化为日期， 否则返回null
export const toDate = function(date) {
  return isDate(date) ? new Date(date) : null;
};

/**
 * @param {String | Number} date 能够转化为日期的时间
 */
export const isDate = function(date) {
  if (date === null || date === undefined) return false;
  // 非数字情况过滤
  if (isNaN(new Date(date).getTime())) return false;
  if (Array.isArray(date)) return false; // deal with `new Date([ new Date() ]) -> new Date()`
  return true;
};

// 原形链是否是Date
export const isDateObject = function(val) {
  return val instanceof Date;
};

/**
 *
 * @param {String | Number} date 时间戳
 * @param {*} format 日期格式
 */
export const formatDate = function(date, format) {
  date = toDate(date);
  if (!date) return '';
  return fecha.format(date, format || 'yyyy-MM-dd', getI18nSettings());
};

export const parseDate = function(string, format) {
  return fecha.parse(string, format || 'yyyy-MM-dd', getI18nSettings());
};

/**
 * 获取该月份的天数
 * @param {Number} year 年份
 * @param {Number} month 月份
 */
export const getDayCountOfMonth = function(year, month) {
  if (month === 3 || month === 5 || month === 8 || month === 10) {
    return 30;
  }
  // 对二月份的处理
  if (month === 1) {
    if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
      return 29;
    } else {
      return 28;
    }
  }

  return 31;
};
// 获取某一年的天数
export const getDayCountOfYear = function(year) {
  const isLeapYear = year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  return isLeapYear ? 366 : 365;
};
// 获取该月的第一天为星期几
export const getFirstDayOfMonth = function(date) {
  const temp = new Date(date.getTime());
  temp.setDate(1);
  return temp.getDay();
};

// see: https://stackoverflow.com/questions/3674539/incrementing-a-date-in-javascript
// {prev, next} Date should work for Daylight Saving Time
// Adding 24 * 60 * 60 * 1000 does not work in the above scenario
// 获取前一天的日期
export const prevDate = function(date, amount = 1) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - amount);
};
// 获取下一个的日期
export const nextDate = function(date, amount = 1) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
};
export const getStartDateOfMonth = function(year, month) {
  const result = new Date(year, month, 1);
  const day = result.getDay();
  // 如果为周日，获取前一周的周日
  if (day === 0) {
    return prevDate(result, 7);
  } else {
    return prevDate(result, day);
  }
};
// 获取第几周
export const getWeekNumber = function(src) {
  if (!isDate(src)) return null;
  const date = new Date(src.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  // 定位到周四
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  // 一月四号的日期
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week 1.
  // Rounding should be fine for Daylight Saving Time. Its shift should never be more than 12 hours.
  // 随意传过来的一天 减去一月4号  等于两者相差的天数
  // 假设week1的1月4号正好等于周四，天数不加，不减， 3天内就是一天，多余三天四舍五入就是2天，
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export const getRangeHours = function(ranges) {
  const hours = [];
  let disabledHours = [];
  // 获取范围内的Hour
  (ranges || []).forEach(range => {
    const value = range.map(date => date.getHours());

    disabledHours = disabledHours.concat(newArray(value[0], value[1]));
  });
  // 如果在那个范围就为true, 否则就为false
  if (disabledHours.length) {
    for (let i = 0; i < 24; i++) {
      hours[i] = disabledHours.indexOf(i) === -1;
    }
  } else {
    for (let i = 0; i < 24; i++) {
      hours[i] = false;
    }
  }

  return hours;
};
export const getPrevMonthLastDays = (date, amount) => {
  if (amount <= 0) return [];
  const temp = new Date(date.getTime());
  temp.setDate(0);
  const lastDay = temp.getDate();
  return range(amount).map((_, index) => lastDay - (amount - index - 1));
};
// 生成一个数组， 从1 - 31天
export const getMonthDays = (date) => {
  // 上个月的最后一天
  const temp = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = temp.getDate();
  return range(days).map((_, index) => index + 1);
};
// 给数组中的某个范围赋值
function setRangeData(arr, start, end, value) {
  for (let i = start; i < end; i++) {
    arr[i] = value;
  }
}
// 获取某个范围内的分钟
export const getRangeMinutes = function(ranges, hour) {
  const minutes = new Array(60);

  if (ranges.length > 0) {
    // 是个二维数组
    ranges.forEach(range => {
      const start = range[0];
      const end = range[1];
      const startHour = start.getHours();
      const startMinute = start.getMinutes();
      const endHour = end.getHours();
      const endMinute = end.getMinutes();
      // 通过判断开始Hour,和endHour, 以及Hour,来确定当前那些minutes需要变成true
      if (startHour === hour && endHour !== hour) {
        setRangeData(minutes, startMinute, 60, true);
      } else if (startHour === hour && endHour === hour) {
        setRangeData(minutes, startMinute, endMinute + 1, true);
      } else if (startHour !== hour && endHour === hour) {
        setRangeData(minutes, 0, endMinute + 1, true);
      } else if (startHour < hour && endHour > hour) {
        setRangeData(minutes, 0, 60, true);
      }
    });
  } else {
    setRangeData(minutes, 0, 60, true);
  }
  return minutes;
};

// create-a-javascript-array-containing-1-n
export const range = function(n) {
  // see https://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
  return Array.apply(null, { length: n }).map((_, n) => n);
};

/**
 * 修改日期，生成一个新的日期
 * @param {Date} date
 * @param {Number} y
 * @param {Number} m
 * @param {Number} d
 */
export const modifyDate = function(date, y, m, d) {
  return new Date(y, m, d, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
};

// 修改时间生成一个新的Date对象
export const modifyTime = function(date, h, m, s) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, s, date.getMilliseconds());
};

export const modifyWithTimeString = (date, time) => {
  if (date == null || !time) {
    return date;
  }
  time = parseDate(time, 'HH:mm:ss');
  return modifyTime(date, time.getHours(), time.getMinutes(), time.getSeconds());
};
// 清除时间
export const clearTime = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
// 清除毫秒
export const clearMilliseconds = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0);
};

export const limitTimeRange = function(date, ranges, format = 'HH:mm:ss') {
  // TODO: refactory a more elegant solution
  if (ranges.length === 0) return date;
  const normalizeDate = date => fecha.parse(fecha.format(date, format), format);
  const ndate = normalizeDate(date);
  const nranges = ranges.map(range => range.map(normalizeDate));
  if (nranges.some(nrange => ndate >= nrange[0] && ndate <= nrange[1])) return date;

  let minDate = nranges[0][0];
  let maxDate = nranges[0][0];

  nranges.forEach(nrange => {
    minDate = new Date(Math.min(nrange[0], minDate));
    maxDate = new Date(Math.max(nrange[1], minDate));
  });

  const ret = ndate < minDate ? minDate : maxDate;
  // preserve Year/Month/Date
  return modifyDate(
    ret,
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

export const timeWithinRange = function(date, selectableRange, format) {
  const limitedDate = limitTimeRange(date, selectableRange, format);
  return limitedDate.getTime() === date.getTime();
};

// 根据年月和传入的日期，生成一个新的日期，
export const changeYearMonthAndClampDate = function(date, year, month) {
  // clamp date to the number of days in `year`, `month`
  // eg: (2010-1-31, 2010, 2) => 2010-2-28
  // 取当前的月份以及该月份最大的天数中最小的
  const monthDate = Math.min(date.getDate(), getDayCountOfMonth(year, month));
  return modifyDate(date, year, month, monthDate);
};
// 获取上一个月
export const prevMonth = function(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month === 0 ? changeYearMonthAndClampDate(date, year - 1, 11) : changeYearMonthAndClampDate(date, year, month - 1);
};

// 获取下一个月
export const nextMonth = function(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month === 11 ? changeYearMonthAndClampDate(date, year + 1, 0) : changeYearMonthAndClampDate(date, year, month + 1);
};
// 获取上某年的日期
export const prevYear = function(date, amount = 1) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return changeYearMonthAndClampDate(date, year - amount, month);
};
// 获取下一年的日期
export const nextYear = function(date, amount = 1) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return changeYearMonthAndClampDate(date, year + amount, month);
};
// 去除时间， 留下日期
export const extractDateFormat = function(format) {
  return format
    .replace(/\W?m{1,2}|\W?ZZ/g, '')
    .replace(/\W?h{1,2}|\W?s{1,3}|\W?a/gi, '')
    .trim();
};
/**
 * 留下时间格式
 * @param {String} format 日期格式
 */
export const extractTimeFormat = function(format) {
  return format
    .replace(/\W?D{1,2}|\W?Do|\W?d{1,4}|\W?M{1,4}|\W?y{2,4}/g, '')
    .trim();
};

/**
 * 判断是否同一年的同一个月
 * @param {Date} start 开始日期
 * @param {Date} end 结束日期
 */
export const validateRangeInOneMonth = function(start, end) {
  return (start.getMonth() === end.getMonth()) && (start.getFullYear() === end.getFullYear());
};
