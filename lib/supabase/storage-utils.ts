/**
 * Extracts the file path from a Supabase Storage public URL.
 * URL format: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
 */
export function getStoragePathFromUrl(url: string, bucket: string = 'product-images') {
  try {
    const searchString = `/storage/v1/object/public/${bucket}/`
    const index = url.indexOf(searchString)
    if (index === -1) return null
    return url.substring(index + searchString.length)
  } catch (error) {
    return null
  }
}
