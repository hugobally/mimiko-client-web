<template>
      <div class="search-input-container">
        <SearchInput
            class="search-input"
            @submit="findTrack"
            placeholder="Type the name of a song or artist"
            :valueProp="findLastValue || null"
            :submitWord="!busy ? 'Start' : 'Working...'"
            :label="label"
            :busy="busy"
            :valid="flagship || !findRetry"
            :autocompleteFunction="autocomplete"
        />
      </div>
      <!-- <GenreGrid class="genre-grid-layout" /> -->
</template>

<script>
import SearchInput from '@/components/creator/SearchInput'
// import GenreGrid from '@/components/creator/GenreGrid'
import { searchForTrack, autocomplete } from '@/api/spotify'
import { createMap as gqlCreateMap } from '@/api/graphql'

export default {
  components: {
    SearchInput,
    // GenreGrid,
  },
  props: ['label'],
  data() {
    return {
      editMode: false,
      isPublic: false,

      busy: false,

      flagship: null,
      findRetry: false,
      findLastValue: null,

      title: null,
      validTitle: false,
      createRetry: false,

      autocomplete: autocomplete,
    }
  },
  computed: {
    formattedTitle() {
      if (!this.flagship) return ''

      return formatTitle(this.flagship)
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

        const tracks = await searchForTrack(value)

        if (tracks) this.flagship = tracks[0]
        this.title = replaceSpecial(`${this.flagship.artist} - ${this.flagship.title}`)
        await this.createMap(this.title)
      } catch (error) {
        // TODO
      } finally {
        this.findRetry = true
        this.busy = false
      }
    },
    async createMap(title) {
      try {
        const map = await gqlCreateMap({
          title: title,
          public: this.isPublic,
          flagshipId: this.flagship.id,
        })
        map.flagship = this.flagship
        this.$store.commit('maplist/USER_MAPS_PUSH', map)
        this.$router.push({
          path: `/map/${map.id}`,
        })
      } catch (error) {
        console.log(error)
        this.$store.dispatch('ui/pushFlashQueue', {
          content: 'Error when trying to create a new map, please retry.',
          type: 'error',
        })
      }
    },
    resetFlagship() {
      this.flagship = null
      this.findRetry = false
      this.createRetry = false
    },
  },
}

function formatTitle(track) {
  const str = `${track.artist + ' - ' + track.title}`
  return str.substring(0, 79)
}

function validateMapTitle(title) {
  if (title.length < 1 || title.length > 80) return false
  if (!/^[\w\s]+$/.test(title)) return false

  return true
}

function replaceSpecial(str) {
  return str.replace(/^\W-+/g, '').substring(0, 79)
}
</script>

<style lang="scss" scoped>

</style>
