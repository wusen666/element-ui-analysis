<template>
  <transition
    name="dialog-fade"
    @after-enter="afterEnter"
    @after-leave="afterLeave">
    <!-- 外层的黑色遮罩 -->
    <div
      v-show="visible"
      class="el-dialog__wrapper"
      @click.self="handleWrapperClick">
      <!-- 真实的dom -->
      <div
        role="dialog"
        :key="key"
        aria-modal="true"
        :aria-label="title || 'dialog'"
        :class="['el-dialog', { 'is-fullscreen': fullscreen, 'el-dialog--center': center }, customClass]"
        ref="dialog"
        :style="style">
        <div class="el-dialog__header">
          <!-- title和slot都能传入 -->
          <slot name="title">
            <span class="el-dialog__title">{{ title }}</span>
          </slot>
          <button
            type="button"
            class="el-dialog__headerbtn"
            aria-label="Close"
            v-if="showClose"
            @click="handleClose">
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>
        <div class="el-dialog__body" v-if="rendered"><slot></slot></div>
        <div class="el-dialog__footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import Popup from 'element-ui/src/utils/popup';
  import Migrating from 'element-ui/src/mixins/migrating';
  import emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElDialog',

    mixins: [Popup, emitter, Migrating],

    props: {
      title: {
        type: String,
        default: ''
      },

      modal: {
        type: Boolean,
        default: true
      },

      modalAppendToBody: {
        type: Boolean,
        default: true
      },

      appendToBody: {
        type: Boolean,
        default: false
      },

      lockScroll: {
        type: Boolean,
        default: true
      },
      // 点击外层关闭弹框
      closeOnClickModal: {
        type: Boolean,
        default: true
      },

      closeOnPressEscape: {
        type: Boolean,
        default: true
      },

      showClose: {
        type: Boolean,
        default: true
      },

      width: String,

      fullscreen: Boolean,
      // 自定义样式
      customClass: {
        type: String,
        default: ''
      },

      top: {
        type: String,
        default: '15vh'
      },
      beforeClose: Function,
      center: {
        type: Boolean,
        default: false
      },

      destroyOnClose: Boolean
    },

    data() {
      return {
        closed: false,
        key: 0
      };
    },

    watch: {
      visible(val) {
        if (val) {
          // 表示未关闭动作
          this.closed = false;
          // 向外暴露open事件
          this.$emit('open');
          // 绑定scroll事件， 滚动的时候updatePopper
          this.$el.addEventListener('scroll', this.updatePopper);
          // 恢复到滚动为0的状态
          this.$nextTick(() => {
            this.$refs.dialog.scrollTop = 0;
          });
          // 如果appendToBody为true, 把当前的$el 转移到body层级。
          if (this.appendToBody) {
            document.body.appendChild(this.$el);
          }
        } else {
          // 关闭的时候移除scroll事件
          this.$el.removeEventListener('scroll', this.updatePopper);
          // 向外暴露close事件
          if (!this.closed) this.$emit('close');
          if (this.destroyOnClose) {
            this.$nextTick(() => {
              this.key++;
            });
          }
        }
      }
    },

    computed: {
      style() {
        let style = {};
        if (!this.fullscreen) {
          style.marginTop = this.top;
          if (this.width) {
            style.width = this.width;
          }
        }
        return style;
      }
    },

    methods: {
      getMigratingConfig() {
        return {
          props: {
            'size': 'size is removed.'
          }
        };
      },
      // 点击外层
      handleWrapperClick() {
        if (!this.closeOnClickModal) return;
        this.handleClose();
      },
      // 关闭
      handleClose() {
        // 关闭之前进行的一些操作
        if (typeof this.beforeClose === 'function') {
          this.beforeClose(this.hide);
        } else {
          this.hide();
        }
      },
      // 具体的关闭事件
      hide(cancel) {
        if (cancel !== false) {
          // 关闭弹框
          this.$emit('update:visible', false);
          // 向外暴露关闭函数
          this.$emit('close');
          this.closed = true;
        }
      },
      // 当滚动的时候向有popper的组件发射事件，进行更新popper
      updatePopper() {
        this.broadcast('ElSelectDropdown', 'updatePopper');
        this.broadcast('ElDropdownMenu', 'updatePopper');
      },
      afterEnter() {
        // 通过transition 暴露opened事件
        this.$emit('opened');
      },
      afterLeave() {
        // 通过transition 暴露closed事件
        this.$emit('closed');
      }
    },

    mounted() {
      if (this.visible) {
        // 其他的东西上树之后才开始渲染body里面的内容
        this.rendered = true;
        this.open();
        // 把当前的$el添加到body层级
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
      }
    },

    destroyed() {
      // if appendToBody is true, remove DOM node after destroy
      if (this.appendToBody && this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
    }
  };
</script>
