<template>
  <div
    class="overlay-group"
    @mouseover="onMouseOver()"
    @mouseleave="onMouseLeave()"
  >
    <div :style="{ ...topEdge }" v-if="tutorialKnot">
      <div class="top-edge-container">
<!--        <div :style="{ ...reactiveSize }" class="top-edge-backdrop" />-->
        <!--        <input v-model="inputTrackId" />-->
        <!--        <button @click="updateTrackId">update</button>-->
        <span class="select-knot-tutorial tutorial-bubble">
          1. Click on a song to select it !
        </span>
        <div class="tutorial-arrow"></div>
      </div>
    </div>
    <div
      :style="{ ...bottomEdge }"
      class="bottom-edge"
      :class="{ hidden: !hoveredKnot }"
    >
      <div class="bottom-edge-container">
<!--        <div :style="{ ...reactiveSize }" class="bottom-edge-backdrop" />-->
        <a
          class="track-title-and-link shadow entrance-animation"
          :href="moreInfoLink"
          target="_blank"
          :style="{ ...reactiveFontSize }"
        >
          {{ (knot && knot.track.artist) + ' - ' + (knot && knot.track.title) }}
          <img src="@/assets/svg/more-info.svg" alt="more info icon" />
        </a>
      </div>
    </div>
    <div :style="{ ...leftEdge }" :class="{ hidden: !hoveredKnot }">
      <div class="left-edge-container">
        <button class="play-this-button" @click="playOrPauseSelected">
          <img
            :style="{ ...reactiveSize }"
            v-if="status === 'PLAYING' && playedKnotId === hovered"
            src="@/assets/svg/pause-icon.svg"
            alt="play icon"
            class="play-button-img shadow entrance-animation"
          />
          <img
            :style="{ ...reactiveSize }"
            v-else
            src="@/assets/svg/play-icon.svg"
            alt="pause icon"
            class="play-button-img shadow entrance-animation"
          />
        </button>
<!--        <div :style="{ ...reactiveSize }" class="left-edge-backdrop" />-->
      </div>
    </div>
    <div :style="{ ...rightEdge }" :class="{ hidden: !hoveredKnot }">
      <div class="right-edge-container">
<!--        <div :style="{ ...reactiveSize }" class="right-edge-backdrop" />-->
        <button class="add-button" @click="add">
          <img
            :style="{ ...reactiveSize }"
            src="@/assets/svg/add-icon-alternate.svg"
            alt="add icon"
            class="play-button-img shadow entrance-animation"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getTracks } from '@/api/spotify'
import { updateKnot } from '@/api/graphql'

