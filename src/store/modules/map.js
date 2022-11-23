import * as gql from '@/api/graphql'
import * as spotify from '@/api/spotify'

import processMap from '@/store/modules/map/processMap'
import createKnot from '@/store/modules/map/createKnot'
import deleteKnots from '@/store/modules/map/deleteKnots'
import mutations from '@/store/modules/map/mutations'
import { debounce } from '@/helpers'

function initialState() {
  return {
    id: '',
    meta: {
      title: '',
      author: {
        id: '',
        username: '',
      },
      color: '#222222',
      isPublic: false,
    },

    load: 0,

    readOnly: false,
    editMode: false,

    rootKnotId: null,
    knots: {},
    links: {},

    hovered: null,
    focused: null,
  }
}

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    ...mutations,
    ...{
      MAP_RESET(state) {
        Object.assign(state, initialState())
      },
    },
  },
  actions: {
    //TODO ? Bundle multiple related function inside wrapper objects in one dep file ?
    ...{
      processMap,
      createKnot,
      deleteKnots,
    },
    ...{
      async fetchAndProcessMap(
        { commit, dispatch, rootState },
        { id, templateId },
      ) {
        let rawMap = await gql.map(id)

        if (templateId && rawMap.knots.length === 1) {
          rawMap = null
          throw new Error('not implemented')
          // const templateMap = await gql.map(templateId)
          // rawMap = await gql.map(<created map id>)
        }

        commit('MAP_SET_ID', id)
        commit('MAP_SET_META', rawMap)
        commit('MAP_SET_READONLY', rawMap.author.id !== rootState.auth.user.id)
        commit('MAP_SET_LOAD', 1)
        commit(
          'SET_ROOT_KNOT_ID',
          rawMap.knots.find((knot) => knot.level === 0).id,
        )

        dispatch('processMap', rawMap)
      },

      async setTracksData({ commit }, input) {
        const trackIds = Object.keys(input).join()
        const parsedTracks = await spotify.getTracks(trackIds)

        for (const track of parsedTracks) {
          commit('KNOT_SET_TRACK', {
            track: track,
            knots: input[track.id],
          })
        }
      },
      async populate({ state, dispatch }) {
        let ac = { count: 0, tracks: {} }
        for (const key in state.knots) {
          const id = state.knots[key].track.id
          if (ac.tracks[id]) {
            ac.tracks[id].push(key)
          } else {
            ac.tracks[id] = [key]
          }
          ac.count++
          if (ac.count === 50) {
            await dispatch('setTracksData', ac.tracks)
            ac = { count: 0, tracks: {} }
          }
        }
        if (ac.count !== 0) await dispatch('setTracksData', ac.tracks)
      },

      addKnots({ commit }, knots) {
        commit('MAP_ADD_KNOTS', knots)
        commit('force/ADD_KNOTS', knots, { root: true })
      },
      removeKnots({ commit }, knots) {
        commit('KNOTS_DELETE', knots)
        commit('force/KNOTS_DELETE', knots, { root: true })
      },
      addLinks({ commit }, links) {
        commit('MAP_ADD_LINKS', links)
      },
      removeLinks({ commit }, links) {
        commit('LINKS_DELETE', links)
      },

      async focus({ commit }, target) {
        commit('SET_FOCUSED', null)
        await new Promise((r) => setTimeout(r, 100))
        commit('SET_FOCUSED', target)
      },

      knotHoverEvent: debounce(({ commit }, knotIdOrNull) => {
        commit('SET_HOVERED', knotIdOrNull)
      }, 50),

      resetMap({ dispatch, commit }) {
        commit('player/RESET_PLAYER', null, { root: true })
        commit('ui/RESET_MAP_UI', null, { root: true })
        dispatch('force/resetForce', null, { root: true })
        commit('MAP_RESET')
      },
    },
  },
}
