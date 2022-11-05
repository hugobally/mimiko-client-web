<template>
  <g
    :id="id"
    :transform="transformStr"
    @click="
      () => {
        selectThis()
        // playThis()
      }
    "
    @mouseover="onMouseOver()"
    @mouseleave="onMouseLeave()"
  >
    <circle :r="radius / 1.9" :fill="color"> </circle>
    <image
      class="album-art-circle"
      :x="-radius / 2"
      :y="-radius / 2"
      :width="radius"
      :height="radius"
      :xlink:href="knot.track.imgURL"
      :clip-path="`url(#circle-template)`"
      stroke="#ffffff"
    >
    </image>
  </g>
</template>

<script>
export default {
  props: ['id', 'knot'],
  data() {
    return {
      radius: 40,
      track: {},
      hovered: false,
      hoveredExit: false,
    }
  },
  computed: {
    color() {
      return this.$store.state.map.meta.color
    },
    transformStr() {
      const { x, y } = this.knot
      return `translate(${x} ${y})`
    },
  },
  methods: {
    selectThis() {
      this.$store.dispatch('ui/selectKnot', this.id)
    },
    onMouseOver(e) {
      this.$store.dispatch('map/knotHoverEvent', this.id)
    },
    onMouseLeave() {
      this.$store.dispatch('map/knotHoverEvent', null)
    },
  },
}
</script>

<style lang="scss" scoped>
g {
  cursor: pointer;
}
</style>
