<template>
  <div class="player-container">
    <!--    <div class="track-title-container noselect" @click="focus(knot)">-->
    <!--      <div class="track-title-text">-->
    <!--        {{ trackTitleStr }}-->
    <!--      </div>-->
    <!--    </div>-->
    <div v-if="!readOnly" class="action-button-group">
      <!--    TODO Only with Spotify Login -->
      <!--      <div class="button-wrapper like-button-group" @click="like">-->
      <!--        <img-->
      <!--          class="like-button-icon"-->
      <!--          v-if="isLiked"-->
      <!--          src="@/assets/svg/heart-icon-full.svg"-->
      <!--          alt="full-liked-icon"-->
      <!--        />-->
      <!--        <img-->
      <!--          class="like-button-icon"-->
      <!--          v-else-->
      <!--          src="@/assets/svg/heart-icon-empty.svg"-->
      <!--          alt="no-liked-icon"-->
      <!--        />-->
      <!--      </div>-->
<!--      <div-->
<!--        class="add-button-wrapper"-->
<!--        :class="{-->
<!--          'add-button-tutorial':-->
<!--            $route.path.includes('map') &&-->
<!--            tutorialSteps.includes('add_knot') &&-->
<!--            !tutorialSteps.includes('select_knot') &&-->
<!--            selectedKnotId,-->
<!--        }"-->
<!--        @click="add"-->
<!--      >-->
<!--        <img-->
<!--          class="add-button"-->
<!--          src="@/assets/svg/add-icon.svg"-->
<!--          alt="add-track-icon"-->
<!--        />-->
<!--      </div>-->
      <div class="button-wrapper" @click="dislike">
        <img
          class="dislike-button"
          src="@/assets/svg/dislike.svg"
          alt="remove-track-icon"
        />
      </div>
    </div>
    <div class="playback-group center">
      <div class="button-wrapper" @click="next">
        <img
          class="playback-button"
          src="@/assets/svg/next-icon.svg"
          alt="next icon"
        />
      </div>
      <audio
        autoplay
        :src="track && track.previewURL"
        ref="sampleSessionAudioControls"
        controls
      />
      <button @click="autoplayToggle" class="autoplay-toggle">
        autoplay: {{ autoplay ? 'ON' : 'OFF' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  components: {},
  data() {
    return {
      debounceLike: {
        callbackId: null,
        counter: 0,
      },
      blockDislike: false,
    }
  },
  async mounted() {
    try {
      // TODO Only for Spotify login
      // if (this.$store.state.player.sdk === null) {
      // const sdkIsLoaded = this.$store.dispatch('player/loadSdk')

      // await sdkIsLoaded
      // if (this.$store.state.player.likedPlaylist.id === null) {
      //   this.$store.dispatch('player/loadLikedPlaylist')
      // }
      // }

      window.addEventListener('keyup', e => {
        if (e.code === 'Space' && this.$route.hash === '')
          this.playPauseToggle()
        if (
          this.$route.hash === '' &&
          (e.code === 'Equal' || e.code === 'Enter')
        )
          this.add()
      })

      // For Sample Session mode
      this.$refs.sampleSessionAudioControls.addEventListener('pause', () => {
        this.$store.commit('player/STATUS_PAUSED')
      })
      this.$refs.sampleSessionAudioControls.addEventListener('play', () => {
        if (!this.track && this.selectedKnotId) {
          this.$store.dispatch('player/playKnot', {
            knot: this.selectedKnotId,
            track: this.knots[this.selectedKnotId].track,
          })
        }
        this.$store.commit('player/STATUS_PLAYING')
      })
      this.$refs.sampleSessionAudioControls.addEventListener(
        'ended',
        async () => {
          if (this.autoplay) {
            await new Promise(r => setTimeout(r, 1000))
            await this.$store.dispatch('player/bufferPlayNext')
          }
        },
      )
    } catch (error) {
      // TODO
    }
  },
  computed: {
    ...mapState('player', [
      'sdk',
      'track',
      'playedKnotId',
      'status',
      'likedPlaylist',
      'autoplay',
    ]),
    ...mapState('map', ['readOnly', 'knots']),
    ...mapState('ui', ['selectedKnotId', 'tutorialSteps']),
    previewMode() {
      // Until spotify login is reimplemented we're always in preview mode
      return true
      // return this.$store.state.player.previewMode
    },
    trackTitleStr() {
      if (!this.track) return ''

      const title = this.hardWrapText(this.track.title)
      const artist = this.hardWrapText(this.track.artist)
      return `${artist} - ${title}`
    },
    isSourceKnot() {
      if (!this.selectedKnotId) return false

      return this.$store.state.map.knots[this.selectedKnotId].level === 0
    },
    editMode() {
      return this.$store.state.map.editMode
    },
    isLiked() {
      if (!this.track) return false

      return this.likedPlaylist.tracks.includes(this.track.id)
    },
    hasTrack() {
      return Boolean(this.track)
    },
    audioEl() {
      return this.$refs.sampleSessionAudioControls
    },
  },
  methods: {
    ...mapActions('map', ['createKnot']),
    hardWrapText(text) {
      const maxLength = 40
      if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '..'
      } else return text
    },
    playPauseToggle() {
      if (!this.track) return

      if (this.status === 'PLAYING') {
        this.$store.dispatch('player/pausePlayback')
      } else {
        this.$store.dispatch('player/resumePlayback')
      }

      // TODO Only for Spotify login
      // if (this.status !== 'PLAYING') {
      //   this.sdk.resume()
      //   this.$store.commit('player/STATUS_PLAYING')
      // } else {
      //   this.sdk.pause()
      //   this.$store.commit('player/STATUS_PAUSED')
      // }
    },
    autoplayToggle() {
      this.$store.commit('player/SET_AUTOPLAY', !this.autoplay)
    },
    async like() {
      if (!this.track) return

      try {
        if (this.isLiked) {
          await this.$store.dispatch(
            'player/removeFromLikedPlaylist',
            this.track.id,
          )
          this.$store.dispatch('ui/pushFlashQueue', {
            content:
              "Track removed from the Spotify playlist 'Liked from Mimiko'",
            type: 'info',
            time: 4000,
          })
          return
        }

        if (!this.likedPlaylist.id) {
          await this.$store.dispatch('player/createLikedPlaylist')
        }
        await this.$store.dispatch('player/addToLikedPlaylist', this.track.id)
        this.$store.dispatch('ui/pushFlashQueue', {
          content: "Track added to the Spotify playlist 'Liked from Mimiko'",
          type: 'info',
          time: 4000,
        })
      } catch (error) {
        this.$store.dispatch('ui/pushFlashQueue', {
          content:
            'Log in with your Spotify account in order to save tracks to a custom playlist !',
          type: 'info',
          time: 4000,
        })
      }
    },
    // TODO Factorize
    switchHash(hash) {
      this.$router.replace({
        path: this.$route.path,
        query: this.$route.query,
        hash: hash,
      })
    },
    async add() {
      if (this.$route.path.includes('home')) {
        this.$router.push({ path: this.$route.path, hash: '#new' })
        return
      }

      if (
        this.$route.path.includes('map') &&
        this.tutorialSteps.includes('add_knot')
      ) {
        this.$store.dispatch('ui/setTutorialStepDone', 'add_knot')
      }

      this.debounceLike.counter += 1

      if (!this.debounceLike.callbackId) {
        this.debounceLike.callbackId = setTimeout(() => {
          this.debounceLike.counter = 0
          this.debounceLike.callbackId = null
        }, 200)
      }

      if (this.debounceLike.counter > 1) return

      // TODO Better pattern to prevent duplicate queries if response is slow and
      // the button is spammed : Promise.all on all async operations associated
      // with a click, lock further queries until promise.all is done
      // TODO Factorize with Overlay.vue
      if (!this.readOnly) {
        const newKnots = await this.createKnot({
          sourceId: this.selectedKnotId,
          visited: false,
        })
        newKnots.forEach(knot =>
          this.$store.commit('player/PLAYQUEUE_SHIFT', {
            track: knot.track,
            knot: knot.id,
          }),
        )
        if (this.status !== 'PLAYING') {
          await this.$store.dispatch('player/playKnot', {
            knot: newKnots[0].id,
            track: newKnots[0].track,
          })
        }
      }
    },
    async dislike() {
      if (!this.selectedKnotId || this.isSourceKnot) return

      this.blockDislike = true

      if (this.selectedKnotId === this.playedKnotId) {
        await this.$store.commit('player/RESET_PLAYER', null)
      }
      await this.$store.dispatch('map/deleteKnots', this.selectedKnotId)
      if (this.$route.hash === '#add') this.switchHash('')

      this.blockDislike = false
    },
    next() {
      this.$store.dispatch('player/bufferPlayNext')
    },
    focus(target) {
      this.$store.dispatch('map/focus', target)
    },
  },
  watch: {
    track: function() {
      clearTimeout(this.debounceLike.callbackId)
      this.debounceLike.counter = 0

      if (this.track && !this.track.previewURL) {
        this.$store.dispatch('ui/pushFlashQueue', {
          content: 'No audio preview available for this track on Spotify Free.',
          type: 'error',
          time: 3000,
        })
      }
    },
    status: function(newStatus) {
      if (newStatus === 'PLAYING') {
        this.audioEl.play()
      } else {
        this.audioEl.pause()
      }
    },
  },
  async destroyed() {
    try {
      await this.$store.commit('player/DISCONNECT_SDK')
    } catch (error) {
      // TODO
    }
  },
}
</script>

