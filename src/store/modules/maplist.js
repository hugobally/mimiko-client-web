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
      state.userMaps = state.userMaps.filter(map => map.id !== id)
    },
    USER_MAPS_UPDATE(state, { id, newVal }) {
      let map = state.userMaps.find(map => map.id === id)

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
    userMaps: state => {
      return state.userMaps?.reverse()
    },
    publicMaps: state => {
      return state.publicMaps
    },
  },
  actions: {
    async fetchAllUserMaps({ state, rootState, commit }) {
      if (state.userMapsLock) return

      commit('SET_USER_MAPS_LOCK', true)
      try {
        if (state.userMaps?.length > 0) return

        const user = rootState.auth.user
        if (!user.logged) return

        await fetchMaps(commit, 'USER_MAPS_CONCAT', { userId: user.id })
      } finally {
        if (!state.userMaps) {
          commit('USER_MAPS_CONCAT', [])
        }
        commit('SET_USER_MAPS_LOCK', false)
      }
    },
    async fetchAllPublicMaps({ state, commit }) {
      if (state.publicMapsLock) return

      commit('SET_PUBLIC_MAPS_LOCK', true)
      try {
        if (state.publicMaps.length > 0) return

        await fetchMaps(commit, 'PUBLIC_MAPS_CONCAT', {})
      } finally {
        commit('SET_PUBLIC_MAPS_LOCK', false)
      }
    },
  },
}

async function fetchMaps(commit, mutation, filter) {
  filter = { ...filter, ...{ offset: 0, limit: 50 } }

  // TODO Convoluted
  let resultLength = 1
  while (resultLength > 0) {
    const maps = await gql.maps(filter)

    resultLength = maps.length
    if (resultLength === 0) return

    const tracks = await spotifyGetTracks(
      maps
        .reduce((acc, map) => {
          if (map.flagshipId) acc.push(map.flagshipId)
          return acc
        }, [])
        .join(),
    )
    for (const map of maps) {
      map.flagship = tracks.find(track => track.id === map.flagshipId)
    }
    commit(mutation, maps)

    filter.offset += filter.limit
  }
}
