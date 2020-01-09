// 发射事件， 通过componentName 向子级发射事件
function broadcast(componentName, eventName, params) {
    this.$children.forEach(child => {
        var name = child.$options.componentName;
        if (name === componentName) {
            // 子组件向上级发射事件， 但是子组件通过$on监听到本组件的emit事件
            child.$emit.apply(child, [eventName].concat(params));
        } else {
            broadcast.apply(child, [componentName, eventName].concat([params]));
        }
    });
}
export default {
    methods: {
        dispatch(componentName, eventName, params) {
            var parent = this.$parent || this.$root;
            var name = parent.$options.componentName; // 拿到父级的componentName

            // 当父组件存在，且名字和组件的名字不同，或者不存在名字的时候继续向上查找
            while (parent && (!name || name !== componentName)) {
                parent = parent.$parent;
                // parent存在， 获取他的名字
                if (parent) {
                    name = parent.$options.componentName;
                }
            }
            if (parent) {
                // 向当前的父级发送事件，父级通过$on拿到发射到的事件
                parent.$emit.apply(parent, [eventName].concat(params));
            }
        },
        // 向子组件广播
        broadcast(componentName, eventName, params) {
            broadcast.call(this, componentName, eventName, params);
        }
    }
};