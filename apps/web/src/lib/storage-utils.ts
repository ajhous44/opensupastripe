import { createClient } from '@/lib/supabase-browser'

const ORGANIZATION_ASSETS_BUCKET = 'organization-assets'

export interface UploadImageResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload organization asset (logo, hero, etc.)
 * Path: {organizationId}/{assetType}.{ext}
 */
export async function uploadOrganizationAsset({
  organizationId,
  file,
  assetType,
}: {
  organizationId: string
  file: File
  assetType: 'logo' | 'hero' | 'about'
}): Promise<UploadImageResult> {
  try {
    const supabase = createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${organizationId}/${assetType}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(ORGANIZATION_ASSETS_BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      return {
        success: false,
        error: `Failed to upload ${assetType}: ${uploadError.message}`,
      }
    }

    const { data: urlData } = supabase.storage
      .from(ORGANIZATION_ASSETS_BUCKET)
      .getPublicUrl(fileName)

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: `Failed to get public URL for ${assetType}`,
      }
    }

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/** Delete image from Supabase storage by public URL. */
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const urlObject = new URL(imageUrl)
    const pathParts = urlObject.pathname.split('/')

    let bucket = ''
    let filePath = ''

    if (urlObject.pathname.includes('/storage/v1/object/public/')) {
      const publicIndex = pathParts.indexOf('public')
      if (publicIndex >= 0 && publicIndex + 1 < pathParts.length) {
        bucket = pathParts[publicIndex + 1]
        filePath = pathParts.slice(publicIndex + 2).join('/')
      }
    }

    if (!bucket || !filePath) {
      return {
        success: false,
        error: 'Could not extract bucket and file path from URL',
      }
    }

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      return {
        success: false,
        error: `Failed to delete image: ${error.message}`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export function getOrganizationAssetPath(
  organizationId: string,
  assetType: 'logo' | 'hero' | 'about'
): string {
  return `${organizationId}/${assetType}`
}
