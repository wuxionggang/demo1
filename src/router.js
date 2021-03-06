// 基本登录，和主页面试页面
import Vue from 'vue'
import Router from 'vue-router'
// 登录界面
import login from './components/login.vue'
// 主页面
import home from './components/home.vue'
// 登录成功界面
import welcome from './components/welcome.vue'

// 用户列表显示页面
import users from './components/user/users.vue'

// 权限列表页面
import rights from './components/power/rights.vue'

// 角色列表区域
import roles from './components/power/roles.vue'

// 商品分类区域
import cate from './components/goods/cate.vue'

// 分类参数区域
import params from './components/goods/params.vue'

// 商品列表区域
import list from './components/goods/list.vue'
// 商品添加界面
import add from './components/goods/add.vue'

// 订单管理区域
import order from './components/order/order.vue'

// 数据统计区域
import report from './components/report/report.vue'

Vue.use(Router)

const router = new Router({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: login },
        {
            path: '/home',
            component: home,
            redirect: '/welcome',
            children: [
                { path: '/welcome', component: welcome },
                { path: '/users', component: users },
                { path: '/rights', component: rights },
                { path: '/roles', component: roles },
                { path: '/categories', component: cate },
                { path: '/params', component: params },
                { path: '/goods', component: list },
                { path: '/goods/add', component: add },
                { path: '/orders', component: order },
                { path: '/reports', component: report },
            ]
        }

    ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 将要访问的路径
    // from 代表从哪个路径跳转而来
    // next 是一个函数，表示放行
    //     next()  放行    next('/login')  强制跳转

    if (to.path === '/login') return next()
        // 获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router