import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [{
  path: '/bs',
  name: 'Home',
  component: Home,
},
{
  path: '/about',
  name: 'About',
  component: () => import('../views/About.vue'),
},
{
  path: '/',
  name: 'BaseSetting',
  component: () => import('../views/BaseSetting.vue'),
},
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
