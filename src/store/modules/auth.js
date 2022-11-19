import Vue from 'vue'
import { getSpotifyToken, me as gqlMe } from '@/api/graphql'

function initialState() {
  return {
    user: null,
    spotifyToken: null,
  }
}

export default {
  namespaced: true,
  state: initialState,
  getters: {
    token: (state) => (app) => {
      return state.tokens[app]
    },
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_USERNAME(state, username) {
      state.user.username = username
    },
    SET_SPOTIFY_TOKEN(state, token) {
      state.spotifyToken = token
    },
    RESET_AUTH(state) {
      Object.assign(state, initialState())
    },
  },
  actions: {
    async whoami({ commit }) {
      const user = await gqlMe()
      commit('SET_USER', {
        id: user.id,
        username: user.username ?? '',
      })
    },
    async refreshSpotifyToken({ state, commit }) {
      if (state.spotifyToken?.expiry.getTime() > Date.now() + 5 * 60000) {
        return state.spotifyToken
      }

      const token = await getSpotifyToken()
      commit('SET_SPOTIFY_TOKEN', token)
      return state.spotifyToken
    },
  },
}
