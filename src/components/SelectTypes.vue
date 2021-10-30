<template>
  <div class="input-field">
    <select @change="$emit('input', $event.target.value)">
      <option v-for="p in list"
      :key="p.id"
      :value="p.id">{{p.type_name}} ({{p.description}})</option>
    </select>
    <label>Тип данных</label>
  </div>
</template>

<script>
export default {
  props: {
    list: Array,
  },
  mounted() {
    this.$M.AutoInit();
  },
};

</script>

<style>
.dropdown-content li > span {
    font-size: 14px;
    color: #3c02a8;
    line-height: 1rem;
    padding: 4px 4px;
}
.dropdown-content li {
    min-height: 25px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.17);
}
</style>
