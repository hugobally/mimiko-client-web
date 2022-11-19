import {
  getToken,
  playTrack,
  recoFromTrack,
  findPlaylist,
  createPlaylist,
  getPlaylistTracks,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
} from '@/api/spotify'
import { updateKnot } from '@/api/graphql'

function initialBuffer() {
  return {
    previous: null,
    current: null,
    next: null,
  }
}

function initialPlayer() {
  return {
    track: null,
    playedKnotId: null,

    position: 0,
    duration: 0,

    playQueue: [],
    buffer: initialBuffer(),
    bufferBlock: false,
    status: 'IDLE',

    previewMode: true,
    autoplay: false,
  }
}

function initialSdk() {
  return {
    sdk: null,
    deviceId: '',
    likedPlaylist: { id: null, tracks: [] },
  }
}

function initialState() {
  return {
    ...initialSdk(),
    ...initialPlayer(),
  }
}

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    SET_SDK(state, sdk) {
      state.sdk = sdk
    },
    SET_DEVICE_ID(state, id) {
      state.deviceId = id
    },
    SET_TRACK(state, track) {
      state.track = track
    },
    SET_TIMESTAMP(state, playerState) {
      if (state.track) {
        state.position = playerState.position
        state.duration = playerState.duration
      }
    },
    SET_PLAYED_KNOT_ID(state, knotId) {
      state.playedKnotId = knotId
    },
    SET_AUTOPLAY(state, newVal) {
      state.autoplay = newVal
    },

    BUFFER_ROTATE(state) {
      state.buffer.previous = state.buffer.current
      state.buffer.current = state.buffer.next
      state.buffer.next = null
    },
    BUFFER_RESET(state, item = null) {
      state.buffer = initialBuffer()
      if (item) state.buffer.current = item
    },
    BUFFER_SET_NEXT(state, item) {
      state.buffer.next = item
    },
    BUFFER_UPDATE_CURRENT(state, item) {
      state.buffer.current = item
    },
    BUFFER_BLOCK(state) {
      state.bufferBlock = true
    },
    BUFFER_UNBLOCK(state) {
      state.bufferBlock = false
    },

    PLAYQUEUE_PUSH(state, item) {
      state.playQueue.push(item)
    },
    PLAYQUEUE_UNSHIFT(state, item) {
      state.playQueue.unshift(item)
    },
    PLAYQUEUE_SHIFT(state) {
      state.playQueue.shift()
    },
    PLAYQUEUE_RESET(state) {
      state.playQueue = []
    },

    STATUS_PLAYING(state) {
      state.status = 'PLAYING'
    },
    STATUS_PAUSED(state) {
      state.status = 'PAUSED'
    },
    STATUS_IDLE(state) {
      state.status = 'IDLE'
    },

    LIKED_PLAYLIST_INIT(state, { id, tracks }) {
      state.likedPlaylist = { id, tracks }
    },
    LIKED_PLAYLIST_PUSH(state, id) {
      state.likedPlaylist.tracks.push(id)
    },
    LIKED_PLAYLIST_REMOVE(state, id) {
      state.likedPlaylist.tracks = state.likedPlaylist.tracks.filter(
        (track) => track != id,
      )
    },

    RESET_PLAYER(state) {
      Object.assign(state, {
        ...initialState(),
        ...{
          sdk: state.sdk,
          deviceId: state.deviceId,
          likedPlaylist: state.likedPlaylist,
          autoplay: state.autoplay,
        },
      })
    },
    DISCONNECT_SDK(state) {
      state.sdk?.disconnect()
      state.sdk = null
    },
  },
  actions: {
    loadSdk({ state, commit, dispatch }) {
      if (window.onSpotifyWebPlaybackSDKReady) return null

      const spotifyPlaybackSDK = document.createElement('script')
      spotifyPlaybackSDK.setAttribute(
        'src',
        'https://sdk.scdn.co/spotify-player.js',
      )
      spotifyPlaybackSDK.async = true

      document.body.appendChild(spotifyPlaybackSDK)

      return new Promise((resolve) => {
        window.onSpotifyWebPlaybackSDKReady = () => {
          // eslint-disable-next-line no-undef
          const player = new Spotify.Player({
            name: 'Mimiko',
            getOAuthToken: async (callback) => {
              try {
                const token = await getToken()
                callback(token.access)
              } catch (error) {
                callback('')
              }
            },
          })

          player.addListener('player_state_changed', (playerState) => {
            if (!playerState) {
              // TODO Resetting player is buggy
              // commit('RESET_PLAYER')
              return
            }

            commit('SET_TIMESTAMP', playerState)

            if (playerState.paused && state.status === 'PLAYING') {
              commit('STATUS_PAUSED')
            }
            if (!playerState.paused && state.status !== 'PLAYING') {
              commit('STATUS_PLAYING')
            }

            dispatch('bufferSync', playerState)
          })

          player.addListener('ready', ({ device_id }) => {
            commit('SET_DEVICE_ID', device_id)
          })

          player.connect()
          commit('SET_SDK', player)

          resolve()
        }
      })
    },

    async loadLikedPlaylist({ commit }) {
      try {
        const id = await findPlaylist()
        if (!id) return

        const tracks = await getPlaylistTracks(id)
        commit('LIKED_PLAYLIST_INIT', { id: id, tracks: tracks })
      } catch (error) {
        // TODO
      }
    },
    async createLikedPlaylist({ commit }) {
      const id = await createPlaylist()
      if (!id) throw new Error()

      commit('LIKED_PLAYLIST_INIT', { id: id, tracks: [] })
    },
    async addToLikedPlaylist({ state, commit }, trackId) {
      if (!state.likedPlaylist.id) return
      if (state.likedPlaylist.tracks.includes(trackId)) return

      await addTrackToPlaylist(state.likedPlaylist.id, trackId)
      commit('LIKED_PLAYLIST_PUSH', trackId)
    },
    async removeFromLikedPlaylist({ state, commit }, trackId) {
      if (!state.likedPlaylist.id) return
      if (!state.likedPlaylist.tracks.includes(trackId)) return

      await removeTrackFromPlaylist(state.likedPlaylist.id, trackId)
      commit('LIKED_PLAYLIST_REMOVE', trackId)
    },

    playKnot({ commit, dispatch }, { track, knot }) {
      commit('PLAYQUEUE_RESET')
      commit('PLAYQUEUE_PUSH', { track: track, knot: knot })
      dispatch('bufferForcePlay')
    },
    async pausePlayback({ commit }) {
      commit('STATUS_PAUSED')
    },
    async resumePlayback({ commit }) {
      commit('STATUS_PLAYING')
    },

    async bufferForcePlay({ state, commit, dispatch }) {
      if (state.bufferBlock) return
      if (state.playQueue.length === 0) return

      commit('BUFFER_BLOCK')

      const newCurrent = state.playQueue[0]
      commit('PLAYQUEUE_SHIFT')

      commit('BUFFER_RESET', newCurrent)

      try {
        await dispatch('bufferPlay')
      } catch (error) {
        commit('STATUS_PAUSED')
      } finally {
        commit('BUFFER_UNBLOCK')
      }
    },
    async bufferPlayNext({ dispatch, commit }) {
      await dispatch('bufferFindNext')
      commit('BUFFER_ROTATE')
      dispatch('bufferPlay')
    },
    // TODO Only for Spotify Login
    // async bufferSync({ state, rootState, commit, dispatch }, remote) {
    //   if (state.bufferBlock) return
    //
    //   const tracks = remote.track_window
    //
    //   const remoteCurrent = tracks.current_track
    //
    //   // TODO DISABLED -- Resetting the player is buggy
    //   // If a track was not played from local player, reset local player
    //   //
    //   // const bufferCurrent = state.buffer.current
    //   // if (bufferCurrent && remoteCurrent.id !== bufferCurrent.track.id) {
    //   //   if (remoteCurrent.name !== bufferCurrent.track.title) {
    //   //     const bufferPrevious = state.buffer.previous
    //   //     if (!bufferPrevious) commit('RESET_PLAYER')
    //   //     if (
    //   //       bufferPrevious &&
    //   //       remoteCurrent.name !== bufferPrevious.track.title
    //   //     ) {
    //   //       commit('RESET_PLAYER')
    //   //     }
    //   //   }
    //   // }
    //
    //   const remotePrevious = tracks.previous_tracks[0]
    //
    //   if (
    //     remote.position === 0 &&
    //     remote.paused &&
    //     remotePrevious &&
    //     remotePrevious.id === remoteCurrent.id
    //   ) {
    //     commit('BUFFER_BLOCK')
    //
    //     commit('BUFFER_ROTATE')
    //
    //     if (!state.buffer.current) return commit('BUFFER_UNBLOCK')
    //
    //     await dispatch('bufferPlay')
    //
    //     dispatch('bufferFindNext')
    //
    //     await new Promise(r => setTimeout(r, 1000))
    //
    //     commit('map/SET_FOCUSED', state.buffer.current.knot, { root: true })
    //     commit('BUFFER_UNBLOCK')
    //   }
    // },
    async bufferFindNext({ state, commit, rootState }) {
      if (!state.buffer.current || rootState.map.editMode) return

      if (state.playQueue.length === 0) {
        const knots = rootState.map.knots
        const current = state.buffer.current.knot

        if (knots[current].children.length > 0) {
          const stack = [current]
          let last = null
          while (stack.length > 0) {
            last = stack[stack.length - 1]
            commit('PLAYQUEUE_PUSH', { track: knots[last].track, knot: last })
            stack.pop()
            if (knots[last].children.length > 0) {
              for (const child of knots[last].children) {
                stack.push(child)
              }
            }
          }
          commit('PLAYQUEUE_SHIFT')
        } else if (!rootState.map.readOnly) {
          let newTrack = null
          try {
            const seeds = [knots[current].track.id]
            const existingTracks = Object.values(knots).map(
              (knot) => knot.track.id,
            )
            const recos = await recoFromTrack({
              seeds,
              blacklist: existingTracks,
              previewMode: state.previewMode,
            })
            newTrack = recos[0]
          } catch (error) {
            // TODO
          }
          if (newTrack) {
            commit('PLAYQUEUE_PUSH', {
              track: newTrack,
              knot: null,
              attachTo: current,
            })
          }
        }
      }

      const newBufferItem = state.playQueue[0]
      if (newBufferItem) {
        commit('PLAYQUEUE_SHIFT')
        commit('BUFFER_SET_NEXT', newBufferItem)
      }
    },
    async bufferPlay({ state, rootState, commit, dispatch }) {
      const current = state.buffer.current
      if (!current) return

      // TODO Only for visited/not visited feature
      // if (
      //   !rootState.map.knots[current.knot].visited &&
      //   !rootState.map.editMode &&
      //   !rootState.map.readOnly
      // ) {
      //   try {
      //     await updateKnot(current.knot, { visited: true })
      //     commit('map/KNOT_SET_VISITED', current.knot, { root: true })
      //   } catch (error) {
      //     // TODO
      //   }
      // }

      if (!current.knot) {
        const parentId = current.attachTo
        const params = {
          sourceId: parentId,
          track: current.track,
        }

        await dispatch('map/createKnot', params, { root: true })

        // TODO Convoluted
        const knots = rootState.map.knots
        for (const childId of knots[parentId].children) {
          if (knots[childId].track.id === current.track.id) {
            commit('BUFFER_UPDATE_CURRENT', {
              ...current,
              ...{ knot: childId },
            })
            break
          }
        }
      }

      commit('SET_TRACK', current.track)
      commit('SET_PLAYED_KNOT_ID', current.knot)

      await new Promise((r) => setTimeout(r, 100))

      // TODO Only for spotify login
      // try {
      //   await playTrack([current.track.id], state.deviceId)
      // } catch (error) {
      //   commit('SET_PREVIEW_MODE', true)
      //   if (!current.track.previewURL) {
      //     dispatch(
      //       'ui/pushFlashQueue',
      //       {
      //         content:
      //           'No audio preview available for this track on Spotify Free.',
      //         type: 'error',
      //         time: 3000,
      //       },
      //       { root: true },
      //     )
      //   }
      // }
    },
  },
}
