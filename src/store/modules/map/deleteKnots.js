import * as gql from '@/api/graphql'

// TODO Factorize DFS with other instances
// TODO keep a store getter of knots array length
export default async function({ commit, dispatch, state, rootState }, knotId) {
  if (Object.keys(state.knots).length < 2 || state.knots[knotId].level === 0) {
    return
  }

  const knotsToDelete = []
  const linksToDelete = []

  const linkIds = Object.keys(state.links)

  const parentLinkId = linkIds.find(id => state.links[id].target === knotId)
  const parentKnotId = state.links[parentLinkId].source

  const dfs = [parentLinkId]
  while (dfs.length > 0) {
    const current = dfs[dfs.length - 1]

    linksToDelete.push(current)
    dfs.pop()

    const target = state.links[current].target

    knotsToDelete.push(target)

    for (const id of linkIds.filter(id => state.links[id].source === target)) {
      dfs.push(id)
    }
  }

  await gql.deleteLinks(state.id, linksToDelete)
  await gql.deleteKnots(state.id, knotsToDelete)
  dispatch('removeLinks', linksToDelete)
  dispatch('removeKnots', knotsToDelete)

  commit('KNOT_REMOVE_CHILDREN', {
    id: parentKnotId,
    childrenToRemove: knotId,
  })
  if (rootState.ui.selectedKnotId === knotId) {
    commit('ui/SET_SELECTED_KNOT_ID', null, { root: true })
  }
}
