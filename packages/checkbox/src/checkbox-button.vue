<template>
  <label
    class="el-checkbox-button"
      :class="[
        size ? 'el-checkbox-button--' + size : '',
        { 'is-disabled': isDisabled },
        { 'is-checked': isChecked },
        { 'is-focus': focus },
      ]"
    role="checkbox"
    :aria-checked="isChecked"
    :aria-disabled="isDisabled"
    >
    <!-- input 原生自带的功能， truelabel, falseLabel. 如果传入的有这样的值， 就使用这一种input -->
    <input
      v-if="trueLabel || falseLabel"
      class="el-checkbox-button__original"
      type="checkbox"
      :name="name"
      :disabled="isDisabled"
      :true-value="trueLabel"
      :false-value="falseLabel"
      v-model="model"
      @change="handleChange"
      @focus="focus = true"
      @blur="focus = false">
    <input
      v-else
      class="el-checkbox-button__original"
      type="checkbox"
      :name="name"
      :disabled="isDisabled"
      :value="label"
      v-model="model"
      @change="handleChange"
      @focus="focus = true"
      @blur="focus = false">

    <span class="el-checkbox-button__inner"
      v-if="$slots.default || label"
      :style="isChecked ? activeStyle : null">
      <slot>{{label}}</slot>
    </span>

  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElCheckboxButton',

    mixins: [Emitter],
    // form 导入
    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    data() {
      return {
        selfModel: false, // 当前端没有通过v-model传值的时候，做的兼容处理，这时候取这个值
        focus: false, // 是否是得到焦点
        isLimitExceeded: false
      };
    },

    props: {
      value: {},
      label: {},
      disabled: Boolean,
      checked: Boolean,
      name: String,
      trueLabel: [String, Number],
      falseLabel: [String, Number]
    },
    computed: {
      // 双向绑定的model, 用来和数据产生关联
      model: {
        // 如果存在groupp, 直接返回store数组， 否则 判断是否有值， 有值是true,没值是false
        get() {
          return this._checkboxGroup
            ? this.store : this.value !== undefined
              ? this.value : this.selfModel;
        },
        // v-model绑定的值
        set(val) {
          if (this._checkboxGroup) {
            this.isLimitExceeded = false;
            // 会造成一个问题，一旦min和初始的值相差为2，会无法选中。
            (this._checkboxGroup.min !== undefined &&
              val.length < this._checkboxGroup.min &&
              (this.isLimitExceeded = true));

            (this._checkboxGroup.max !== undefined &&
              val.length > this._checkboxGroup.max &&
              (this.isLimitExceeded = true));
            this.isLimitExceeded === false &&
            this.dispatch('ElCheckboxGroup', 'input', [val]);
          } else if (this.value !== undefined) {
            // 传入v-model， 动态的改变这个值
            this.$emit('input', val);
          } else {
            // 没有v-model的时候做的一个暂存处理
            this.selfModel = val;
          }
        }
      },
      // model拿的其实是所有选中的值， 判断是否选中需要通过isChecked
      isChecked() {
        // 一个单独的处理
        if ({}.toString.call(this.model) === '[object Boolean]') {
          return this.model;
        } else if (Array.isArray(this.model)) {
          // 对于数组的处理
          return this.model.indexOf(this.label) > -1;
        } else if (this.model !== null && this.model !== undefined) {
          // 不是boolean和array， 的时候，需要判断是否等于trueLabel
          return this.model === this.trueLabel;
        }
      },
      // 得到上层ElCheckboxGroup
      _checkboxGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElCheckboxGroup') {
            parent = parent.$parent;
          } else {
            return parent;
          }
        }
        return false;
      },
      // 返回group的值或者当前选中的值
      store() {
        return this._checkboxGroup ? this._checkboxGroup.value : this.value;
      },
      // 选中的时候使用此填充色，选中色
      activeStyle() {
        return {
          backgroundColor: this._checkboxGroup.fill || '',
          borderColor: this._checkboxGroup.fill || '',
          color: this._checkboxGroup.textColor || '',
          'box-shadow': '-1px 0 0 0 ' + this._checkboxGroup.fill

        };
      },

      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },

      size() {
        return this._checkboxGroup.checkboxGroupSize || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },

      /* used to make the isDisabled judgment under max/min props */
      // 通过min, max运算符判断此项是否应该是disabled
      isLimitDisabled() {
        const { max, min } = this._checkboxGroup;
        // 超出范围限制
        // 当max或者min存在的时候，选中的长度大于等于max， 并且当前项为选中返回true
        // 当前数量小于min,并且当前已经选中， 都设置为disabled
        return !!(max || min) &&
          (this.model.length >= max && !this.isChecked) ||
          (this.model.length <= min && this.isChecked);
      },

      isDisabled() {
        return this._checkboxGroup
          ? this._checkboxGroup.disabled || this.disabled || (this.elForm || {}).disabled || this.isLimitDisabled
          : this.disabled || (this.elForm || {}).disabled;
      }
    },
    methods: {
      addToStore() {
        if (
          Array.isArray(this.model) &&
          this.model.indexOf(this.label) === -1
        ) {
          // 如果当前为一个数组，并且不存在，添加进去
          this.model.push(this.label);
        } else {
          // 否则直接等于truLabel
          this.model = this.trueLabel || true;
        }
      },
      handleChange(ev) {
        if (this.isLimitExceeded) return;
        let value;
        if (ev.target.checked) {
          value = this.trueLabel === undefined ? true : this.trueLabel;
        } else {
          value = this.falseLabel === undefined ? false : this.falseLabel;
        }
        // 向外暴露change事件
        this.$emit('change', value, ev);
        this.$nextTick(() => {
          if (this._checkboxGroup) {
            this.dispatch('ElCheckboxGroup', 'change', [this._checkboxGroup.value]);
          }
        });
      }
    },

    created() {
      // 当前是选中状态，添加到store里面
      this.checked && this.addToStore();
    }
  };
</script>
