// vue项目，相当于通常的main.js文件， 一切的开始。
import Vue from 'vue';
import entry from './app'; // 入口文件
import VueRouter from 'vue-router';
// 从main/index引入文件， 其他的项目直接引入这个项目，获取index.js暴露的所有变量
import Element from 'main/index.js';
import hljs from 'highlight.js'; // 用于代码高亮
import routes from './route.config'; // 路由
import demoBlock from './components/demo-block'; // loader里面解析使用的，wrap部分，用于包含代码以及组件展示的部分。
import MainFooter from './components/footer'; // 官网底部
import MainHeader from './components/header'; // 官网头部
import SideNav from './components/side-nav'; // 左侧
import FooterNav from './components/footer-nav'; // 每个组件模块讲解的底部， 用于上一个，下一个的操作
import title from './i18n/title'; // 浏览器title的语言包， 根据分语言和页面

// element-ui的样式
import 'packages/theme-chalk/src/index.scss';

// 每一个组件api demo的样式
import './demo-styles/index.scss';
// 公共样式
import './assets/styles/common.css';
// 字体图标的样式文件
import './assets/styles/fonts/style.css';
// 所有的icon名字json文件
import icon from './icon.json';

Vue.use(Element);
Vue.use(VueRouter);

// 设置为全局组件
Vue.component('demo-block', demoBlock);
Vue.component('main-footer', MainFooter);
Vue.component('main-header', MainHeader);
Vue.component('side-nav', SideNav);
Vue.component('footer-nav', FooterNav);

const globalEle = new Vue({
  data: { $isEle: false } // 是否 ele 用户
});

// 全局混入$isEle，用于判断是否为ele用户
Vue.mixin({
  computed: {
    $isEle: {
      get: () => (globalEle.$data.$isEle),
      set: (data) => { globalEle.$data.$isEle = data; }
    }
  }
});

Vue.prototype.$icon = icon; // md页面使用， 可以直接通过原型链访问

const router = new VueRouter({
  mode: 'hash',
  base: __dirname, // 设置之后，使用 vue-router api 进行跳转 都会加上这个 base 路径 eg: /base/login
  routes
});

// 路由守卫，负责处理不同page,不同语言下的浏览器title
router.afterEach(route => {
  // https://github.com/highlightjs/highlight.js/issues/909#issuecomment-131686186
  Vue.nextTick(() => {
    const blocks = document.querySelectorAll('pre code:not(.hljs)');
    Array.prototype.forEach.call(blocks, hljs.highlightBlock);
  });
  // 根据route里面的语言去相关的语言包
  const data = title[route.meta.lang];
  // 遍历不同页面的title,根据key值进行正则匹配
  for (let val in data) {
    if (new RegExp('^' + val, 'g').test(route.name)) {
      document.title = data[val];
      return;
    }
  }
  // 如果没有匹配到，默认为Element
  document.title = 'Element';
  // 在index.tpl页面定义。本质是一个console.log
  ga('send', 'event', 'PageView', route.name);
});
// ...entry 和render都可以运行， entry传入一个vue的对象， Vue能够解析。 render函数是返回一个Vnode
new Vue({ // eslint-disable-line
  ...entry,
  // render: h => h(entry),
  router
}).$mount('#app');
