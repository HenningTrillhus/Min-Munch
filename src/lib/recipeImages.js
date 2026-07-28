import { supabase } from './supabaseClient'

const BUCKET = 'recipe-images'
const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

async function compressImage(file) {
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Kunne ikke komprimere bildet'))),
      'image/jpeg',
      JPEG_QUALITY
    )
  })
}

export async function uploadRecipeImage(file) {
  const compressed = await compressImage(file)
  const path = `${crypto.randomUUID()}.jpg`

  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: 'image/jpeg',
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteRecipeImage(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = url?.indexOf(marker)
  if (index == null || index === -1) return

  const path = url.slice(index + marker.length)
  await supabase.storage.from(BUCKET).remove([path])
}
