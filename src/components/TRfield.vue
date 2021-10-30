<template>
  <tr>
    <td>{{field.fname}}</td>
    <td>{{typeF}}</td>
    <td>{{field.scale}}</td>
    <td>{{field.fnull}}</td>
    <td>{{field.default}}</td>
  </tr>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    field: Object,
  },
  computed: {
    ...mapState('postgree', ['pg_types_fields']),
    typeF() {
      return this.pg_types_fields.filter((e) => e.id === +this.field.ftype).map((r) => `${r.type_name} (${r.description})`)[0];
    },
  },
};
</script>
