import * as gql from '@/api/graphql'
import * as spotify from '@/api/spotify'

export default async function (
  { commit, state, rootState, dispatch },
  { sourceId, track, visited },
) {
  const sourceKnot = state.knots[sourceId]
  const existingTracks = Object.values(state.knots).map((knot) => knot.track.id)

  let newX,
    newY = 0

  const parent = state.knots[sourceKnot.parent]
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

  if (!track) {
    const seeds = [sourceKnot.track.id]
    const recos = await spotify.recoFromTrack({
      seeds,
      blacklist: existingTracks,
      previewMode: rootState.player.previewMode,
    })
    track = recos[0]
  }

  const knotResponse = await gql.createKnot({
    mapId: state.id,
    sourceId,
    trackId: track.id,
    level: sourceKnot.level + 1,
    visited,
  })

  const newKnot = {
    id: knotResponse.id,
    level: knotResponse.level,
    visited: knotResponse.visited,
    track,
    x: newX,
    y: newY,
    parent: sourceId,
    children: [],
  }

  dispatch('addKnots', [newKnot])

  const newLink = knotResponse.parentLinks[0]
  dispatch('addLinks', [
    { id: newLink.id, source: newLink.sourceID, target: newLink.targetID },
  ])

  commit('KNOT_ADD_CHILD', { id: sourceId, child: newKnot.id })

  commit('force/RESTART_SIM', null, { root: true })
  commit('player/PLAYQUEUE_RESET', null, { root: true })
  dispatch('player/bufferFindNext', null, { root: true })

  return newKnot
}
