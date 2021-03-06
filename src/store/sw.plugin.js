/* eslint-disable no-unused-expressions, no-console */
import { get, map } from 'lodash-es'
import { loadPokemonList } from '@/data'

const CACHE_CMD = 'SET_POKEMON_IMAGE_CACHE'

// https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
const allowDownload = () => {
  // @ts-ignore
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || navigator.msConnection

  if (!conn) {
    return true
  }

  // if (conn.saveData === true) {
  //   return false
  // }

  return conn.type === 'wifi' || conn.effectiveType === '4g'
}

export default (store) => {
  let cached = false

  document.addEventListener('sw:update', () => {
    store.commit('setHasUpdate', true)
  })

  document.addEventListener('sw:ready', async () => {
    store.commit('setSWReady', true)
  })

  document.addEventListener('sw:cached', async (event) => {
    if (cached) {
      return
    }

    cached = true

    const swr = get(event, ['meta', 'sw'])

    const sw = swr.active

    if (!sw) {
      return
    }

    if (!allowDownload()) {
      console.warn('Skiping download pokemon images')
      return
    }

    const list = await loadPokemonList()

    sw.postMessage({
      action: CACHE_CMD,
      data: map(list, 'name')
    })
  })
}
