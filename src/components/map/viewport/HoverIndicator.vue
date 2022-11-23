<!--
 radius divider value if we want space between the knot and the hover circle : 1.5
-->

<template>
  <g class="hover-container" :transform="transformStr">
    <circle
      class="animated-hover-circle"
      :stroke="$store.state.map.meta.color"
      stroke-width="8"
      fill-opacity="0"
      :r="radius / 2.2"
      @mouseover="onMouseOver()"
      @mouseleave="onMouseLeave()"
    />
    <circle
      class="animated-hover-circle"
      :fill="$store.state.map.meta.color"
      fill-opacity="0"
      :r="radius / 0.5"
      @mouseover="onMouseOver()"
      @mouseleave="onMouseLeave()"
    />
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
    ...mapState('map', ['knots', 'hovered', 'focused']),
    knotToAttachTo() {
      if (this.hovered) return this.knots[this.hovered]

      return null
    },
    transformStr() {
      const { x, y } = this.knotToAttachTo
      return `translate(${x} ${y})`
    },
  },
  methods: {
    onMouseOver() {
      this.$store.dispatch('map/knotHoverEvent', this.hovered)
    },
    onMouseLeave() {
      this.$store.dispatch('map/knotHoverEvent', null)
    },
  },
}
</script>

<style lang="scss" scoped>
@keyframes circle-scale-animation {
  0% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}

.animated-hover-circle {
  animation-name: circle-scale-animation;
  animation-duration: 200ms;
}
</style>
