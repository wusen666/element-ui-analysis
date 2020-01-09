import Picker from '../picker';
// 日期面板
import DatePanel from '../panel/date';
// 日期范围面板
import DateRangePanel from '../panel/date-range';
// 月份范围面板
import MonthRangePanel from '../panel/month-range';

const getPanel = function(type) {
  // 分三种，如果是选择两个的，使用range,
  // 如果选择month使用monthrange
  // 否则选择date的range
  if (type === 'daterange' || type === 'datetimerange') {
    return DateRangePanel;
  } else if (type === 'monthrange') {
    return MonthRangePanel;
  }

  return DatePanel;
};

export default {
  // 混入了外边的弹出框
  mixins: [Picker],

  name: 'ElDatePicker',
  // 组件的类型
  props: {
    type: {
      type: String,
      default: 'date'
    },
    // time类型箭头控制
    timeArrowControl: Boolean
  },

  watch: {
    type(type) {
      if (this.picker) {
        // 当类型发生变化的时候，先下树picker,然后重新获取pabel，然后上树picker
        this.unmountPicker();
        this.panel = getPanel(type);
        this.mountPicker();
      } else {
        // 直接获取panel
        this.panel = getPanel(type);
      }
    }
  },

  created() {
    // 获取当前的panel
    this.panel = getPanel(this.type);
  }
};
