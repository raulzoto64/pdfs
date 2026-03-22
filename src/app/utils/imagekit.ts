import { auth } from './supabase'

// ImageKit configuration
const imageKitConfigs = {
  avatar: {
    publicKey: 'public_Et8QkoYluHINxWKh3aTIOB0b464=',
    privateKey: 'private_n+77Uw3D8PATiLls8b3tA8JrH+k=',
    folder: '/perfiles/avatares'
  },
  banner: {
    publicKey: 'public_LMAf2QROhvzzt89GcZrQQLp1ydI=',
    privateKey: 'private_KHCQyprWox4wBQO/T0lfRn2xMSE=',
    folder: '/perfiles/banners'
  },
  product: {
    publicKey: 'public_LMAf2QROhvzzt89GcZrQQLp1ydI=',
    privateKey: 'private_KHCQyprWox4wBQO/T0lfRn2xMSE=',
    folder: '/productos/imagenes'
  }
}

export const uploadImage = async (file: File, type: 'avatar' | 'banner' | 'product', userId: string): Promise<string> => {
  const config = imageKitConfigs[type]
  
  // Generate unique filename
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const fileName = `${type}_user_${userId}_${timestamp}_${random}.webp`
  
  // Create FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileName', fileName)
  formData.append('useUniqueFileName', 'false')
  formData.append('overwriteFile', 'true')
  formData.append('folder', config.folder)
  
  // Create Basic Auth header
  const authHeader = 'Basic ' + btoa(config.privateKey + ':')
  
  try {
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`ImageKit upload failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (result.url) {
      return result.url
    } else {
      throw new Error('No URL returned from ImageKit')
    }
  } catch (error) {
    console.error('Error uploading image to ImageKit:', error)
    throw error
  }
}

export const deleteImage = async (imageUrl: string, type: 'avatar' | 'banner' | 'product'): Promise<void> => {
  const config = imageKitConfigs[type]
  
  // Extract file ID from URL
  const fileId = imageUrl.split('/').pop()?.split('?')[0]
  
  if (!fileId) {
    throw new Error('Invalid ImageKit URL')
  }
  
  const authHeader = 'Basic ' + btoa(config.privateKey + ':')
  
  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`ImageKit delete failed: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting image from ImageKit:', error)
    throw error
  }
}

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string> => {
  const user = await auth.getCurrentUser()
  if (!user) {
    throw new Error('No authenticated user')
  }
  return user.id
}