import * as d3 from 'd3-force'

function initialState() {
  return {
    simulation: null,
    simOver: true,
    knots: [],
    links: [],
  }
}

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    ADD_KNOTS(state, knots) {
      for (const k of knots) {
        const newKnot = {
          id: k.id,
          x: k.x || 0,
          y: k.y || 0,
          level: k.level,
        }

        if (k.level === 0) {
          newKnot.fx = 0
          newKnot.fy = 0
        }

        state.knots.push(newKnot)
      }
    },

    KNOTS_DELETE(state, ids) {
      if (state.simulation) state.simulation.stop()

      state.knots = state.knots.filter(knot => !ids.includes(knot.id))
    },

    SET_SIM(state, sim) {
      state.simulation = sim
    },
    SET_SIM_OVER(state, overBool) {
      state.simOver = overBool
    },
    RESTART_SIM(state) {
      state.simulation.stop()

      state.simOver = false

      state.simulation.nodes(state.knots)
      state.simulation.alpha(1).restart()
    },

    RESET_FORCE(state) {
      if (state.simulation) {
        state.simulation.nodes([])
        state.simulation.stop()
      }
      state = Object.assign(state, initialState())
    },
  },
  actions: {
    initForceLayout({ commit, state }) {
      const handleTick = async () => {
        commit('map/KNOTS_SET_POS', state.knots, { root: true })
      }

      commit('SET_SIM_OVER', false)

      const simulation = d3
        .forceSimulation(state.knots)
        .force('charge', d3.forceCollide().radius(25))
        .force(
          'r',
          d3.forceRadial(function(d) {
            return d.level * 100
          }),
        )
        .on('end', () => {
          commit('SET_SIM_OVER', true)
        })
        .on('tick', handleTick)
        .alphaDecay(0.001)

      commit('SET_SIM', simulation)
    },

    resetForce({ commit }) {
      commit('RESET_FORCE')
    },
  },
}
