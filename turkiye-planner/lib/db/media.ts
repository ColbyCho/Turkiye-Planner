'use client'

import { isConnected, uploadPhoto } from './client'

/**
 * Shrinks a picked image before it goes anywhere: phone cameras produce 4–8 MB
 * files, which is wasteful over hotel wifi and fatal in local mode, where the
 * image has to fit in localStorage as a data URL.
 */
export async function downscaleImage(
  file: File,
  maxEdge: number,
  quality = 0.82
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not read that image.')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  )
  if (!blob) throw new Error('Could not process that image.')
  return blob
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Stores an image and returns a URL usable in an <img> tag: a public Supabase
 * Storage URL when connected, a data URL when not.
 */
export async function storeImage(
  file: File,
  path: string,
  maxEdge: number
): Promise<string> {
  const blob = await downscaleImage(file, maxEdge)
  if (isConnected()) return uploadPhoto(path, blob)
  return blobToDataUrl(blob)
}
