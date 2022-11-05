<template>
  <g :opacity="highlighted ? 1 : 0.2">
    <transition name="link-path">
      <path
          v-if="path.steps && path.steps.length > 0"
          :key="path.steps.length"
          :d="buildPath()"
          :style="style"
      />
    </transition>
    <path
        v-if="path.unvisitedSteps && path.unvisitedSteps.length > 0"
        :d="buildPathUnvisited()"
        :style="style"
        stroke-dasharray="6"
    />
  </g>
</template>

<script>
import {line as d3Line, curveNatural} from 'd3-shape'
import {mapState} from 'vuex'

export default {
  props: ['link', 'id'],
  data() {
    return {
      path: {steps: [], unvisitedSteps: []},
    }
  },
  mounted() {
    setTimeout(() => this.generatePath(), 100)
  },
  computed: {
    ...mapState('map', ['knots', 'links', 'focused']),
    lineGenerator() {
      return d3Line()
          .curve(curveNatural)
          .x(id => this.knots[id].x)
          .y(id => this.knots[id].y)
    },
    style() {
      return {
        stroke: this.highlighted ? '#797979' : '#111111',
        strokeWidth: 4,
      }
    },
    dashed() {
      return {
        strokeDasharray: this.path.hasUnvisited ? 10 : 0,
      }
    },
    highlighted() {
      const knot = this.$store.state.ui.selectedKnotId || this.$store.state.player.playedKnotId

      const onVisited = this.path.steps && this.path.steps.includes(knot)
      const onUnvisited =
          this.path.unvisitedSteps && this.path.unvisitedSteps.includes(knot)

      return knot && (onVisited || onUnvisited)
    },
  },
  methods: {
    buildPath() {
      return this.lineGenerator(this.path.steps)
    },
    buildPathUnvisited() {
      return this.lineGenerator(this.path.unvisitedSteps)
    },
    generatePath() {
      const target = this.knots[this.link.target]
      if (target.children.length !== 0) return {}

      const steps = []
      const unvisitedSteps = []

      let endUnvisited = false
      let id = this.link.target

      while (id) {
        const obj = this.knots[id]

        if (!endUnvisited && !obj.visited) {
          unvisitedSteps.push(id)
        } else {
          if (!endUnvisited) {
            unvisitedSteps.push(id)
            endUnvisited = true
          }
          steps.push(id)
        }

        id = obj.parent
      }

      this.path = {
        steps: steps.reverse(),
        unvisitedSteps: unvisitedSteps ? unvisitedSteps.reverse() : null,
      }
    }
  },
  watch: {
    knots: function () {
      this.generatePath()
    },
  }
}
</script>

<style scoped>
path {
  fill: none;
  stroke-width: 1; /*3;*/
}

.link-path-enter-active,
.link-path-leave-active {
  transition: all 0.5s;
}

.link-path-enter,
.link-path-leave-to {
  opacity: 0;
}
</style>
