<template>
  <button
    class="el-button"
    @click="handleClick"
    :disabled="buttonDisabled || loading"
    :autofocus="autofocus" 
    :type="nativeType"
    :class="[
      type ? 'el-button--' + type : '',
      buttonSize ? 'el-button--' + buttonSize : '',
      {
        'is-disabled': buttonDisabled,
        'is-loading': loading,
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle
      }
    ]"
  >
    <i class="el-icon-loading" v-if="loading"></i>
    <!-- loading存在的时候， 让icon消失 -->
    <i :class="icon" v-if="icon && !loading"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>
<script>
  export default {
    name: 'ElButton',
    // 导入form的一些属性， 用于做一些判断处理
    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    props: {
      type: {
        type: String,
        default: 'default'
      },
      size: String,
      icon: {
        type: String,
        default: ''
      },
      // 按钮最原始的类型 默认为button, 可以是submit, reset
      nativeType: {
        type: String,
        default: 'button'
      },
      loading: Boolean,
      disabled: Boolean,
      plain: Boolean,
      autofocus: Boolean, // 自动聚焦
      round: Boolean, // 是否圆角
      circle: Boolean // 是否圆形
    },

    computed: {
      _elFormItemSize() {
        // 返回elFormItem的size属性
        return (this.elFormItem || {}).elFormItemSize;
      },
      buttonSize() {
        // 自身的size 级别高， 另外是elformItem的size,  有地方定义$ELEMENT，暂且不明白定义原因
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      buttonDisabled() {
        // 通过注入，判断disabled是否存在， 可以禁用，目的是让elForm 的disabled控制
        return this.disabled || (this.elForm || {}).disabled;
      }
    },

    methods: {
      handleClick(evt) {
        this.$emit('click', evt);
      }
    }
  };
</script>
