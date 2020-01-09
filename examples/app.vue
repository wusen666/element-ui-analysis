<template>
  <div id="app" :class="{ 'is-component': isComponent }">
    <main-header v-if="lang !== 'play'"></main-header>
    <div class="main-cnt">
      <router-view></router-view>
    </div>
    <main-footer v-if="lang !== 'play' && !isComponent"></main-footer>
  </div>
</template>

<script>
  import { use } from 'main/locale';
  import zhLocale from 'main/locale/lang/zh-CN';
  import enLocale from 'main/locale/lang/en';
  import esLocale from 'main/locale/lang/es';
  import frLocale from 'main/locale/lang/fr';
  // 通过query拿到语言
  const lang = location.hash.replace('#', '').split('/')[1] || 'zh-CN';
  // 语言化， 通过use, 通知全局使用的语言
  const localize = lang => {
    switch (lang) {
      case 'zh-CN':
        use(zhLocale);
        break;
      case 'es':
        use(esLocale);
        break;
      case 'fr-FR':
        use(frLocale);
        break;
      default:
        use(enLocale);
    }
  };
  // 根据url拿到语言，然后本地语言化
  localize(lang);

  export default {
    name: 'app',

    computed: {
      // 当前的语言
      lang() {
        return this.$route.path.split('/')[1] || 'zh-CN';
      },
      // 当前渲染的组件是否是component
      isComponent() {
        return /^component-/.test(this.$route.name || '');
      }
    },

    watch: {
      // 如果语言发生变化之后，进行切换语言
      lang(val) {
        if (val === 'zh-CN') {
          this.suggestJump();
        }
        // 通知全局语言的切换
        localize(val);
      }
    },

    methods: {
      // 当语言是中文的时候，执行此方法
      suggestJump() {
        if (process.env.NODE_ENV !== 'production') return;
  
        const href = location.href;
        // 用于初次判断， 第一次不是中文网站，两个都是false, 则显示提示， 一旦点击取消，记录取消的状态，刷新页面也不再进行跳转
        const preferGithub = localStorage.getItem('PREFER_GITHUB');
        // 中文的网站，如果存在其中一个，不切换网站
        const cnHref = href.indexOf('eleme.cn') > -1 || href.indexOf('element-cn') > -1 || href.indexOf('element.faas') > -1;
        if (cnHref || preferGithub) return;
        setTimeout(() => {
          if (this.lang !== 'zh-CN') return;
          this.$confirm('建议大陆用户访问部署在国内的站点，是否跳转？', '提示')
            .then(() => {
              location.replace('https://element.eleme.cn');
            })
            .catch(() => {
              // 用于判断是否点击取消过，进行记录，不再提示
              localStorage.setItem('PREFER_GITHUB', 'true');
            });
        }, 1000);
      }
    },

    mounted() {
      // 上树之后，再次初始化语言
      localize(this.lang);
      if (this.lang === 'zh-CN') {
        this.suggestJump();
      }
    }
  };
</script>
