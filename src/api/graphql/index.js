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

function parseToken(linkedApp) {
  return {
    access: linkedApp.accessToken,
    expiry: new Date(linkedApp.tokenExpiry),
    userId: linkedApp.userId,
  }
}

export async function me() {
  const r = await perform(`
    query {
      me {
        id
        username
        linkedApps(type: SPOTIFY) {
          accessToken
          tokenExpiry
          userId
        }
      }
    }
  `)
  if (r.errors) throw new Error(ERROR_MSG)
  const data = r.data.me
  return {
    id: data.id,
    username: data.username,
    token: parseToken(data.linkedApps[0]),
  }
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
          source
          target
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
        flagshipId
        author {
          username
        }
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

export async function getToken() {
  const r = await perform(`
    mutation {
      getToken(app: SPOTIFY) {
        accessToken
        tokenExpiry
        userId
      }
    }
  `)
  if (r.errors) throw new Error('fetch access token: failed')
  return parseToken(r.data.getToken)
}

export async function createMap(mapInput) {
  if (!mapInput) throw new Error('missing parameters')

  const r = await perform(
    `
    mutation($mapInput: MapInput!) {
      createMap(mapInput: $mapInput) {
        id
        title
        flagshipId
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
          flagshipId
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

export async function createKnots(mapId, trackIds, level, visited) {
  const r = await perform(
    `
      mutation($mapId: ID!, $newKnots: [KnotInput!]!) {
        createKnots(mapId: $mapId, newKnots: $newKnots) {
          id
          trackId
          level
          visited
        }
      }
    `,
    {
      mapId: mapId,
      newKnots: trackIds.reduce((acc, id) => {
        acc.push({ trackId: id, level: level, visited: visited })
        return acc
      }, []),
    },
  )
  return { errors: 'errors' in r === true, knots: r.data.createKnots }
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

export async function createLinks(mapId, sourceId, targetIds) {
  const r = await perform(
    `
    mutation($mapId: ID!, $sourceId: String!, $targetIds: [String!]!) {
      createLinks(mapId: $mapId, sourceId: $sourceId, targetIds: $targetIds)
      {
          id
          source
          target
      }
    }
  `,
    {
      mapId: mapId,
      sourceId: sourceId,
      targetIds: targetIds,
    },
  )
  return { errors: 'errors' in r === true, links: r.data.createLinks }
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
