import Vue from 'vue';
import merge from 'element-ui/src/utils/merge'; // 合并
import PopupManager from 'element-ui/src/utils/popup/popup-manager';
import getScrollBarWidth from '../scrollbar-width'; // 获取scrollbar的宽度
import { getStyle, addClass, removeClass, hasClass } from '../dom';

let idSeed = 1; // ID

let scrollBarWidth; // 滚动条的宽度

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 打开的延迟时间
    openDelay: {},
    // 关闭的延迟时间
    closeDelay: {},
    // 压盖值
    zIndex: {},
    // 是否显示modal层级
    modal: {
      type: Boolean,
      default: false
    },
    modalFade: {
      type: Boolean,
      default: true
    },
    modalClass: {},
    // modal是否添加的body
    modalAppendToBody: {
      type: Boolean,
      default: false
    },
    //  锁定滚动
    lockScroll: {
      type: Boolean,
      default: true
    },
    // 按escape键关闭弹框
    closeOnPressEscape: {
      type: Boolean,
      default: false
    },
    // 点击modal关闭弹框
    closeOnClickModal: {
      type: Boolean,
      default: false
    }
  },

  beforeMount() {
    // 先获取popupId idSeed是公共的，混入的东西是每个组件的， 加载之后，生成popupId
    this._popupId = 'popup-' + idSeed++;
    // 把当前组件以及对应的ID注册到PopupManager里面
    PopupManager.register(this._popupId, this);
  },
  // 销毁之前，先注销，然后关闭modal
  beforeDestroy() {
    PopupManager.deregister(this._popupId);
    PopupManager.closeModal(this._popupId);
    // 重置body的样式
    this.restoreBodyStyle();
  },

  data() {
    return {
      opened: false, // 是否开启弹框了
      bodyPaddingRight: null,
      computedBodyPaddingRight: 0,
      withoutHiddenClass: true,
      rendered: false // 是否渲染过了
    };
  },

  watch: {
    // 先执行混入的visible, 然后再执行具体组件里面的visible
    visible(val) {
      if (val) {
        if (this._opening) return;
        // 如果未渲染， 进行渲染
        if (!this.rendered) {
          this.rendered = true;
          Vue.nextTick(() => {
            this.open();
          });
        } else {
          // 如果已经渲染， 直接打开
          this.open();
        }
      } else {
        this.close();
      }
    }
  },

  methods: {
    // 上树之后触发这个, 或者显示的时候触发这个函数
    open(options) {
      if (!this.rendered) {
        this.rendered = true;
      }
      // 合并props
      const props = merge({}, this.$props || this, options);

      // 设置closeTimer为空，
      if (this._closeTimer) {
        clearTimeout(this._closeTimer);
        this._closeTimer = null;
      }
      // 关闭openTimer
      clearTimeout(this._openTimer);
      // 如果延迟时间大于0，设置定时器，然后打开， 否则直接打开
      const openDelay = Number(props.openDelay);
      if (openDelay > 0) {
        this._openTimer = setTimeout(() => {
          this._openTimer = null;
          this.doOpen(props);
        }, openDelay);
      } else {
        this.doOpen(props);
      }
    },

    doOpen(props) {
      if (this.$isServer) return;
      if (this.willOpen && !this.willOpen()) return;
      // 如果已经打开了， 则直接返回
      if (this.opened) return;

      this._opening = true;

      const dom = this.$el; // 获取当前的dom

      const modal = props.modal; // 获取当前是否要显示modal

      const zIndex = props.zIndex; // 获取当前的压盖值
      // 如果存在压盖，用PopupManager
      if (zIndex) {
        PopupManager.zIndex = zIndex;
      }

      if (modal) {
        if (this._closing) {
          PopupManager.closeModal(this._popupId);
          this._closing = false;
        }
        // props.modalClass, props.modalFade 目前这两个属性都是默认的，无任何操作
        PopupManager.openModal(this._popupId, PopupManager.nextZIndex(), this.modalAppendToBody ? undefined : dom, props.modalClass, props.modalFade);
        // 锁定body的scroll
        if (props.lockScroll) {
          // 如果没有hiddenclass
          this.withoutHiddenClass = !hasClass(document.body, 'el-popup-parent--hidden');
          if (this.withoutHiddenClass) {
            this.bodyPaddingRight = document.body.style.paddingRight;
            this.computedBodyPaddingRight = parseInt(getStyle(document.body, 'paddingRight'), 10);
          }
          // 获取滚动条的宽度
          scrollBarWidth = getScrollBarWidth();
          let bodyHasOverflow = document.documentElement.clientHeight < document.body.scrollHeight;
          let bodyOverflowY = getStyle(document.body, 'overflowY');
          if (scrollBarWidth > 0 && (bodyHasOverflow || bodyOverflowY === 'scroll') && this.withoutHiddenClass) {
            document.body.style.paddingRight = this.computedBodyPaddingRight + scrollBarWidth + 'px';
          }
          addClass(document.body, 'el-popup-parent--hidden');
        }
      }

      if (getComputedStyle(dom).position === 'static') {
        dom.style.position = 'absolute';
      }

      dom.style.zIndex = PopupManager.nextZIndex();
      this.opened = true;

      this.onOpen && this.onOpen();

      this.doAfterOpen();
    },

    doAfterOpen() {
      this._opening = false;
    },

    close() {
      if (this.willClose && !this.willClose()) return;

      if (this._openTimer !== null) {
        clearTimeout(this._openTimer);
        this._openTimer = null;
      }
      clearTimeout(this._closeTimer);

      const closeDelay = Number(this.closeDelay);

      if (closeDelay > 0) {
        this._closeTimer = setTimeout(() => {
          this._closeTimer = null;
          this.doClose();
        }, closeDelay);
      } else {
        this.doClose();
      }
    },

    doClose() {
      this._closing = true;

      this.onClose && this.onClose();

      if (this.lockScroll) {
        setTimeout(this.restoreBodyStyle, 200);
      }

      this.opened = false;

      this.doAfterClose();
    },

    doAfterClose() {
      PopupManager.closeModal(this._popupId);
      this._closing = false;
    },

    restoreBodyStyle() {
      if (this.modal && this.withoutHiddenClass) {
        document.body.style.paddingRight = this.bodyPaddingRight;
        removeClass(document.body, 'el-popup-parent--hidden');
      }
      this.withoutHiddenClass = true;
    }
  }
};

export {
  PopupManager
};
