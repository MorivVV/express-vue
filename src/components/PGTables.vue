<template>
  <table>
    <thead>
      <tr>
        <td v-for="(h, i) in tables[0]" :key="i">{{i}}</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="tr in tables" :key="'tr' +tr.id">
        <td v-for="t in tr" :key="'td' +t"> {{t}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState('postgree', ['tables']),
  },
  methods: {
    ...mapActions(['fetchData']),
  },
  mounted() {
    this.fetchData({
      url: '/tables/',
      stateName: 'postgree/tables',
    });
  },
};
</script>

<style scoped>
td {
  border-left: 1px solid rgba(0, 0, 0, 0.219);
}
</style>
