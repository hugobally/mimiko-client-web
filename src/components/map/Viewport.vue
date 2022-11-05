<template>
  <div class="viewport-container">
    <Overlay :key="hovered" :viewport="$refs.viewport" />
    <svg
      ref="viewport"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      :opacity="loaded ? 1 : 0"
    >
      <ZoomHandler id="zoomgroup" :viewportRef="$refs.viewport" :graphRef="$refs.graph">
        <PlayIndicator v-if="currentPlayerKnot" :key="`play-indicator-${currentPlayerKnot}`" />
        <g ref="graph">
          <transition-group name="link-group" tag="g">
            <Link v-for="(link, key) in links" :key="key" :id="key" :link="link" />
          </transition-group>
          <HoverIndicator :key="hovered" v-if="hovered" />
          <SelectIndicator v-if="currentSelectedKnot" :key="`select-indicator-${currentSelectedKnot}`" />
          <transition-group name="knot-group" tag="g">
            <Knot v-for="(knot, key) in knots" :key="key" :id="key" :knot="knot" />
          </transition-group>
        </g>
      </ZoomHandler>

      <Filters radius="40"></Filters>
    </svg>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ZoomHandler from '@/components/map/viewport/ZoomHandler'
import Filters from '@/components/map/viewport/Filters'
import PlayIndicator from '@/components/map/viewport/PlayIndicator'
import SelectIndicator from '@/components/map/viewport/SelectIndicator'
import HoverIndicator from '@/components/map/viewport/HoverIndicator'
import Overlay from '@/components/map/viewport/Overlay'
import Knot from '@/components/map/graph/Knot'
import Link from '@/components/map/graph/Link'

export default {
  props: ['loaded'],
  components: {
    Overlay,
    ZoomHandler,
    Filters,
    PlayIndicator,
    SelectIndicator,
    HoverIndicator,
    Knot,
    Link,
  },
  computed: {
    ...mapState('map', ['knots', 'links', 'hovered']),
    currentPlayerKnot() {
      return this.$store.state.player.playedKnotId
    },
    currentSelectedKnot() {
      return this.$store.state.ui.selectedKnotId
    },
    mapId() {
      return this.$store.state.map.id
    },
    // displayedLinks() {
    //   const rootKnot = this.knots.find(knot => knot.level === 0)
    //   const startingKnots = [...rootKnot.children]
    //
    //   const visitedPaths = []
    //   const unvisitedPaths = []
    //
    //   for (const currentKnot in startingKnots) {
    //     let path = [rootKnot.id]
    //
    //     let id = currentKnot.id
    //     while (id) {
    //       path.push(id)
    //       if (currentKnot.visited && currentKnot)
    //     }
    //   }
    // }
  },
}
</script>

<style lang="scss" scoped>
.viewport-container {
  overflow: hidden;
  flex: 1;

  background-color: $bg-primary;
}

@-moz-document url-prefix() {
  .link-group-enter-active,
  .link-group-leave-active,
  .knot-group-enter-active,
  .knot-group-leave-active {
    transition: all 0.25s;
  }

  .link-group-enter,
  .link-group-leave-to,
  .knot-group-enter,
  .knot-group-leave-to {
    opacity: 0;
  }
}
</style>
