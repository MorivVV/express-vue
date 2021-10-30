import a from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import postgree from './modules/postgree';

const axios = a.create({
  baseURL: 'http://192.168.1.36:3000/',
});
Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  actions: {
    fetchData({ commit }, param) {
      const { data } = param;
      let url = '/bar/';
      if ('url' in param) {
        url = param.url;
      }
      axios.post(url, data)
        .then((res) => { commit('updateState', { state: param.stateName, data: res.data }); });
    },
  },
  mutations: {
    updateState(state, payload) {
      const module = payload.state.split('/');
      switch (module.length) {
        case 1:
          state[module[0]] = payload.data;
          break;
        case 2:
          state[module[0]][module[1]] = payload.data;
          break;
        case 3:
          state[module[0]][module[1]][module[2]] = payload.data;
          break;
        default:
          break;
      }
    },
  },
  modules: {
    postgree,
  },
});
