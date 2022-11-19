import * as gql from '@/api/graphql'
import { getTracks as spotifyGetTracks } from '@/api/spotify'

function initialState() {
  return {
    userMaps: null,
    userMapsLock: false,

    publicMaps: [],
    publicMapsLock: false,
  }
}

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    USER_MAPS_CONCAT(state, maps) {
      state.userMaps = state.userMaps ? state.userMaps.concat(maps) : maps
    },
    USER_MAPS_PUSH(state, map) {
      state.userMaps.push(map)
    },
    USER_MAPS_REMOVE(state, id) {
      state.userMaps = state.userMaps.filter((map) => map.id !== id)
    },
    USER_MAPS_UPDATE(state, { id, newVal }) {
      let map = state.userMaps.find((map) => map.id === id)

      if (map) {
        map = newVal
      }
    },

    PUBLIC_MAPS_CONCAT(state, maps) {
      state.publicMaps = state.publicMaps.concat(maps)
    },

    SET_PUBLIC_MAPS_LOCK(state, value) {
      state.publicMapsLock = value
    },
    SET_USER_MAPS_LOCK(state, value) {
      state.userMapsLock = value
    },
  },
  getters: {
    userMaps: (state) => {
      return state.userMaps?.reverse()
    },
    publicMaps: (state) => {
      return state.publicMaps
    },
  },
  actions: {
    async fetchAllUserMaps({ state, rootState, commit }) {
      try {
        const user = rootState.auth.user
        if (!user) return

        commit('USER_MAPS_CONCAT', await fetchMaps({ author: user.id }))
      } finally {
        if (!state.userMaps) {
          commit('USER_MAPS_CONCAT', [])
        }
      }
    },
    async fetchAllPublicMaps({ state, commit }) {
      commit('PUBLIC_MAPS_CONCAT', await fetchMaps())
    },
  },
}

async function fetchMaps(filter) {
  const maps = await gql.maps(filter)
  if (!maps.length) return []

  const tracks = await spotifyGetTracks(
    maps
      .reduce((acc, map) => {
        if (map.flagshipID) acc.push(map.flagshipID)
        return acc
      }, [])
      .join(),
  )

  for (const map of maps) {
    map.flagship = tracks.find((track) => track.id === map.flagshipID)
  }

  return maps
}
