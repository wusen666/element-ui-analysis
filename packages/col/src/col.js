export default {
  name: 'ElCol',

  props: {
    span: {
      type: Number,
      default: 24
    },
    tag: {
      type: String,
      default: 'div'
    },
    offset: Number,
    pull: Number,
    push: Number,
    xs: [Number, Object],
    sm: [Number, Object],
    md: [Number, Object],
    lg: [Number, Object],
    xl: [Number, Object]
  },

  computed: {
    gutter() {
      // 获取父亲节点，建议使用provide属性，进行注入
      let parent = this.$parent;
      // 循环遍历， 如果父节点不是ElRow, 继续上层级查找。
      while (parent && parent.$options.componentName !== 'ElRow') {
        parent = parent.$parent; // 拿父级节点
      }
      return parent ? parent.gutter : 0; // 拿到父亲的gutter
    }
  },
  render(h) {
    let classList = [];
    let style = {};
    // 左右padding都加gutter/2的像素
    if (this.gutter) {
      style.paddingLeft = this.gutter / 2 + 'px';
      style.paddingRight = style.paddingLeft;
    }

    ['span', 'offset', 'pull', 'push'].forEach(prop => {
      // prop存在或者等于0的时候进入
      if (this[prop] || this[prop] === 0) {
        // 增添类名 如果存在span, 增添el-col-number, 其他的属性增添 el-col-prop-number
        classList.push(
          prop !== 'span' ? `el-col-${prop}-${this[prop]}` : `el-col-${this[prop]}`
        );
      }
    });

    // 对各种屏幕下的宽度做处理
    ['xs', 'sm', 'md', 'lg', 'xl'].forEach(size => {
      if (typeof this[size] === 'number') {
        // 如果是数字的话， 添加相应的类名
        classList.push(`el-col-${size}-${this[size]}`);
      } else if (typeof this[size] === 'object') {
        // 如果是对象， 遍历对象，根据属性， 进行记录设备， 属性， 属性值
        let props = this[size];
        Object.keys(props).forEach(prop => {
          classList.push(
            prop !== 'span' ? `el-col-${size}-${prop}-${props[prop]}` : `el-col-${size}-${props[prop]}`
          );
        });
      }
    });

    return h(this.tag, {
      class: ['el-col', classList],
      style
    }, this.$slots.default);
  }
};