<style lang="scss" scoped>
.player-container {
  min-width: 0;
  flex: 1;

  display: flex;
  justify-content: flex-start;
}

.button-wrapper,
.add-button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.button-wrapper {
  flex: 1;
}

.like-button-icon,
.add-button,
.playback-button,
.dislike-button {
  opacity: 1;
}

.like-button:hover {
  transform: scale(1.3);
}

.like-button-icon {
  width: 40px;
  height: 40px;
}

.add-button {
  width: 50px;
  height: 50px;
}

.dislike-button {
  width: 35px;
  height: 35px;
}

.playback-button {
  width: 30px;
  height: 30px;
}

.action-button-group {
  flex: initial;
  height: 64px;

  display: flex;
  justify-content: space-around;
  padding: 0px 10px;

  background-color: $bg-secondary;
  border-radius: 5px;

  & > div {
    margin: 0px 10px 0px 10px;
  }
}

@media (min-width: 800px) {
  .action-button-group {
    min-width: 180px;
  }
}

.playback {
  flex: 1;
  min-width: 0;

  display: flex;
}

.playback-group {
  flex: 1;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  background-color: $bg-secondary;

  margin-left: 10px;
  border-radius: 5px;

  .button-wrapper {
    width: 64px;
  }
}

.track-title-container {
  flex: 1;
  width: 100%;
  height: 100%;

  display: flex;
  min-width: 64px;
  justify-content: flex-end;
  align-items: center;

  cursor: pointer;

  background-color: $bg-black;
}

