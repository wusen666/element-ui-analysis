<template>
  <span>
    <transition
      :name="transition"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave">
      <div
        class="el-popover el-popper"
        :class="[popperClass, content && 'el-popover--plain']"
        ref="popper"
        v-show="!disabled && showPopper"
        :style="{ width: width + 'px' }"
        role="tooltip"
        :id="tooltipId"
        :aria-hidden="(disabled || !showPopper) ? 'true' : 'false'"
      >
        <div class="el-popover__title" v-if="title" v-text="title"></div>
        <slot>{{ content }}</slot>
      </div>
    </transition>
    <!-- 能够触发显示的文本 -->
    <slot name="reference"></slot>
  </span>
</template>
<script>
import Popper from 'element-ui/src/utils/vue-popper';
import { on, off } from 'element-ui/src/utils/dom';
import { addClass, removeClass } from 'element-ui/src/utils/dom';
import { generateId } from 'element-ui/src/utils/util';

export default {
  name: 'ElPopover',

  mixins: [Popper],

  props: {
    trigger: {
      type: String,
      default: 'click',
      // 值必须匹配以下字符串的一个
      validator: value => ['click', 'focus', 'hover', 'manual'].indexOf(value) > -1
    },
    // 触发方式为 hover 时的显示延迟，单位为毫秒
    openDelay: {
      type: Number,
      default: 0
    },
    // 触发方式为 hover 时的隐藏延迟，单位为毫秒
    closeDelay: {
      type: Number,
      default: 200
    },
    title: String,
    disabled: Boolean,
    content: String, // 传入的文本
    reference: {}, // 没啥用， 废弃了
    // 为popperClass 添加的类名
    popperClass: String,
    // number 或者string类型
    width: {},
    // 是否显示tooltip箭头
    visibleArrow: {
      default: true
    },
    // 箭头的偏移量，但是现在已经废弃
    arrowOffset: {
      type: Number,
      default: 0
    },
    // 运动的方式
    transition: {
      type: String,
      default: 'fade-in-linear'
    },
    // Popover的tabIndex高度
    tabindex: {
      type: Number,
      default: 0
    }
  },

  computed: {
    // 提示条的Id
    tooltipId() {
      return `el-popover-${generateId()}`;
    }
  },
  watch: {
    // 深度监听showPopper, 判断是否显示弹框
    showPopper(val) {
      if (this.disabled) {
        return;
      }
      // 根据显示隐藏，向外暴露事件
      val ? this.$emit('show') : this.$emit('hide');
    }
  },

  mounted() {
    // reference 目前已经api文档划去了， 获取reference的组件的内容, 现在已经无法取到了
    let reference = this.referenceElm = this.reference || this.$refs.reference;
    // 拿到popper组件
    const popper = this.popper || this.$refs.popper;
    // 如果reference内容不存在， 并且slots里面的reference存在的还， 拿到相关的
    // this.$slots.reference返回的是一个虚拟节点数组
    if (!reference && this.$slots.reference && this.$slots.reference[0]) {
      reference = this.referenceElm = this.$slots.reference[0].elm;
    }
    if (reference) {
      // 添加类
      addClass(reference, 'el-popover__reference');
      reference.setAttribute('aria-describedby', this.tooltipId);
      // tabindex设置
      reference.setAttribute('tabindex', this.tabindex); // tab序列
      popper.setAttribute('tabindex', 0);

      if (this.trigger !== 'click') {
        on(reference, 'focusin', () => {
          this.handleFocus();
          const instance = reference.__vue__;
          if (instance && typeof instance.focus === 'function') {
            instance.focus();
          }
        });
        // click或者focus的时候显示
        on(popper, 'focusin', this.handleFocus);
        on(reference, 'focusout', this.handleBlur);
        on(popper, 'focusout', this.handleBlur);
      }
      // 按键为27的时候关闭
      on(reference, 'keydown', this.handleKeydown);
      on(reference, 'click', this.handleClick);
    }
    if (this.trigger === 'click') {
      // 添加click 事件
      on(reference, 'click', this.doToggle);
      // 用于点击页面的其他地方，然后关闭弹框
      on(document, 'click', this.handleDocumentClick);
    } else if (this.trigger === 'hover') {
      on(reference, 'mouseenter', this.handleMouseEnter);
      on(popper, 'mouseenter', this.handleMouseEnter);
      on(reference, 'mouseleave', this.handleMouseLeave);
      on(popper, 'mouseleave', this.handleMouseLeave);
    } else if (this.trigger === 'focus') {
      if (this.tabindex < 0) {
        console.warn('[Element Warn][Popover]a negative taindex means that the element cannot be focused by tab key');
      }
      // 如果能搜索到input,textarea添加focus, 否则利用鼠标移上移下事件
      // 搜到即返回，搜不到寻找换下一个元素搜索
      if (reference.querySelector('input, textarea')) {
        on(reference, 'focusin', this.doShow);
        on(reference, 'focusout', this.doClose);
      } else {
        // 使用mousedown,mouseup触发事件
        on(reference, 'mousedown', this.doShow);
        on(reference, 'mouseup', this.doClose);
      }
    }
  },
  // 生命周期，组件被销毁前
  beforeDestroy() {
    this.cleanup();
  },
  // 不激活的时候触发
  deactivated() {
    this.cleanup();
  },

  methods: {
    // 切换显示隐藏
    doToggle() {
      this.showPopper = !this.showPopper;
    },
    // 显示
    doShow() {
      this.showPopper = true;
    },
    // 关闭
    doClose() {
      this.showPopper = false;
    },
    // 触发focus事件， 并且只有click和focus的情况下才能显示弹出框
    handleFocus() {
      addClass(this.referenceElm, 'focusing');
      if (this.trigger === 'click' || this.trigger === 'focus') this.showPopper = true;
    },
    // 添加类
    handleClick() {
      removeClass(this.referenceElm, 'focusing');
    },
    // 移除类名。当切仅当是click, focus的情况下才会消失
    handleBlur() {
      removeClass(this.referenceElm, 'focusing');
      if (this.trigger === 'click' || this.trigger === 'focus') this.showPopper = false;
    },
    // 开启弹出框
    handleMouseEnter() {
      clearTimeout(this._timer);
      if (this.openDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = true;
        }, this.openDelay);
      } else {
        this.showPopper = true;
      }
    },
    handleKeydown(ev) {
      if (ev.keyCode === 27 && this.trigger !== 'manual') { // esc
        this.doClose();
      }
    },
    // 关闭
    handleMouseLeave() {
      clearTimeout(this._timer);
      if (this.closeDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = false;
        }, this.closeDelay);
      } else {
        this.showPopper = false;
      }
    },
    // 文档点击
    handleDocumentClick(e) {
      // 获取popper, reference
      let reference = this.reference || this.$refs.reference;
      const popper = this.popper || this.$refs.popper;

      if (!reference && this.$slots.reference && this.$slots.reference[0]) {
        reference = this.referenceElm = this.$slots.reference[0].elm;
      }
      // 判断弹框和reference是否包含当前点击的元素
      if (!this.$el ||
        !reference ||
        this.$el.contains(e.target) ||
        reference.contains(e.target) ||
        !popper ||
        popper.contains(e.target)) return;
      this.showPopper = false;
    },
    handleAfterEnter() {
      // 动画进入之后，向上抛出事件
      this.$emit('after-enter');
    },
    handleAfterLeave() {
      // 动画离开之后，向上抛出事件
      this.$emit('after-leave');
      // 离开之后销毁节点
      this.doDestroy();
    },
    // 清楚延时定时
    cleanup() {
      if (this.openDelay || this.closeDelay) {
        clearTimeout(this._timer);
      }
    }
  },

  destroyed() {
    // 移除所有的事件
    const reference = this.reference;

    off(reference, 'click', this.doToggle);
    off(reference, 'mouseup', this.doClose);
    off(reference, 'mousedown', this.doShow);
    off(reference, 'focusin', this.doShow);
    off(reference, 'focusout', this.doClose);
    off(reference, 'mousedown', this.doShow);
    off(reference, 'mouseup', this.doClose);
    off(reference, 'mouseleave', this.handleMouseLeave);
    off(reference, 'mouseenter', this.handleMouseEnter);
    off(document, 'click', this.handleDocumentClick);
  }
};
</script>
