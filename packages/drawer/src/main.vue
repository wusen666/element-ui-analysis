<template>
  <transition
    name="el-drawer-fade"
    @after-enter="afterEnter"
    @after-leave="afterLeave">
    <div
      class="el-drawer__wrapper"
      tabindex="-1"
      v-show="visible">
      <div
        class="el-drawer__container"
        :class="visible && 'el-drawer__open'"
        @click.self="handleWrapperClick"
        role="document"
        tabindex="-1">
        <div
          aria-modal="true"
          aria-labelledby="el-drawer__title"
          :aria-label="title"
          class="el-drawer"
          :class="[direction, customClass]"
          :style="isHorizontal ? `width: ${size}` : `height: ${size}`"
          ref="drawer"
          role="dialog"
          tabindex="-1"
          >
          <!-- 是否存在头部 -->
          <header class="el-drawer__header" id="el-drawer__title" v-if="withHeader">
            <slot name="title">
              <span role="heading" tabindex="0" :title="title">{{ title }}</span>
            </slot>
            <button
              :aria-label="`close ${title || 'drawer'}`"
              class="el-drawer__close-btn"
              type="button"
              v-if="showClose"
              @click="closeDrawer">
              <i class="el-dialog__close el-icon el-icon-close"></i>
            </button>
          </header>
          <!-- 弹出框树之后才开始渲染内容 -->
          <section class="el-drawer__body" v-if="rendered">
            <slot></slot>
          </section>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
//  和弹框类似
import Popup from 'element-ui/src/utils/popup';
import emitter from 'element-ui/src/mixins/emitter';
import Utils from 'element-ui/src/utils/aria-utils';

export default {
  name: 'ElDrawer',
  mixins: [Popup, emitter],
  props: {
    appendToBody: {
      type: Boolean,
      default: false
    },
    beforeClose: {
      type: Function
    },
    customClass: {
      type: String,
      default: ''
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true
    },
    destroyOnClose: {
      type: Boolean,
      default: false
    },
    modal: {
      type: Boolean,
      default: true
    },
    direction: {
      type: String,
      default: 'rtl',
      validator(val) {
        return ['ltr', 'rtl', 'ttb', 'btt'].indexOf(val) !== -1;
      }
    },
    modalAppendToBody: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: '30%'
    },
    title: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean
    },
    // 能否点击wrapper关闭
    wrapperClosable: {
      type: Boolean,
      default: true
    },
    withHeader: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    // 水平方向设置宽度， 纵向设置height
    isHorizontal() {
      // 判断是否水平方向， 保证方向就是rtl 或者 ltr
      return this.direction === 'rtl' || this.direction === 'ltr';
    }
  },
  data() {
    return {
      closed: false,
      prevActiveElement: null
    };
  },
  watch: {
    visible(val) {
      if (val) {
        // 表示未关闭状态
        this.closed = false;
        // 向上抛open事件
        this.$emit('open');
        // 如果打开了appendToBody, 把节点移动到body下一层级
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
        // 获取当前得到focus的元素
        this.prevActiveElement = document.activeElement;
        this.$nextTick(() => {
          // 给第一个可focus子孙添加focus
          Utils.focusFirstDescendant(this.$refs.drawer);
        });
      } else {
        // 向上抛出closed事件, 主要是用于判断内部事件的关闭，还是外部调用的关闭，
        // 如果是内部事件，走hide方法的emit(close), 如果是外部，走这里的事件
        if (!this.closed) this.$emit('close');
        this.$nextTick(() => {
          // 关闭drawer之后， 给之前的有focus的节点再次获取焦点。
          if (this.prevActiveElement) {
            this.prevActiveElement.focus();
          }
        });
      }
    }
  },
  methods: {
    // 开启
    afterEnter() {
      this.$emit('opened');
    },
    // 结束
    afterLeave() {
      this.$emit('closed');
    },
    hide(cancel) {
      if (cancel !== false) {
        // 如果不取消，执行关闭
        this.$emit('update:visible', false);
        this.$emit('close');
        // 通过v-if, 和rendered让内容下树
        if (this.destroyOnClose === true) {
          this.rendered = false;
        }
        // 设置关闭状态
        this.closed = true;
      }
    },
    // 点击wrapper关闭弹出框
    handleWrapperClick() {
      if (this.wrapperClosable) {
        this.closeDrawer();
      }
    },
    closeDrawer() {
      if (typeof this.beforeClose === 'function') {
        // 调用关闭之前的回调之后然后关闭
        // 暴露给外部的调用人员，外部人员可以把done传入cancle用于取消
        this.beforeClose(this.hide);
      } else {
        // 关闭
        this.hide();
      }
    },
    handleClose() {
      // This method here will be called by PopupManger, when the `closeOnPressEscape` was set to true
      // pressing `ESC` will call this method, and also close the drawer.
      // This method also calls `beforeClose` if there was one.
      this.closeDrawer();
    }
  },
  mounted() {
    // 上树之后， 如果可看见的花，渲染rendered
    if (this.visible) {
      this.rendered = true;
      this.open(); // 在混入里面
    }
  },
  destroyed() {
    // if appendToBody is true, remove DOM node after destroy
    // 如果添加到body层， 移出节点
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  }
};
</script>
