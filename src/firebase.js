// Firebase is only used for product images (Cloud Storage). This web config
// is public by design: it identifies the project, it doesn't grant access.
// What may be uploaded is controlled by the Storage rules in storage.rules.
import { initializeApp } from 'firebase/app'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBqzEuAwYfAObyN_ryP5NaKyBvEnsz-pVQ',
  authDomain: 'qr-sites-bc4aa.firebaseapp.com',
  projectId: 'qr-sites-bc4aa',
  storageBucket: 'qr-sites-bc4aa.firebasestorage.app',
  messagingSenderId: '907178272254',
  appId: '1:907178272254:web:52dc59490664859aff4caf',
}

const storage = getStorage(initializeApp(firebaseConfig))

const MAX_SIDE = 1200

// Shrinks big photos (phone cameras are 4000px+) to at most 1200px and
// re-encodes them as WebP, so menus load fast. Falls back to the original.
async function shrink(file) {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
    return blob ? { blob, ext: 'webp' } : { blob: file, ext: file.name.split('.').pop() }
  } catch {
    return { blob: file, ext: file.name.split('.').pop() }
  }
}

// Uploads a product photo and returns its public download URL
export async function uploadProductImage(businessId, file) {
  const { blob, ext } = await shrink(file)
  const path = `products/${businessId}/${crypto.randomUUID()}.${ext}`
  const snapshot = await uploadBytes(ref(storage, path), blob, {
    contentType: blob.type || file.type,
    cacheControl: 'public, max-age=31536000, immutable',
  })
  return getDownloadURL(snapshot.ref)
}
