/* eslint-disable */

import navConfig from './nav.config'; // 组件(components)部分的路由信息
import langs from './i18n/route'; // 包含的四种语言

// require.ensure() 是 webpack 特有的，已经被 import() 取代。
//  有四个参数 dependency, callback,[errorCallback],[chunkname] . 后两个是可选参数

// vue文件的路由引用
const LOAD_MAP = {
    'zh-CN': name => {
        return r => require.ensure([], () =>
            r(require(`./pages/zh-CN/${name}.vue`)),
            'zh-CN');
    },
    'en-US': name => {
        return r => require.ensure([], () =>
            r(require(`./pages/en-US/${name}.vue`)),
            'en-US');
    },
    'es': name => {
        return r => require.ensure([], () =>
            r(require(`./pages/es/${name}.vue`)),
            'es');
    },
    'fr-FR': name => {
        return r => require.ensure([], () =>
            r(require(`./pages/fr-FR/${name}.vue`)),
            'fr-FR');
    }
};
// vue文件的引用路径
const load = function(lang, path) {
    return LOAD_MAP[lang](path);
};

// md文件的路由，根据语言和路径返回相应的组件引用
const LOAD_DOCS_MAP = {
    'zh-CN': path => {
        return r => require.ensure([], () =>
            r(require(`./docs/zh-CN${path}.md`)),
            'zh-CN');
    },
    'en-US': path => {
        return r => require.ensure([], () =>
            r(require(`./docs/en-US${path}.md`)),
            'en-US');
    },
    'es': path => {
        return r => require.ensure([], () =>
            r(require(`./docs/es${path}.md`)),
            'es');
    },
    'fr-FR': path => {
        return r => require.ensure([], () =>
            r(require(`./docs/fr-FR${path}.md`)),
            'fr-FR');
    }
};

// 根据语言和路径返回相关的component md文件的路由引用
const loadDocs = function(lang, path) {
    return LOAD_DOCS_MAP[lang](path);
};

const registerRoute = (navConfig) => {
    let route = [];
    // 路由分三种情况
    // 1、 直接路由
    // 2、存在于children里面的路由
    // 3、存在于group, group里面的每个对象有一个name和list标示

    // 根据每个语言进行遍历
    Object.keys(navConfig).forEach((lang, index) => {
        // 拿到当前语言的路由地址
        let navs = navConfig[lang];
        // 添加路由，这个路由是component的一级路由。
        route.push({
            path: `/${ lang }/component`,
            redirect: `/${ lang }/component/installation`,
            component: load(lang, 'component'),
            children: []
        });
        // 对里面的路由进行遍历， 添加
        navs.forEach(nav => {
            if (nav.href) return; // 如果为href, 不注册路由，页面渲染的时候直接进行跳转超链接
            if (nav.groups) {
                // 对groups里面的nav进行路由注册
                nav.groups.forEach(group => {
                    group.list.forEach(nav => {
                        addRoute(nav, lang, index);
                    });
                });
            } else if (nav.children) {
                nav.children.forEach(nav => {
                    addRoute(nav, lang, index);
                });
            } else {
                addRoute(nav, lang, index);
            }
        });
    });
    /**
     * 
     * @param {*} page 路由信息/页码信息
     * @param {*} lang 语言
     * @param {*} index 根据语言区别的下标/ 目的是把相关的二级语言路由，根据下标放入相应顺序的语言children中
     */
    function addRoute(page, lang, index) {
        // 根据路由判断相关需要加载的组件
        const component = page.path === '/changelog' ?
            load(lang, 'changelog') : // vue文件
            loadDocs(lang, page.path); // md文件
        let child = {
            path: page.path.slice(1), // 去除开头的/
            meta: {
                title: page.title || page.name,
                description: page.description,
                lang
            },
            name: 'component-' + lang + (page.title || page.name), // 根据语言生成的title
            component: component.default || component
        };

        route[index].children.push(child);
    }

    return route;
};

// 注册组件模块的二级路由，传入路由路径，生成真实的路由
let route = registerRoute(navConfig);

// 根据语言生成路由 包含主页， 导航，主题，资源
const generateMiscRoutes = function(lang) {
    // 导航路由
    let guideRoute = {
        path: `/${ lang }/guide`, // 指南
        redirect: `/${ lang }/guide/design`,
        component: load(lang, 'guide'),
        children: [{
            path: 'design', // 设计原则
            name: 'guide-design' + lang,
            meta: { lang },
            component: load(lang, 'design')
        }, {
            path: 'nav', // 导航
            name: 'guide-nav' + lang,
            meta: { lang },
            component: load(lang, 'nav')
        }]
    };
    // 主题路由
    let themeRoute = {
        path: `/${ lang }/theme`,
        component: load(lang, 'theme-nav'),
        children: [{
                path: '/', // 主题管理
                name: 'theme' + lang,
                meta: { lang },
                component: load(lang, 'theme')
            },
            {
                path: 'preview', // 主题预览编辑
                name: 'theme-preview-' + lang,
                meta: { lang },
                component: load(lang, 'theme-preview')
            }
        ]
    };
    // 资源路由
    let resourceRoute = {
        path: `/${ lang }/resource`, // 资源
        meta: { lang },
        name: 'resource' + lang,
        component: load(lang, 'resource')
    };
    // 主页路由
    let indexRoute = {
        path: `/${ lang }`, // 首页
        meta: { lang },
        name: 'home' + lang,
        component: load(lang, 'index')
    };
    return [guideRoute, resourceRoute, themeRoute, indexRoute];
};

// 根据语言循环生成路由
langs.forEach(lang => {
    route = route.concat(generateMiscRoutes(lang.lang));
});

route.push({
    path: '/play',
    name: 'play',
    component: require('./play/index.vue')
});

// 根据语言，设置默认的重定向路径
let userLanguage = localStorage.getItem('ELEMENT_LANGUAGE') || window.navigator.language || 'en-US';
let defaultPath = '/en-US';
if (userLanguage.indexOf('zh-') !== -1) {
    defaultPath = '/zh-CN';
} else if (userLanguage.indexOf('es') !== -1) {
    defaultPath = '/es';
} else if (userLanguage.indexOf('fr') !== -1) {
    defaultPath = '/fr-FR';
}

route = route.concat([{
    path: '/',
    redirect: defaultPath
}, {
    path: '*',
    redirect: defaultPath
}]);

export default route;