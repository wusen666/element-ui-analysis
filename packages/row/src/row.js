export default {
  name: 'ElRow',

  componentName: 'ElRow',

  props: {
    tag: {
      type: String,
      default: 'div'
    },
    gutter: Number,
    type: String,
    justify: {
      type: String,
      default: 'start'
    },
    align: {
      type: String,
      default: 'top'
    }
  },

  computed: {
    style() {
      const ret = {};
      // 如果gutter存在，左右减去20px
      if (this.gutter) {
        ret.marginLeft = `-${this.gutter / 2}px`;
        ret.marginRight = ret.marginLeft;
      }

      return ret;
    }
  },
  // 使用reander函数渲染标签，函数式组件
  render(h) {
    return h(this.tag, {
      class: [
        'el-row',
        this.justify !== 'start' ? `is-justify-${this.justify}` : '', // justify的布局方式
        this.align !== 'top' ? `is-align-${this.align}` : '', // 添加align的布局，紧紧为flex的时候才奏效
        { 'el-row--flex': this.type === 'flex' } // 如果为flext, 添加flex类
      ],
      style: this.style // gutter的样式渲染
    }, this.$slots.default); // 读取默认slot里面的内容
  }
};
