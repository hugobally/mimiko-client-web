const TUTORIAL_STEPS = ['select_knot', 'add_knot', 'play_knot', 'home']

function initialGlobalUI() {
  return {
    flashQueue: [],
  }
}

function initialMapUI() {
  return {
    manualZoomQueue: [],
    zoomLevel: 1,
    transform: { x: 0.0, y: 0.0 },
    selectedKnotId: null,
    tutorialSteps: TUTORIAL_STEPS.filter(step => !localStorage.getItem(step)),
  }
}

function initialState() {
  return {
    ...initialGlobalUI(),
    ...initialMapUI(),
  }
}

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    PUSH_FLASH_QUEUE(state, message) {
      state.flashQueue.push(message)
    },
    SHIFT_FLASH_QUEUE(state) {
      state.flashQueue.shift()
    },
    PUSH_ZOOM_QUEUE(state, diff) {
      state.manualZoomQueue.push(diff)
    },
    SHIFT_ZOOM_QUEUE(state) {
      state.manualZoomQueue.shift()
    },
    SET_ZOOM_LEVEL(state, newVal) {
      state.zoomLevel = newVal
    },
    SET_TRANSFORM(state, newVal) {
      state.transform = newVal
    },
    SET_SELECTED_KNOT_ID(state, knotId) {
      state.selectedKnotId = knotId
    },
    RESET_MAP_UI(state) {
      Object.assign(state, {
        ...state,
        ...initialMapUI(),
      })
    },
    REMOVE_TUTORIAL_STEP(state, stepToRemove) {
      state.tutorialSteps = state.tutorialSteps.filter(
        step => step !== stepToRemove,
      )
    },
  },
  actions: {
    // TODO unnecessary, use commit
    pushFlashQueue({ commit }, message) {
      commit('PUSH_FLASH_QUEUE', message)
    },
    shiftFlashQueue({ commit }) {
      commit('SHIFT_FLASH_QUEUE')
    },
    setTutorialStepDone({ commit }, step) {
      localStorage.setItem(step, 'done')
      commit('REMOVE_TUTORIAL_STEP', step)
    },
    selectKnot({ state, commit, dispatch }, id) {
      commit('SET_SELECTED_KNOT_ID', id)
      if (state.tutorialSteps.includes('select_knot')) {
        dispatch('setTutorialStepDone', 'select_knot')
      }
    },
  },
}
