<template>
  <g
    class="select-indicator-container"
    :transform="transformStr"
    :opacity="0.2"
  >
    <circle
      class="animated-circle animated-paused"
      fill="none"
      :stroke="$store.state.map.meta.color"
      stroke-width="0.5"
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
    ...mapState('map', ['knots']),
    ...mapState('ui', ['selectedKnotId']),
    knot() {
      if (!this.selectedKnotId) return null

      return this.knots[this.selectedKnotId]
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
.select-indicator-container {
  pointer-events: none;
}

@keyframes circle-scale-animation-paused {
  0% {
    transform: scale(2);
  }

  2% {
    transform: scale(2.1);
  }

  4% {
    transform: scale(2);
  }

  8% {
    transform: scale(1.9);
  }

  10% {
    transform: scale(2);
  }

  100% {
    transform: scale(2);
  }
}

.animated-circle {
  opacity: 1;
  transition: opacity 1000ms;
  transform: scale(2);
}

.animated-paused {
  opacity: 1;
  animation-name: circle-scale-animation-paused;
  animation-iteration-count: 1;
  animation-timing-function: ease-out;
  animation-duration: 5s;
}
</style>
