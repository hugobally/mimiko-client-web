<template>
  <div class="map-settings-container">
    <SearchInput
      class="rename-input"
      @submit="renameMap"
      :valueProp="meta.title"
      label="Rename the map"
      :submitWord="!busy ? 'Rename' : 'Working...'"
      :valid="validTitle || !renameRetry"
      :busy="busy"
      :success="renameSuccess"
    />
    <div class="discoverable-container noselect">
      <span class="discoverable-label">Map Discoverability</span>
      <div class="discoverable-select-group">
        <div
          class="discoverable-select"
          @click="setMapPublicStatus(true)"
          :class="{ selected: meta.isPublic }"
        >
          Public
        </div>
        <div
          class="discoverable-select"
          @click="setMapPublicStatus(false)"
          :class="{ selected: !meta.isPublic }"
        >
          Not Public
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { updateMap as gqlUpdateMap } from '@/api/graphql'
import { mapState } from 'vuex'
import SearchInput from '@/components/creator/SearchInput'

export default {
  components: {
    SearchInput,
  },
  data() {
    return {
      busy: false,
      title: null,
      validTitle: false,
      renameRetry: false,
      renameSuccess: false,
    }
  },
  computed: {
    ...mapState('map', ['id', 'meta']),
  },
  methods: {
    async renameMap(title) {
      if (this.busy) return

      try {
        this.busy = true
        this.renameRetry = false
        this.validTitle = true

        if (!validateMapTitle(title)) {
          this.validTitle = false
          this.renameSuccess = false
          return
        }

        this.validTitle = true

        const map = await gqlUpdateMap(this.id, {
          title: title,
        })

        if (!map) throw new Error()

        this.$store.commit('map/MAP_SET_META', map)
        this.$store.commit('maplist/USER_MAPS_UPDATE', {
          id: this.id,
          newVal: map,
        })
        this.renameSuccess = true
      } catch (error) {
        this.$store.dispatch('ui/pushFlashQueue', {
          content: 'Could not rename the map',
          type: 'error',
        })
        return
      } finally {
        this.renameRetry = true
        this.busy = false
      }
    },
    async setMapPublicStatus(isPublic) {
      const map = await gqlUpdateMap(this.id, { public: isPublic })
      if (!map) throw new Error()
      this.$store.commit('map/MAP_SET_META', map)
    },
  },
}

function validateMapTitle(title) {
  if (title.length < 1 || title.length > 80) return false
  if (!/^[\w\s]+$/.test(title)) return false

  return true
}
</script>

<style lang="scss" scoped>
.map-settings-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.editmode-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 50px;
  font-size: 20px;
}

.editmode-container > * {
  margin: 0px 20px;
}

.editmode-select-group {
  display: flex;
}

.editmode-select {
  padding: 5px;
  min-width: 50px;
  margin: 0px 3px;
  background-color: $bg-primary;
  cursor: pointer;
}

.selected {
  opacity: 1;
  background-color: $bg-secondary;
  color: white;
  border: solid 1px $bg-primary;
}

.discoverable-container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
}

.discoverable-select-group {
  display: flex;
  color: $text-primary;
}

.discoverable-select {
  padding: 5px;
  margin: 0px 3px;
  cursor: pointer;
}
</style>
