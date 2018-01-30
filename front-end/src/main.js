import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import VueInstant from 'vue-instant';
import VueResource from 'vue-resource';

import ThreeDModels from './vues/ThreeDModels.vue';
import Single3DModelDetail from './vues/Single3DModelDetail.vue';
import Single3DModel from './vues/Single3DModel.vue';
import Version from './vues/Version.vue';

Vue.use(VueRouter);
Vue.use(VueInstant);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

const routes = [
  {
    path: "/3dmodels",
    component: ThreeDModels
  },
  {
    path: "/3dmodels/detail/:id",
    component: Single3DModelDetail
  },
  {
    path: "/3dmodels/detail/:id/model",
    component: Single3DModel
  },
  {
    path: "/3dmodels/detail/:name/version",
    component: Version
  }

];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
});
