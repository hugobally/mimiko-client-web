import axios from 'axios'

const API_URL = process.env.VUE_APP_BACKEND_URL + '/graphql'
const ERROR_MSG = 'backend query failed'

async function perform(queryStr, variables = {}) {
  const response = await axios({
    method: 'POST',
    url: API_URL,
    data: JSON.stringify({ query: queryStr, variables: variables }),
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  })

  return response.data
}

// Queries

function parseToken(token) {
  return {
    access: token.accessToken,
    expiry: new Date(token.tokenExpiry),
  }
}

export async function me() {
  const r = await perform(`
    query {
      me {
        id
        username
      }
    }
  `)
  if (r.errors) throw new Error(ERROR_MSG)
  const data = r.data.me
  return {
    id: data.id,
    username: data.username,
  }
}

export async function getSpotifyToken() {
  const r = await perform(`
    query {
      getSpotifyToken {
        accessToken
        tokenExpiry
      }
    }
  `)
  if (r.errors) throw new Error('fetch spotify token: failed')
  return parseToken(r.data.getSpotifyToken)
}

export async function map(id) {
  const r = await perform(
    `
    query($mapId: ID!) {
      map(mapId: $mapId) {
        id
        title
        public
        author {
          id
          username
        }
        knots {
          id
          trackId
          level
          visited
        }
        links {
          id
          sourceID
          targetID
        }
      }
    }
  `,
    {
      mapId: id,
    },
  )
  if (r.errors) throw new Error(ERROR_MSG)
  return r.data.map
}

export async function maps(filter = {}) {
  const r = await perform(
    `
    query($filter: MapsFilter) {
      maps(filter: $filter) {
        id
        title
        flagshipID
        public
      }
    }
    `,
    {
      filter: filter,
    },
  )
  if (r.errors) return []
  return r.data.maps
}

// Mutations

export async function updateUsername(newUsername) {
  const r = await perform(
    `
    mutation($newUsername: String!) {
      updateUsername(newUsername: $newUsername) {
        username
      }
    }
  `,
    {
      newUsername: newUsername,
    },
  )
  if (r.errors) return null
  return r.data.updateUsername
}

export async function createMap(mapInput) {
  if (!mapInput) throw new Error('missing parameters')

  const r = await perform(
    `
    mutation($mapInput: MapInput!) {
      createMap(mapInput: $mapInput) {
        id
        title
        flagshipID
        author {
          id
        }
        public
      }
    }
  `,
    {
      mapInput: mapInput,
    },
  )
  if (r.errors) return null
  return r.data.createMap
}

export async function updateMap(mapId, mapInput) {
  if (!mapId || !mapInput) throw new Error('missing parameters')

  const r = await perform(
    `
      mutation($mapId: ID!, $mapInput: MapInput!) {
        updateMap(mapId: $mapId, mapInput: $mapInput) {
          title
          flagshipID
          public
        }
      }
    `,
    {
      mapId: mapId,
      mapInput: mapInput,
    },
  )
  if (r.errors) return null
  return r.data.updateMap
}

export async function deleteMap(mapId) {
  if (!mapId) throw new Error('missing parameters')

  const r = await perform(
    `
      mutation($mapId: ID!) {
        deleteMap(mapId: $mapId) {
          success
        }
      }
    `,
    {
      mapId: mapId,
    },
  )
  if (r.errors || !r.data.deleteMap.success) throw new Error(ERROR_MSG)
}

export async function createKnot({ mapId, sourceId, trackId, level, visited }) {
  const r = await perform(
    `
      mutation($mapId: ID!, $knotInput: KnotInput!) {
        createKnot(mapId: $mapId, knotInput: $knotInput) {
          id
          trackId
          level
          visited
          parentLinks {
            id
            sourceID
            targetID
          }
        }
      }
    `,
    {
      mapId: mapId,
      knotInput: { sourceId, trackId, level, visited },
    },
  )
  if (r.errors) throw new Error(ERROR_MSG)
  return r.data.createKnot
}

export async function updateKnot(knotId, knotInput) {
  if (!knotInput) throw new Error('missing parameters')

  const r = await perform(
    `
    mutation($knotId: ID!, $knotInput: KnotInput!) {
      updateKnot(knotId: $knotId, knotInput: $knotInput) {
        visited
      }
    }
  `,
    {
      knotId: knotId,
      knotInput: knotInput,
    },
  )
  if (r.errors) throw new Error(ERROR_MSG)
  return r.data.updateKnot
}

export async function deleteKnots(mapId, knotIds) {
  const r = await perform(
    `
    mutation($mapId: ID!, $knotIds: [String!]!) {
      deleteKnots(mapId: $mapId, knotIds: $knotIds) {
        success
        count
      }
    }
  `,
    {
      mapId: mapId,
      knotIds: knotIds,
    },
  )
  if (r.errors) throw new Error(ERROR_MSG)
  return r.data.deleteKnots.count
}

export async function deleteLinks(mapId, linkIds) {
  const r = await perform(
    `
    mutation($mapId: ID!, $linkIds: [String!]!) {
      deleteLinks(mapId: $mapId, linkIds: $linkIds) {
        success
        count
      }
    }
  `,
    {
      mapId: mapId,
      linkIds: linkIds,
    },
  )
  if (r.errors) throw new Error(ERROR_MSG)
  return r.data.deleteLinks.count
}
