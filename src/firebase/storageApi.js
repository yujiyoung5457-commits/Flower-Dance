const MAX_IMAGE_BYTES = 650 * 1024

const loadImage = (file) => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file)
  const image = new Image()
  image.onload = () => {
    URL.revokeObjectURL(objectUrl)
    resolve(image)
  }
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    reject(new Error('이미지 파일을 읽지 못했습니다.'))
  }
  image.src = objectUrl
})

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result))
  reader.onerror = () => reject(new Error('이미지 변환에 실패했습니다.'))
  reader.readAsDataURL(blob)
})

// Firebase Storage 없이도 무료 Firestore에 저장할 수 있도록 카드용 이미지로 압축합니다.
const encodeProductImage = async (file) => {
  if (!file?.type?.startsWith('image/') && !/\.(jfif|jiff)$/i.test(file?.name || '')) {
    throw new Error('이미지 파일만 선택할 수 있습니다.')
  }

  const image = await loadImage(file)
  let maxEdge = 1200
  let quality = 0.82

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (blob && blob.size <= MAX_IMAGE_BYTES) return blobToDataUrl(blob)
    maxEdge = Math.round(maxEdge * 0.8)
    quality -= 0.1
  }

  const error = new Error('이미지를 더 작은 파일로 선택해 주세요.')
  error.code = 'product/image-too-large'
  throw error
}

export { encodeProductImage }
