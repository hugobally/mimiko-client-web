<template>
  <defs>
    <clipPath id="circle-template">
      <circle :cx="0" :cy="0" :r="radius / 2" />
    </clipPath>
  </defs>
</template>

<script>
export default {
  props: ['radius'],
}
</script>
