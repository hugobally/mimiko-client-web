import * as gql from '@/api/graphql'
import * as spotify from '@/api/spotify'

const rotateVector = (vec, ang) => {
  ang = -ang * (Math.PI / 180)
  const cos = Math.cos(ang)
  const sin = Math.sin(ang)
  return {
    x: Math.round(10000 * (vec.x * cos - vec.y * sin)) / 10000,
    y: Math.round(10000 * (vec.x * sin + vec.y * cos)) / 10000,
  }
}

export default async function(
  { commit, state, rootState, dispatch },
  { sourceId, newTracks, number, visited },
) {
  const sourceKnot = state.knots[sourceId]
  const parent = state.knots[sourceKnot.parent]
  const existingTracks = Object.values(state.knots).map(knot => knot.track.id)

  let newX,
    newY = 0

  if (!parent) {
    const randXSide = Math.random() > 0.5 ? -1 : 1
    const randYSide = Math.random() > 0.5 ? -1 : 1
    newX = Math.random() * 10 * randXSide
    newY = Math.random() * 10 * randYSide
  } else {
    newX =
      sourceKnot.x +
      (sourceKnot.x - parent.x) * 0.3 +
      (sourceKnot.x > 0 ? 1 : -1) * 10
    newY =
      sourceKnot.y +
      (sourceKnot.y - parent.y) * 0.3 +
      (sourceKnot.y > 0 ? 1 : -1) * 10
  }

  if (!newTracks) {
    try {
      const seeds = [sourceKnot.track.id]
      newTracks = await spotify.recoFromTrack(
        seeds,
        number,
        existingTracks,
        rootState.player.previewMode,
      )
    } catch (error) {
      return
    }
  }

  // TODO Convoluted object -- Refactor
  const tracksInput = newTracks.reduce((acc, track) => {
    acc[track.id] = { track, x: newX, y: newY }
    return acc
  }, {})
  //

  let response = await gql.createKnots(
    state.id,
    Object.keys(tracksInput),
    sourceKnot.level + 1,
    visited,
  )

  const newKnots = response.knots.map(v => {
    return {
      ...v,
      ...tracksInput[v.trackId],
      ...{ parent: sourceId, children: [] },
    }
  })
  const childrenIds = response.knots.map(v => v.id)
  commit('KNOT_ADD_CHILDREN', { id: sourceId, children: childrenIds })

  response = await gql.createLinks(state.id, sourceId, childrenIds)

  dispatch('addKnots', newKnots)
  dispatch('addLinks', response.links)
  commit('force/RESTART_SIM', null, { root: true })
  commit('player/PLAYQUEUE_RESET', null, { root: true })
  dispatch('player/bufferFindNext', null, { root: true })

  return newKnots
}
