<template>
  <component
    :is="_elTag"
    class="el-radio-group"
    role="radiogroup"
    @keydown="handleKeydown"
  >
    <slot></slot>
  </component>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';
  // 冻结了上下左右四个的keycode
  const keyCode = Object.freeze({
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  });
  export default {
    name: 'ElRadioGroup',

    componentName: 'ElRadioGroup',
    // 注入elFormItem
    inject: {
      elFormItem: {
        default: ''
      }
    },

    mixins: [Emitter],

    props: {
      value: {},
      size: String,
      fill: String,
      textColor: String,
      disabled: Boolean
    },

    computed: {
      _elFormItemSize() {
        // 获取elFormItem的size
        return (this.elFormItem || {}).elFormItemSize;
      },
      _elTag() {
        // 如果虚拟节点里面没有tag, 默认为div
        return (this.$vnode.data || {}).tag || 'div';
      },
      // radio的大小
      radioGroupSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      }
    },

    created() {
      // 初始化的时候进行监听handlechange, 如果监听到向外触发change事件
      this.$on('handleChange', value => {
        this.$emit('change', value);
      });
    },
    mounted() {
      // 当radioGroup没有默认选项时，第一个可以选中Tab导航
      const radios = this.$el.querySelectorAll('[type=radio]');
      const firstLabel = this.$el.querySelectorAll('[role=radio]')[0];
      // 初始的时候选中
      if (![].some.call(radios, radio => radio.checked) && firstLabel) {
        firstLabel.tabIndex = 0;
      }
    },
    methods: {
      handleKeydown(e) { // 左右上下按键 可以在radio组内切换不同选项
        const target = e.target;
        // 如果节点是input, 选用第一种，否则就是第二种
        const className = target.nodeName === 'INPUT' ? '[type=radio]' : '[role=radio]';
        // 查找所有的radio
        const radios = this.$el.querySelectorAll(className);
        const length = radios.length; // 获取长度
        // 获取当前的index
        const index = [].indexOf.call(radios, target);
        // 拿到所有的radio
        const roleRadios = this.$el.querySelectorAll('[role=radio]');
        switch (e.keyCode) {
          case keyCode.LEFT:
          case keyCode.UP:
            e.stopPropagation();
            e.preventDefault();
            // 手动进行点击已经focus
            if (index === 0) {
              roleRadios[length - 1].click();
              roleRadios[length - 1].focus();
            } else {
              roleRadios[index - 1].click();
              roleRadios[index - 1].focus();
            }
            break;
          case keyCode.RIGHT:
          case keyCode.DOWN:
            if (index === (length - 1)) {
              e.stopPropagation();
              e.preventDefault();
              roleRadios[0].click();
              roleRadios[0].focus();
            } else {
              roleRadios[index + 1].click();
              roleRadios[index + 1].focus();
            }
            break;
          default:
            break;
        }
      }
    },
    watch: {
      // 当值改变的时候向formItem 暴露
      value(value) {
        this.dispatch('ElFormItem', 'el.form.change', [this.value]);
      }
    }
  };
</script>

