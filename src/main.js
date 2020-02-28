import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Icon from 'vue-awesome/components/Icon'

Vue.component('v-icon', Icon)
Vue.use(BootstrapVue)
Vue.use(VueSidebarMenu)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')