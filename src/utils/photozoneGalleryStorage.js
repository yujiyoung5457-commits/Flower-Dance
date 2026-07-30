const DATABASE_NAME = 'photozone-gallery'
const STORE_NAME = 'artworks'

const openDatabase = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, 1)

  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(STORE_NAME)) {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
  }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

const runTransaction = async (mode, callback) => {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    let result
    callback(store, (value) => { result = value }, reject)
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(transaction.error)
  })
}

const savePhotozoneArtwork = (artwork) => runTransaction('readwrite', (store, resolve) => {
  store.put(artwork)
  resolve()
})

const getPhotozoneArtworks = async (sharedOnly = false) => {
  const artworks = await runTransaction('readonly', (store, resolve) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
  })

  return artworks
    .filter((artwork) => !sharedOnly || artwork.shared)
    .sort((first, second) => second.id - first.id)
}

const updatePhotozoneArtwork = async (id, message) => {
  const artwork = await runTransaction('readonly', (store, resolve) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
  })
  if (!artwork) return

  await savePhotozoneArtwork({ ...artwork, message })
}

const deletePhotozoneArtwork = (id) => runTransaction('readwrite', (store, resolve) => {
  store.delete(id)
  resolve()
})

export {
  deletePhotozoneArtwork,
  getPhotozoneArtworks,
  savePhotozoneArtwork,
  updatePhotozoneArtwork,
}
