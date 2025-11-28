import { ID, Models } from 'react-native-appwrite'
import { storage } from './appwrite'

export const storageService = {
  /**
   * File operations
   */
  async uploadFile(
    bucketId: string,
    file: File,
    permissions?: string[],
    onProgress?: (progress: { $id: string; progress: number; sizeUploaded: number; chunksTotal: number; chunksUploaded: number }) => void
  ): Promise<Models.File> {
    try {
      return await storage.createFile(
        bucketId,
        ID.unique(),
        file,
        permissions,
        onProgress
      )
    } catch (error) {
      console.error('Upload file error:', error)
      throw error
    }
  },

  async getFile(bucketId: string, fileId: string): Promise<Models.File> {
    try {
      return await storage.getFile(bucketId, fileId)
    } catch (error) {
      console.error('Get file error:', error)
      throw error
    }
  },

  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await storage.deleteFile(bucketId, fileId)
    } catch (error) {
      console.error('Delete file error:', error)
      throw error
    }
  },

  async listFiles(bucketId: string, queries?: string[]): Promise<Models.FileList> {
    try {
      return await storage.listFiles(bucketId, queries)
    } catch (error) {
      console.error('List files error:', error)
      throw error
    }
  },

  /**
   * File preview/download URLs
   */
  getFileView(bucketId: string, fileId: string): string {
    return storage.getFileView(bucketId, fileId).toString()
  },

  getFileDownload(bucketId: string, fileId: string): string {
    return storage.getFileDownload(bucketId, fileId).toString()
  },

  getFilePreview(
    bucketId: string,
    fileId: string,
    width?: number,
    height?: number,
    gravity?: 'center' | 'top-left' | 'top' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right',
    quality?: number,
    borderWidth?: number,
    borderColor?: string,
    borderRadius?: number,
    opacity?: number,
    rotation?: number,
    background?: string,
    output?: 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp'
  ): string {
    return storage.getFilePreview(
      bucketId,
      fileId,
      width,
      height,
      gravity,
      quality,
      borderWidth,
      borderColor,
      borderRadius,
      opacity,
      rotation,
      background,
      output
    ).toString()
  },
}

export default storageService
