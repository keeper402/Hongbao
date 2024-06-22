import Vue from "vue";
import App from "./App.vue";
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import router from './router'
import Cookies from 'js-cookie'

import Element from 'element-ui'
import './assets/styles/element-variables.scss'

// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon views plugins
Vue.use(IconsPlugin)

Vue.config.productionTip = false;

Vue.use(Element, {
    size: Cookies.get('size') || 'medium' // set element-ui default size
})

new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app");
