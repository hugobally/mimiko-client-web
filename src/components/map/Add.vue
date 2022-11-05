<!-- TODO Duplicated from Create.vue => Factorize all similar components -->

<template>
  <div class="add-container disable-scrollbar">
    <SearchInput
      class="search-input"
      @submit="findTrack"
      placeholder="Add a new child track"
      :submitWord="!busy ? 'Find' : 'Working...'"
      :busy="busy"
      :valid="track || !findRetry"
    />
    <div class="track-preview-container" v-if="track">
      <img
        class="track-preview-cover"
        :src="track.imgURL"
        alt="track-track-cover"
      />
      <span class="track-preview-title">
        {{ formattedTitle }}
      </span>
    </div>
    <div v-if="!onDashedPath" class="visited-container noselect">
      <span class="visited-label">Link Style</span>
      <div class="visited-select-group">
        <div
          class="visited-select"
          @click="isVisited = true"
          :class="{ selected: isVisited }"
        >
          Solid
        </div>
        <div
          class="visited-select"
          @click="isVisited = false"
          :class="{ selected: !isVisited }"
        >
          Dashed
        </div>
      </div>
    </div>
    <button class="add-button button" @click="addKnot">Add</button>
  </div>
</template>

<script>
import SearchInput from '@/components/creator/SearchInput'
import { searchForTrack } from '@/api/spotify'
import { mapState } from 'vuex'

export default {
  components: {
    SearchInput,
  },
  data() {
    return {
      track: null,
      isVisited: true,

      busy: false,
      findRetry: false,
      findLastValue: null,
    }
  },
  computed: {
    ...mapState('player', ['playedKnotId']),
    ...mapState('map', ['knots']),
    formattedTitle() {
      if (!this.track) return ''

      return formatTitle(this.track)
    },
    onDashedPath() {
      if (!this.knot || this.knots[this.knot].visited) return false

      return true
    },
  },
  methods: {
    async findTrack(value) {
      if (this.busy || value.length < 1) return
      if (this.findRetry && value === this.findLastValue) return

      try {
        this.busy = true
        this.findRetry = false
        this.findLastValue = value
        this.track = null

        const tracks = await searchForTrack(value)

        if (tracks) this.track = tracks[0]
      } catch (error) {
        return
      } finally {
        this.findRetry = true
        this.busy = false
      }
    },
    async addKnot() {
      if (!this.knot) return

      try {
        await this.$store.dispatch('map/createKnots', {
          sourceId: this.knot,
          newTracks: [this.track],
          visited: this.isVisited,
        })
        this.$router.replace({
          path: this.$route.path,
          query: this.$route.query,
          hash: '',
        })
      } catch (error) {
        /**/
      }
    },
  },
}

function formatTitle(track) {
  const str = `${track.artist + ' - ' + track.title}`
  return str.substring(0, 79)
}
</script>

<style lang="scss" scoped>
.add-container {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  overflow-y: scroll;
}

.add-container > div {
  margin: 20px 0px;
}

.track-preview-container {
  height: 100px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.track-preview-cover {
  width: 100px;
  height: 100px;
  margin: 10px;
}

.track-preview-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.visited-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.visited-container > * {
  margin: 0px 20px;
}

.visited-select-group {
  display: flex;
}

.visited-select {
  padding: 5px;
  margin: 0px 3px;
  background-color: $bg-primary;
  cursor: pointer;
}

.selected {
  opacity: 1;
  background-color: $bg-primary;
  border: solid 1px $bg-primary;
}

.add-button {
  margin-top: 20px;
  width: 80px;
  height: 40px;
  padding: 5px;
  background-color: $bg-primary;
  color: $text-primary;
  border-radius: 3px;
  cursor: pointer;
}

.add-button:hover {
  background-color: $bg-primary;
}
</style>
