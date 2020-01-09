//  这个函数的主要作用就是把从下标为一开始合并到下标为0 的对象里面
export default function(target) {
  // 从第一项开始遍历
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i] || {};
    // 遍历当前的对象
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }

  return target;
};
