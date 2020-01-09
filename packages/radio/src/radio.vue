<template>
  <label
    class="el-radio"
    :class="[
    // 都是通过类名来控制
      // border 为真的时候 radioSize 才有效
      border && radioSize ? 'el-radio--' + radioSize : '',
      { 'is-disabled': isDisabled }, // 禁用
      { 'is-focus': focus }, // 聚焦状态
      { 'is-bordered': border }, // 是否显示边框
      { 'is-checked': model === label } 
    ]"
    role="radio"
    :aria-checked="model === label"
    :aria-disabled="isDisabled"
    :tabindex="tabIndex"
    @keydown.space.stop.prevent="model = isDisabled ? model : label"
  >
    <span class="el-radio__input"
      :class="{
        'is-disabled': isDisabled,
        'is-checked': model === label
      }"
    >
      <span class="el-radio__inner"></span>
      <!-- // radio -->
      <!-- 绑定的label值 -->
      <!-- model动态改变 -->
      <input
        ref="radio"
        class="el-radio__original"
        :value="label" 
        type="radio"
        aria-hidden="true"
        v-model="model"
        @focus="focus = true"
        @blur="focus = false"
        @change="handleChange"
        :name="name"
        :disabled="isDisabled"
        tabindex="-1"
      >
    </span>
    <span class="el-radio__label" @keydown.stop>
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
// 引入信息传输
import Emitter from 'element-ui/src/mixins/emitter';

export default {
  name: 'ElRadio',

  mixins: [Emitter],

  inject: {
    // 导入elForm和elFormItem选项
    elForm: {
      default: ''
    },

    elFormItem: {
      default: ''
    }
  },

  componentName: 'ElRadio',

  props: {
    value: {}, // v-model绑定的值
    label: {}, // 传进来的用于绑定label的选项
    disabled: Boolean,
    name: String,
    border: Boolean,
    size: String
  },

  data() {
    return {
      focus: false
    };
  },
  computed: {
    // 是否是一组
    isGroup() {
      let parent = this.$parent;
      // 不断的查找上一级，如果无法找到就是不存在Group, 不是成组的
      while (parent) {
        if (parent.$options.componentName !== 'ElRadioGroup') {
          parent = parent.$parent;
        } else {
          this._radioGroup = parent;
          return true;
        }
      }
      return false;
    },
    // this.value 是外层的v-model, 不能进行改变，所以在computed定义一个另外一个变量，通过get来取值， set来改变值
    model: {
      // 获取model的值， 如果是group, 获取group的value, 否则获取自身的value
      get() {
        return this.isGroup ? this._radioGroup.value : this.value;
      },
      set(val) {
        // 分两种来进行改变， 成组的和单个的。
        if (this.isGroup) {
          // 向radiogroup传递， 事件为input, 值为val
          // 进行改变
          this.dispatch('ElRadioGroup', 'input', [val]);
        } else {
          // 改变input val
          // 改变当前的
          this.$emit('input', val);
        }
        // 获取radio, 通过ref来给添加是否选中状态
        // v-model 只是来拿值然后通过checked来进行处理是否绑定的状态
        this.$refs.radio && (this.$refs.radio.checked = this.model === this.label);
      }
    },
    // elFormSize对象
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },
    // 按钮的尺寸
    radioSize() {
      const temRadioSize = this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      return this.isGroup
        ? this._radioGroup.radioGroupSize || temRadioSize
        : temRadioSize;
    },
    // 是否禁用判断
    isDisabled() {
      return this.isGroup
        ? this._radioGroup.disabled || this.disabled || (this.elForm || {}).disabled
        : this.disabled || (this.elForm || {}).disabled;
    },
    // tabIndex 可以控制focus， 暂时知道的
    tabIndex() {
      // 如果禁用或者 一组但是model和label不相等的时候改为-1，否则改为0
      return (this.isDisabled || (this.isGroup && this.model !== this.label)) ? -1 : 0;
    }
  },

  methods: {
    handleChange() {
      this.$nextTick(() => {
        // 改变后值之后，向上暴露change的方法
        this.$emit('change', this.model);
        // 如果是group, 向上暴露
        this.isGroup && this.dispatch('ElRadioGroup', 'handleChange', this.model);
      });
    }
  }
};
</script>
