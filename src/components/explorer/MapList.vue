<template>
  <div class="map-list-container">
    <MapListItem
      :readOnly="readOnly"
      v-for="map in maps"
      :key="map.id"
      :map="map"
      :onItemClick="onItemClick"
    />
  </div>
</template>

<script>
import MapListItem from './MapListItem'

export default {
  props: ['maps', 'readOnly', 'onItemClick'],
  components: {
    MapListItem,
  },
}
</script>

<style lang="scss" style="scoped">
.map-list-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
