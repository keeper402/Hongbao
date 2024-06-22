import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


// 公共路由
export const constantRoutes = [
    {
        path: '/',
        redirect: "/home"
    },
    {
        path: '/home',
        component: () => import('@/views/redPacket/CreateRedPacket'),
        hidden: true
    },
    {
        path: '/receive',
        component: () => import('@/views/redPacket/ReceiveRedPacket'),
        hidden: true
    },
    {
        path: '/list',
        component: () => import('@/views/redPacket/RedPacketList'),
        hidden: true
    },
    {
        path: '/404',
        title: 'Page not found',
        component: () => import('@/views/error/404'),
        hidden: true
    },
    // 所有未定义路由，全部重定向到404页
    {
        path: '*',
        redirect: '/404'
    }
]

// 防止连续点击多次路由报错
let routerPush = Router.prototype.push;
let routerReplace = Router.prototype.replace;
// push
Router.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(err => err)
}
// replace
Router.prototype.replace = function push(location) {
    return routerReplace.call(this, location).catch(err => err)
}

export default new Router({
    mode: 'history', // 去掉url中的#
    scrollBehavior: () => ({y: 0}),
    routes: constantRoutes
})
