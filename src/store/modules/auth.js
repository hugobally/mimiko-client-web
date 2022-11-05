import Vue from 'vue'
import { getToken as gqlGetToken, me as gqlMe } from '@/api/graphql'

function initialState() {
  return {
    user: {
      id: '',
      username: '',
      logged: false,
    },
    tokens: {},
    refreshAppTokenLock: false,
    relogAttempted: false,
  }
}

export default {
  namespaced: true,
  state: initialState,
  getters: {
    token: state => app => {
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
    SET_TOKEN(state, { app, token }) {
      Vue.set(state.tokens, app, token)
    },
    RELOG_ATTEMPTED(state) {
      state.relogAttempted = true
    },
    SET_APP_TOKEN_LOCK(state, newVal) {
      state.refreshAppTokenLock = newVal
    },

    RESET_AUTH(state) {
      Object.assign(state, initialState())
    },
  },
  actions: {
    async whoami({ commit }) {
      commit('RELOG_ATTEMPTED')
      let user = {}

      try {
        user = await gqlMe()
        commit('SET_USER', {
          id: user.id,
          username: user.username || '',
          logged: true,
        })
        commit('SET_TOKEN', { app: 'spotify', token: user.token })
      } catch (error) {
        // TODO
      }
    },
    async refreshToken({ state, commit, getters }) {
      const token = getters.token('spotify')
      if (!token) throw new Error('No token found')

      if (token.expiry.getTime() > Date.now() + 5 * 60000) return

      if (state.refreshAppTokenLock) return

      commit('SET_APP_TOKEN_LOCK', true)
      const newToken = await gqlGetToken().catch(() => {})
      commit('SET_APP_TOKEN_LOCK', false)

      commit('SET_TOKEN', { app: 'spotify', token: newToken })
    },
  },
}
