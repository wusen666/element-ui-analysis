const getReference = (el, binding, vnode) => {
  // 如果存在表达式 ， 获取表达式的值， 否则获取传入的arg参数
  const _ref = binding.expression ? binding.value : binding.arg;
  // vnode.context 是一个组件， 通过$refs[_ref] 获取组件
  const popper = vnode.context.$refs[_ref];
  // 存在
  if (popper) {
    // 判断是否有多层
    if (Array.isArray(popper)) {
      popper[0].$refs.reference = el;
    } else {
      popper.$refs.reference = el;
    }
  }
};

export default {
  // 绑定的时候执行
  bind(el, binding, vnode) {
    getReference(el, binding, vnode);
  },
  // 插入的时候执行
  inserted(el, binding, vnode) {
    getReference(el, binding, vnode);
  }
};