export default {
  data() {
    return {
      topEdge: null,
      bottomEdge: null,
      leftEdge: null,
      rightEdge: null,
      inputTrackId: '',
    }
  },
  props: ['viewport'],
  computed: {
    ...mapState('map', [
      'knots',
      'hovered',
      'selected',
      'readOnly',
      'rootKnotId',
    ]),
    ...mapState('ui', [
      'zoomLevel',
      'transform',
      'selectedKnotId',
      'tutorialSteps',
    ]),
    ...mapState('player', ['status', 'playedKnotId']),
    hoveredKnot() {
      if (!this.hovered) return null

      return this.knots[this.hovered]
    },
    tutorialKnot() {
      if (!this.tutorialSteps.includes('select_knot')) return null

      return this.knots[this.rootKnotId]
    },
    knot() {
      return this.hoveredKnot || this.tutorialKnot
    },
    reactiveFontSize() {
      let fontSize = this.$store.state.ui.zoomLevel * 20
      fontSize = Math.min(Math.max(fontSize, 20), 25)
      return {
        fontSize: `${fontSize}px`,
      }
    },
    reactiveSize() {
      const sideLength = Math.max(10 * this.$store.state.ui.zoomLevel, 70)
      return {
        width: `${sideLength}px`,
        height: `${sideLength}px`,
      }
    },
    moreInfoLink() {
      if (!this.knot) return ''

      return `https://open.spotify.com/track/${this.knot.track.id}`
    },
  },
  mounted() {
    this.setAnchorPositions()
  },
  watch: {
    // TODO DRY
    knot: function() {
      this.setAnchorPositions()
    },
    transform: function() {
      this.setAnchorPositions()
    },
    zoomLevel: function() {
      setTimeout(() => this.setAnchorPositions(), 50)
    },
  },
  methods: {
    onMouseOver() {
      this.$store.dispatch('map/knotHoverEvent', this.hovered)
    },
    onMouseLeave() {
      this.$store.dispatch('map/knotHoverEvent', null)
    },
    setAnchorPositions() {
      if (!this.knot) return

      const zoomGroup = document.getElementById('zoomgroup')
      const matrix = zoomGroup.getCTM()

      const transform = (x, y) => {
        const p = new DOMPoint(x, y).matrixTransform(matrix)
        return {
          transform: `translate(${p.x}px, ${p.y}px)`,
          position: 'fixed',
        }
      }

      const circleRadius = 20

      this.topEdge = transform(this.knot.x, this.knot.y - circleRadius)
      this.bottomEdge = transform(this.knot.x, this.knot.y + circleRadius * 2)

      this.leftEdge = transform(this.knot.x - circleRadius * 2, this.knot.y)
      this.rightEdge = transform(this.knot.x + circleRadius * 2, this.knot.y)
    },
    playOrPauseSelected() {
      if (this.playedKnotId === this.hovered) {
        this.$store.dispatch(
          this.status === 'PLAYING'
            ? 'player/pausePlayback'
            : this.status === 'PAUSED'
            ? 'player/resumePlayback'
            : '',
        )
        return
      }

      this.$store.dispatch('player/playKnot', {
        knot: this.hovered,
        track: this.hoveredKnot.track,
      })
      this.$store.dispatch('ui/selectKnot', this.hovered)
    },
    // TODO Factorize w/ Player.vue
    async add() {
      if (!this.readOnly) {
        const newKnot = await this.$store.dispatch('map/createKnot', {
          sourceId: this.hovered,
          visited: false,
        })
        if (this.status !== 'PLAYING') {
          await this.$store.dispatch('player/playKnot', {
            knot: newKnot.id,
            track: newKnot.track,
          })
        } else {
          this.$store.commit('player/PLAYQUEUE_SHIFT', {
            track: newKnot.track,
            knot: newKnot.id,
          })
        }
      }
    },
    async updateTrackId() {
      const track = (await getTracks(this.inputTrackId))[0]
      await updateKnot(this.hovered, { trackId: track.id })
      this.$store.commit('map/KNOT_SET_TRACK', { knots: [this.hovered], track })
    },
  },
}
</script>

<style lang="scss" scoped>
.overlay-group {
  position: fixed;
}

.play-this-button,
.add-button {
  transform: translate(0, -50%);
  background-color: rgba(0, 0 ,0, 0);
  transition: all 100ms ease-in-out;
}

.add-button:hover,
.play-this-button:hover {
  transform: translate(0, -50%) scale(1.2);
}

.more-info-link {
  display: block;
}

.right-edge-container,
.left-edge-container,
.top-edge-container,
.bottom-edge-container {
  position: absolute;
  display: flex;
}
.left-edge-container {
  flex-direction: row;
  right: 0px;
}
.right-edge-container {
  flex-direction: row;
  left: 0px;
}
.top-edge-container {
  flex-direction: column;
  bottom: 0px;
}
.bottom-edge-container {
  display: flex;
  flex-direction: column;
  transform: translateX(-50%);
  top: 0px;
}

.track-title-and-link {
  border: none;
  cursor: pointer;
  text-decoration: none;

  width: max-content;

  background-color: white;
  color: $text-primary;
  padding: 5px;
  border-radius: 5px;

  text-wrap: none;
}

.left-edge-backdrop,
.right-edge-backdrop {
  transform: scaleY(2);
}
.top-edge-backdrop,
.bottom-edge-backdrop {
  transform: scaleX(2);
}

.tutorial-bubble {
  border-radius: 5px;
  background-color: white;
  font-size: 25px;
  padding: 10px;
  width: max-content;
  text-wrap: none;
}

.tutorial-arrow {
  height: 50px;
  width: 0px;
  border: solid black;
  border-width: 0 0 0 5px;
  transform: rotate(30deg);
  margin-left: 30px;
}

.play-button-img {
  border-radius: 9999px;
  background-color: white;
}

.entrance-animation {
  animation: entrance-animation 0.2s cubic-bezier(0.230, 1.000, 0.320, 1.000) both;
}

/* ----------------------------------------------
 * Generated by Animista on 2022-11-4 17:9:46
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info.
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation slide-in-blurred-right
 * ----------------------------------------
 */
@keyframes entrance-animation {
  0% {
    transform: translateX(200px) scaleX(2.5) scaleY(0.2);
    transform-origin: 0% 50%;
    filter: blur(40px);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scaleY(1) scaleX(1);
    transform-origin: 50% 50%;
    filter: blur(0);
    opacity: 1;
  }
}

</style>
