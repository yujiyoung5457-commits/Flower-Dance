import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'

const uploadProductImage = async (file) => {
  if (!storage) {
    const error = new Error('Firebase Storage is not configured.')
    error.code = 'storage/not-configured'
    throw error
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileRef = ref(storage, `products/${crypto.randomUUID()}.${extension}`)
  const contentType = ['jfif', 'jiff'].includes(extension)
    ? 'image/jpeg'
    : file.type || 'image/jpeg'
  await uploadBytes(fileRef, file, { contentType })
  return getDownloadURL(fileRef)
}

export { uploadProductImage }