.track-title-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 20px;
  padding: 20px;
  min-width: 0;
}

.track-title-container:hover {
  backdrop-filter: brightness(90%);
}

.filler {
  width: 30vw;
  min-width: 0px;
  flex: 1;
  background-color: $bg-primary;
}

.button-wrapper {
  transition: transform 100ms;
}

.button-wrapper:hover,
.add-button-wrapper:hover {
  transform: scale(1.2);
}

.add-button-wrapper:hover:active {
  transform: scale(1);
}

.add-button-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  bottom: 20%;
  background-color: $bg-secondary;
  border-radius: 50%;
  border: solid 3px $bg-primary;
  transition: transform 100ms;
}

.add-button-wrapper:before {
  content: ' ';
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid $bg-primary;
}

.playback-button {
  min-width: 64px;
}

.center {
  justify-content: center;
}

.autoplay-toggle {
  margin: 0px 30px 0px 10px;
}

.add-button-tutorial::before {
  content: 'Click here to add a new song to the map !';
  position: absolute;
  height: auto;
  bottom: calc(100% + 50px);
  border-radius: 5px;
  background-color: white;
  font-size: 25px;
  padding: 10px;
  width: max-content;
  pointer-events: none;
  //text-wrap: none;
}

.add-button-tutorial::after {
  content: '';
  position: absolute;
  top: -50px;
  width: 1px;
  height: 50px;
  border: solid black;
  border-width: 0 0 0 5px;
  transform: rotate(30deg);
  margin-left: 30px;
  pointer-events: none;
}
</style>
