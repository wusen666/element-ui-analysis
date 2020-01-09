import { addClass, removeClass } from 'element-ui/src/utils/dom';
// transition 类， js控制样式的变化
// collapse-transition 是一个css3 transition
class Transition {
  // 进入之前
  beforeEnter(el) {
    // 添加 collapse-transition 类名
    addClass(el, 'collapse-transition');
    // 数据记录
    if (!el.dataset) el.dataset = {};
    // 记录之前的paddingTop, paddingBottom
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;
    // 把高度，padding,bottom 置为空。 相当于消失
    el.style.height = '0';
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
  }

  enter(el) {
    el.dataset.oldOverflow = el.style.overflow;
    if (el.scrollHeight !== 0) {
      // scrollHeight 内部所有的高度
      el.style.height = el.scrollHeight + 'px';
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    } else {
      el.style.height = '';
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    }
    // 转化为overflow:hidden， 不出现滚动条
    el.style.overflow = 'hidden';
  }

  afterEnter(el) {
    // for safari: remove class then reset height is necessary
    removeClass(el, 'collapse-transition');
    el.style.height = '';
    // 回复以前的overflow模式
    el.style.overflow = el.dataset.oldOverflow;
  }

  beforeLeave(el) {
    // 记录paddingTop, paddingBotton, overflow信息
    if (!el.dataset) el.dataset = {};
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;
    el.dataset.oldOverflow = el.style.overflow;
    // 设置高度， 然后overflow: hidden
    el.style.height = el.scrollHeight + 'px';
    el.style.overflow = 'hidden';
  }

  leave(el) {
    if (el.scrollHeight !== 0) {
      // for safari: add class after set height, or it will jump to zero height suddenly, weired
      // 增添类名，然后把所有的属性置为0 ，开始运动
      addClass(el, 'collapse-transition');
      el.style.height = 0;
      el.style.paddingTop = 0;
      el.style.paddingBottom = 0;
    }
  }

  afterLeave(el) {
    // 运动结束， 移除类名， 然后设置相关的padding, overflow
    removeClass(el, 'collapse-transition');
    el.style.height = '';
    el.style.overflow = el.dataset.oldOverflow;
    el.style.paddingTop = el.dataset.oldPaddingTop;
    el.style.paddingBottom = el.dataset.oldPaddingBottom;
  }
}
// 向外暴露一个组件， 组件渲染的是transition, 所以能出发在data里面定义的钩子函数，
export default {
  name: 'ElCollapseTransition',
  functional: true, // 设置为true之后就是无状态无实例的函数化组件
  // render函数需要仔细学习一下， 传入data，on之后，就自动掉这些方法了
  render(h, { children }) {
    const data = {
      on: new Transition() // 函数式组件方法写到on对象里面 相当于eg: v-on:before-enter="beforeEnter"
    };

    return h('transition', data, children);
  }
};
