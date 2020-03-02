import Vue from 'vue'
import App from './App.vue'
import './assets/cards.css'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Icon from 'vue-awesome/components/Icon'
import vuescroll from 'vuescroll/dist/vuescroll-native'
import 'vuescroll/dist/vuescroll.css'

import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.component('v-icon', Icon)
Vue.use(BootstrapVue)
Vue.use(VueAxios, axios)
Vue.use(vuescroll)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
