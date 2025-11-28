import { ID, Models, Query } from 'react-native-appwrite'
import { databases } from './appwrite'

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || ''

if (!DATABASE_ID) {
  throw new Error(
    'Missing Appwrite database ID. Please check your .env file.'
  )
}

export const databaseService = {
  /**
   * Generic document operations
   */
  async createDocument<T extends Models.Document>(
    collectionId: string,
    data: Omit<T, keyof Models.Document>,
    documentId?: string,
    permissions?: string[]
  ): Promise<T> {
    try {
      return await databases.createDocument<T>(
        DATABASE_ID,
        collectionId,
        documentId || ID.unique(),
        data,
        permissions
      )
    } catch (error) {
      console.error('Create document error:', error)
      throw error
    }
  },

  async getDocument<T extends Models.Document>(
    collectionId: string,
    documentId: string
  ): Promise<T> {
    try {
      return await databases.getDocument<T>(DATABASE_ID, collectionId, documentId)
    } catch (error) {
      console.error('Get document error:', error)
      throw error
    }
  },

  async updateDocument<T extends Models.Document>(
    collectionId: string,
    documentId: string,
    data: Partial<Omit<T, keyof Models.Document>>,
    permissions?: string[]
  ): Promise<T> {
    try {
      return await databases.updateDocument<T>(
        DATABASE_ID,
        collectionId,
        documentId,
        data,
        permissions
      )
    } catch (error) {
      console.error('Update document error:', error)
      throw error
    }
  },

  async deleteDocument(collectionId: string, documentId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, collectionId, documentId)
    } catch (error) {
      console.error('Delete document error:', error)
      throw error
    }
  },

  async listDocuments<T extends Models.Document>(
    collectionId: string,
    queries?: string[]
  ): Promise<Models.DocumentList<T>> {
    try {
      return await databases.listDocuments<T>(DATABASE_ID, collectionId, queries)
    } catch (error) {
      console.error('List documents error:', error)
      throw error
    }
  },

  /**
   * Helper query builders
   */
  buildQueries: {
    equal: (attribute: string, value: string | number | boolean) =>
      Query.equal(attribute, value),

    notEqual: (attribute: string, value: string | number | boolean) =>
      Query.notEqual(attribute, value),

    greaterThan: (attribute: string, value: string | number) =>
      Query.greaterThan(attribute, value),

    lessThan: (attribute: string, value: string | number) =>
      Query.lessThan(attribute, value),

    search: (attribute: string, value: string) =>
      Query.search(attribute, value),

    orderAsc: (attribute: string) => Query.orderAsc(attribute),

    orderDesc: (attribute: string) => Query.orderDesc(attribute),

    limit: (limit: number) => Query.limit(limit),

    offset: (offset: number) => Query.offset(offset),
  },
}

export default databaseService
