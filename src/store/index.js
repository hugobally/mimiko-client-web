import Vue from 'vue'
import Vuex from 'vuex'

import ui from './modules/ui'
import auth from './modules/auth'
import map from './modules/map'
import force from './modules/force'
import player from './modules/player'
import maplist from './modules/maplist'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    ui: ui,
    auth: auth,
    map: map,
    player: player,
    force: force,
    maplist: maplist,
  },
})
