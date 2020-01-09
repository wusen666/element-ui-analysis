import Vue from 'vue';

let scrollBarWidth;

export default function() {
  if (Vue.prototype.$isServer) return 0;
  // 如果已经执行过，并且得到scrollBarWidth， 直接返回
  if (scrollBarWidth !== undefined) return scrollBarWidth;

  // 创建一个元素，添加类名， 设置绝对定位，并且visibility为hidden
  const outer = document.createElement('div');
  outer.className = 'el-scrollbar__wrap';
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  // 上树
  document.body.appendChild(outer);
  // 获取宽度
  const widthNoScroll = outer.offsetWidth;
  // 设置为滚动
  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');
  inner.style.width = '100%';
  // 把元素添加到里面
  outer.appendChild(inner);
  // 获取里面的宽度
  const widthWithScroll = inner.offsetWidth;
  // 移除节点
  outer.parentNode.removeChild(outer);
  // 外部的offsetWidth - 内部的offsetWidth 得到scrollBar的宽度
  scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth; // 返回
};
