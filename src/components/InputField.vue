<template>
  <div class="input-field">
    <input type="text" @input="$emit('input', $event.target.value)">
    <label>{{label}}</label>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
  },
};
</script>
