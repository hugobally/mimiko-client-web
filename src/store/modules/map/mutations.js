import Vue from 'vue'

export default {
  // MAP
  MAP_SET_ID(state, id) {
    state.id = id
  },
  MAP_SET_META(state, map) {
    state.meta.author = map.author
    state.meta.title = map.title
    state.meta.isPublic = map.public
  },
  MAP_SET_READONLY(state, value) {
    state.readOnly = value
  },
  MAP_SET_LOAD(state, val) {
    state.load = val
  },
  SET_ROOT_KNOT_ID(state, id) {
    state.rootKnotId = id
  },
  MAP_ADD_KNOTS(state, knots) {
    for (const knot of knots) {
      Vue.set(state.knots, knot.id, {
        track: knot.track || { id: knot.trackId },
        x: knot.x || 0,
        y: knot.y || 0,
        level: knot.level,
        parent: knot.parent || null,
        children: knot.children || [],
        visited: knot.visited || true,
      })
    }
  },
  MAP_ADD_LINKS(state, links) {
    for (const link of links) {
      Vue.set(state.links, link.id, {
        source: link.source,
        target: link.target,
        auto: link.auto,
      })
    }
  },
  SET_EDIT_MODE(state, value) {
    state.editMode = value
  },
  SET_HOVERED(state, id) {
    state.hovered = id
  },
  SET_FOCUSED(state, id) {
    state.focused = id
  },

  //KNOT
  KNOT_SET_TRACK(state, { track, knots }) {
    if (!knots) return

    for (const id of knots) {
      const knot = state.knots[id]
      knot.track = { ...knot.track, ...track }
    }
  },
  KNOT_ADD_CHILD(state, { id, child }) {
    state.knots[id].children.push(child)
  },
  KNOT_REMOVE_CHILDREN(state, { id, childrenToRemove }) {
    const newChildren = state.knots[id].children.filter(
      (id) => !childrenToRemove.includes(id),
    )
    state.knots[id].children = newChildren
  },
  KNOT_SET_VISITED(state, id) {
    state.knots[id].visited = true
  },
  KNOTS_SET_POS(state, newKnots) {
    for (const v of newKnots) {
      const knot = state.knots[v.id] || {}
      knot.x = v.x
      knot.y = v.y
    }
  },
  KNOTS_DELETE(state, ids) {
    for (const id of ids) {
      Vue.delete(state.knots, id)
    }
  },

  //LINK
  LINKS_SET_SRC(state, links) {
    for (const link of links) {
      state.links[link.key].target = link.val.target
    }
  },
  LINKS_DELETE(state, ids) {
    for (const id of ids) {
      Vue.delete(state.links, id)
    }
  },
}
