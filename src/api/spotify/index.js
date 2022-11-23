import axios from 'axios'
import store from '@/store'

const API_BASE_URL = 'https://api.spotify.com/v1/'
const LIKED_PLAYLIST_NAME = 'Liked from mimiko'

// REQUESTS

export async function getTracks(ids) {
  const params = {
    ids: ids,
  }
  const data = await performGetRequest('tracks', params)
  return parseTracks(data.tracks)
}

export async function searchForTrack(searchString) {
  const params = {
    q: searchString,
    type: 'track',
    limit: 1,
    // market: 'from_token',
  }
  const data = await performGetRequest('search', params)
  return parseTracks([data.tracks.items[0]])
}

export async function autocomplete(searchString) {
  const params = {
    q: searchString,
    type: 'track',
    // market: 'from_token',
    limit: 10,
  }
  try {
    const data = await performGetRequest('search', params)

    const results = data.tracks.items
    if (results.length < 1) return null

    return results.map((track) => {
      return `${artistNamesToString(track.artists)} - ${track.name}`
    })
  } catch (error) {
    //TODO
    return null
  }
}

export async function recoFromTrack({
  seeds,
  numResults = 5,
  blacklist = [],
  previewMode = true,
}) {
  const params = {
    limit: Math.max(numResults, 5),
    seed_tracks: seeds.join(),
    // market: 'from_token',
  }
  const data = await performGetRequest('recommendations', params)

  const tracks = data.tracks.filter((track) => {
    if (blacklist.includes(track.id)) {
      return false
    }
    if (previewMode && !track.preview_url) {
      return false
    }
    return true
  })

  if (tracks.length < 1) return null
  return parseTracks(tracks)
}

export async function getActiveDevice(localDeviceId) {
  const data = await performGetRequest('me/player/devices')
  if (data.devices.length < 1) return null

  const activeDevice = data.devices.find(
    (device) => device.is_active === true && device.id !== localDeviceId,
  )
  if (!activeDevice) return null

  return activeDevice.id
}

export async function playTrack(tracks, localDeviceId) {
  const data = {
    uris: tracks.map((id) => `spotify:track:${id}`),
  }
  //TODO Optimize ? (avoid 2 requests on each play)
  const activeDeviceId = await getActiveDevice(localDeviceId)
  await performPostRequest(
    `me/player/play?device_id=${activeDeviceId || localDeviceId}`,
    data,
    'PUT',
  )
}

export async function findPlaylist() {
  let playlist = null

  const params = {
    limit: 20,
    offset: 0,
  }

  let total = params.limit + 1
  while (!playlist && total > params.offset + params.limit) {
    const data = await performGetRequest('me/playlists', params)
    playlist = data.items.find(
      (playlist) => playlist.name === LIKED_PLAYLIST_NAME,
    )

    total = data.total
    params.offset += params.limit
  }

  return playlist ? playlist.id : null
}

export async function createPlaylist() {
  const params = {
    name: LIKED_PLAYLIST_NAME,
    public: false,
  }
  const token = await getToken()

  const data = await performPostRequest(
    `users/${token.userId}/playlists`,
    params,
  )
  return data.id
}

export async function getPlaylistTracks(playlistId) {
  const params = {
    fields: 'items.track.id,total',
    limit: 100,
    offset: 0,
    market: 'from_token',
  }

  let total = params.limit + 1
  const tracks = []

  while (tracks.length !== total && total > params.offset + params.limit) {
    const data = await performGetRequest(
      `playlists/${playlistId}/tracks`,
      params,
    )
    for (const trackId of data.items.map((item) => item.track.id)) {
      tracks.push(trackId)
    }
    params.offset += params.limit
    total = data.total
  }
  return tracks
}

export async function addTrackToPlaylist(playlistId, trackUri) {
  const params = {
    uris: [`spotify:track:${trackUri}`],
    position: 0,
  }
  await performPostRequest(`playlists/${playlistId}/tracks`, params)
}

export async function removeTrackFromPlaylist(playlistId, trackUri) {
  const params = {
    tracks: [{ uri: `spotify:track:${trackUri}` }],
  }
  await performPostRequest(`playlists/${playlistId}/tracks`, params, 'DELETE')
}

// Utility

async function performGetRequest(endpoint, params) {
  const token = await getToken()
  const response = await axios.get(API_BASE_URL + endpoint, {
    headers: {
      Authorization: 'Bearer ' + token.access,
    },
    params: params,
  })
  return response.data
}

async function performPostRequest(endpoint, data, method = 'POST') {
  const token = await getToken()
  const response = await axios({
    method: method,
    url: API_BASE_URL + endpoint,
    data: data,
    headers: {
      Authorization: 'Bearer ' + token.access,
    },
  })
  return response.data
}

export async function getToken() {
  await store.dispatch('auth/refreshSpotifyToken')
  return store.state.auth.spotifyToken
}

// TODO There are 3 image sizes returned -> Optimize?
function parseTracks(tracks) {
  return tracks.map((track) => {
    return {
      id: track.id,
      title: track.name,
      artist: artistNamesToString(track.artists),
      imgURL: track.album.images[1].url,
      previewURL: track.preview_url,
    }
  })
}

function artistNamesToString(artists) {
  let result = ''
  artists.forEach((artist, i) => {
    if (i !== 0) result += ', '
    result += artist.name
  })
  return result
}
