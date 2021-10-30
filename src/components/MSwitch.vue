<template>
  <div class="switch">
    <label>
      {{label}}
      <input type="checkbox" @change="$emit('input', $event.target.checked)">
      <span class="lever"></span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
  },
};
</script>
