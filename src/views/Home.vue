<template>
  <div class="home-centerer">
    <div class="home-container">
      <div v-if="userMaps && userMaps.length === 0">
        <Creator />
      </div>
      <div v-if="userMaps && userMaps.length !== 0">
        <h1 class="header noselect">
          Maps
        </h1>
        <RouterLink to="#new" class="button">create a new map</RouterLink>
        <MapList class="map-list" :readOnly="false" :maps="userMaps" />
      </div>
    </div>
  </div>
</template>

<script>
import MapList from '@/components/explorer/MapList'
import Creator from '@/components/Creator'

export default {
  components: {
    Creator,
    MapList,
  },
  data() {
    return {
      lastVisited: null,
    }
  },
  computed: {
    userMaps() {
      return this.$store.getters['maplist/userMaps']
    },
    currentPath() {
      return this.$route.path
    },
  },
  async mounted() {
    await this.$store.dispatch('maplist/fetchAllUserMaps')
    this.lastVisited = localStorage.getItem('last_visited')
    await this.$store.dispatch('map/resetMap')
  },
}
</script>

<style lang="scss" scoped>
.home-centerer {
  position: fixed;
  overflow-y: scroll;

  display: flex;
  justify-content: center;

  background-color: $bg-primary;
}

.home-container {
  width: 800px;
  background-color: white;
  display: flex;
  justify-content: center;
}

.home-container > * {
  min-width: 80%;
}

.text-logo {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-link {
  width: 100%;
  font-size: 30px;
  color: $bg-primary;
  padding: 10px;
  margin-left: 5px;
}

.quick-link:hover {
  background-color: $bg-primary;
}

.quick-links-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.quick-links-container > .quick-link {
  padding: 5px 0px;
  text-align: left;
}

.header {
  padding: 20px 10px;
  width: 100%;
  font-size: 50px;
  text-align: center;
}

.user-maps-header {
  display: flex;
  justify-content: flex-start;
  border-bottom: solid $bg-primary;
  align-items: center;
}

.create-map-icon {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

.empty-text-centerer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text-container {
  display: flex;
  text-align: left;
}

.empty-text {
  margin-left: 30px;
}

.empty-text > * {
  margin-top: 20px;
}
</style>
