<template>
  <g class="play-indicator-container" :transform="transformStr">
    <circle
      class="animated-circle animated-circle-1"
      :class="{ hidden: paused, 'animated-playing': playing }"
      fill="none"
      :stroke="$store.state.ui.colors.playIndicator"
      stroke-width="2"
      :r="radius / 1.95"
    >
    </circle>
    <circle
      class="animated-circle animated-circle-2"
      :class="{ hidden: paused, 'animated-playing': playing }"
      fill="none"
      :stroke="$store.state.ui.colors.playIndicator"
      stroke-width="2"
      :r="radius / 1.95"
    >
    </circle>
    <circle
      class="animated-circle animated-circle-3"
      :class="{ hidden: paused, 'animated-playing': playing }"
      fill="none"
      :stroke="$store.state.ui.colors.playIndicator"
      stroke-width="2"
      :r="radius / 1.95"
    >
    </circle>
  </g>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      radius: 40,
    }
  },
  computed: {
    ...mapState('map', ['knots', 'hovered']),
    ...mapState('player', ['status']),
    playing() {
      return this.status === 'PLAYING'
    },
    paused() {
      return this.status === 'PAUSED'
    },
    knot() {
      const playerKnot = this.$store.state.player.playedKnotId
      if (!playerKnot) return null

      return this.knots[playerKnot]
    },
    transformStr() {
      if (!this.knot) return
      const { x, y } = this.knot
      return `translate(${x} ${y})`
    },
  },
}
</script>

<style lang="scss" scoped>
.play-indicator-container {
  pointer-events: none;
}

@keyframes circle-scale-animation-playing {
  0% {
    transform: scale(1);
  }

  75% {
    transform: scale(3);
  }

  100% {
    transform: scale(3);
  }
}

@keyframes circle-opacity-animation {
  0% {
    opacity: 1;
  }

  75% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
}

.animated-circle {
  animation-timing-function: ease-in-out;
}

.animated-circle-2.animated-playing {
  animation-delay: 500ms;
}
.animated-circle-3.animated-playing {
  animation-delay: 1000ms;
}

.animated-playing {
  animation-name: circle-scale-animation-playing, circle-opacity-animation;
  animation-duration: 4s;
  animation-iteration-count: infinite;
}
</style>
