<template>
  <div class="explorer-container disable-scrollbar">
    <SearchTrack class="search-track-container" />
    <div>- or start from a Starter Map -</div>
    <MapList
      :readOnly="true"
      :maps="filteredMaps || publicMaps"
      :onItemClick="createMapFromTemplate"
    />
  </div>
</template>

<script>
import MapList from '@/components/explorer/MapList'
import SearchTrack from '@/components/SearchTrack'
import { createMap as gqlCreateMap } from '@/api/graphql'

export default {
  components: {
    MapList,
    SearchTrack,
  },
  data() {
    return {
      searchString: '',
      filteredMaps: null,
      debounce: null,
    }
  },
  computed: {
    mapList() {
      return this.filteredMaps || this.publicMaps
    },
    publicMaps() {
      return this.$store.getters['maplist/publicMaps']
    },
    noSearchResult() {
      return (
        this.searchString !== '' &&
        this.filteredMaps &&
        this.filteredMaps.length === 0
      )
    },
  },
  mounted() {
    this.$store.dispatch('maplist/fetchAllPublicMaps')
  },
  methods: {
    filterMaps() {
      if (this.searchString === '') this.filteredMaps = null

      this.filteredMaps = this.publicMaps.filter(map => {
        return mapMetadataIncludes(this.searchString.toLowerCase(), [
          map.title,
          map.author && map.author.username,
          map.flagship && map.flagship.artist,
          map.flagship && map.flagship.title,
        ])
      })
    },
    // TODO Factorize with SearchTrack
    async createMapFromTemplate(mapTemplate) {
      try {
        const map = await gqlCreateMap({
          title: mapTemplate.title,
          flagshipID: mapTemplate.flagship.id,
          public: false,
        })
        map.flagship = mapTemplate.flagship
        this.$store.commit('maplist/USER_MAPS_PUSH', map)
        this.$router.push({
          path: `/map/${map.id}?template=${mapTemplate.id}`,
        })
      } catch (error) {
        console.log(error)
        this.$store.dispatch('ui/pushFlashQueue', {
          content: 'Error when trying to create a new map, please retry.',
          type: 'error',
        })
      }
    },
  },
  watch: {
    searchString: function() {
      if (this.debounce) {
        clearTimeout(this.debounce)
      }

      this.debounce = setTimeout(this.filterMaps, 500)
    },
  },
}

function mapMetadataIncludes(str, fields) {
  for (const field of fields) {
    if (field && field.toLowerCase().includes(str)) return true
  }
  return false
}
</script>

<style lang="scss" scoped>
.explorer-container {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

.explorer-searchbar {
  height: 32px;
  width: 80%;
  border: 0px;
  padding: 5px;
  font-size: 20px;
  //font-family: 'IBM Plex Sans', sans-serif;
  background-color: $bg-primary;
  border: 1px solid black;
  margin: 0px 10px 0px 10px;
  color: $text-primary;
}

.explorer-searchbar::placeholder {
  font-size: 30px;
}

@media (min-width: 601px) {
  .explorer-searchbar {
    height: 64px;
  }
}

.no-result {
  color: $bg-secondary;
  margin: 20px 0px;
}
</style>
