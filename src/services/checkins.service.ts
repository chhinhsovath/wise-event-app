import { databases } from './appwrite';
import { Query } from 'react-native-appwrite';
import { CheckIn } from '@/types';

/**
 * Check-ins Service
 * Manages session attendance and check-in/check-out operations
 */
export class CheckInsService {
  private static dbId = 'main';
  private static collectionId = 'checkins';

  /**
   * Check in to a session
   */
  static async checkIn(
    userId: string,
    sessionId: string,
    method: 'qr' | 'nfc' | 'geofence' | 'manual' = 'qr',
    location?: { latitude: number; longitude: number }
  ): Promise<CheckIn> {
    try {
      // Check if already checked in
      const existing = await this.getActiveCheckIn(userId, sessionId);
      if (existing) {
        console.log('[CheckInsService] Already checked in to this session');
        return existing;
      }

      const response = await databases.createDocument(
        this.dbId,
        this.collectionId,
        'unique()',
        {
          userId,
          sessionId,
          checkInTime: new Date().toISOString(),
          method,
          location: location || null,
        }
      );

      return response as unknown as CheckIn;
    } catch (error) {
      console.error('[CheckInsService] Error checking in:', error);
      throw error;
    }
  }

  /**
   * Check out from a session
   */
  static async checkOut(checkInId: string): Promise<CheckIn> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        checkInId,
        {
          checkOutTime: new Date().toISOString(),
        }
      );

      return response as unknown as CheckIn;
    } catch (error) {
      console.error('[CheckInsService] Error checking out:', error);
      throw error;
    }
  }

  /**
   * Get active check-in for a user in a session
   */
  static async getActiveCheckIn(
    userId: string,
    sessionId: string
  ): Promise<CheckIn | null> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('userId', userId),
          Query.equal('sessionId', sessionId),
          Query.isNull('checkOutTime'),
          Query.limit(1),
        ]
      );

      return response.documents.length > 0
        ? (response.documents[0] as unknown as CheckIn)
        : null;
    } catch (error) {
      console.error('[CheckInsService] Error getting active check-in:', error);
      return null;
    }
  }

  /**
   * Get all check-ins for a user
   */
  static async getUserCheckIns(
    userId: string,
    limit: number = 100
  ): Promise<CheckIn[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('checkInTime'),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as CheckIn[];
    } catch (error) {
      console.error('[CheckInsService] Error getting user check-ins:', error);
      throw error;
    }
  }

  /**
   * Get all check-ins for a session
   */
  static async getSessionCheckIns(sessionId: string): Promise<CheckIn[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('sessionId', sessionId),
          Query.orderDesc('checkInTime'),
          Query.limit(1000),
        ]
      );

      return response.documents as unknown as CheckIn[];
    } catch (error) {
      console.error('[CheckInsService] Error getting session check-ins:', error);
      throw error;
    }
  }

  /**
   * Get attendance count for a session
   */
  static async getSessionAttendanceCount(sessionId: string): Promise<number> {
    try {
      const checkIns = await this.getSessionCheckIns(sessionId);
      // Count unique users
      const uniqueUsers = new Set(checkIns.map((c) => c.userId));
      return uniqueUsers.size;
    } catch (error) {
      console.error('[CheckInsService] Error getting attendance count:', error);
      return 0;
    }
  }

  /**
   * Check if user is checked in to a session
   */
  static async isCheckedIn(
    userId: string,
    sessionId: string
  ): Promise<boolean> {
    const checkIn = await this.getActiveCheckIn(userId, sessionId);
    return checkIn !== null;
  }

  /**
   * Get user's attendance history
   */
  static async getAttendanceHistory(
    userId: string,
    limit: number = 50
  ): Promise<CheckIn[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('userId', userId),
          Query.isNotNull('checkOutTime'), // Only completed check-ins
          Query.orderDesc('checkInTime'),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as CheckIn[];
    } catch (error) {
      console.error('[CheckInsService] Error getting attendance history:', error);
      throw error;
    }
  }

  /**
   * Get total attendance count for a user
   */
  static async getUserTotalAttendance(userId: string): Promise<number> {
    try {
      const checkIns = await this.getUserCheckIns(userId, 1000);
      // Count unique sessions attended
      const uniqueSessions = new Set(
        checkIns.filter((c) => c.checkOutTime).map((c) => c.sessionId)
      );
      return uniqueSessions.size;
    } catch (error) {
      console.error('[CheckInsService] Error getting total attendance:', error);
      return 0;
    }
  }

  /**
   * Calculate session duration for a check-in
   */
  static calculateDuration(checkIn: CheckIn): number {
    if (!checkIn.checkOutTime) return 0;

    const checkInTime = new Date(checkIn.checkInTime).getTime();
    const checkOutTime = new Date(checkIn.checkOutTime).getTime();

    return Math.floor((checkOutTime - checkInTime) / 60000); // Duration in minutes
  }

  /**
   * Get check-ins by method
   */
  static async getCheckInsByMethod(
    sessionId: string,
    method: 'qr' | 'nfc' | 'geofence' | 'manual'
  ): Promise<CheckIn[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('sessionId', sessionId),
          Query.equal('method', method),
          Query.orderDesc('checkInTime'),
          Query.limit(1000),
        ]
      );

      return response.documents as unknown as CheckIn[];
    } catch (error) {
      console.error('[CheckInsService] Error getting check-ins by method:', error);
      throw error;
    }
  }

  /**
   * Delete a check-in (admin only)
   */
  static async deleteCheckIn(checkInId: string): Promise<void> {
    try {
      await databases.deleteDocument(this.dbId, this.collectionId, checkInId);
    } catch (error) {
      console.error('[CheckInsService] Error deleting check-in:', error);
      throw error;
    }
  }

  /**
   * Generate QR code data for session check-in
   */
  static generateQRData(sessionId: string, eventId?: string): string {
    return JSON.stringify({
      type: 'session_checkin',
      sessionId,
      eventId: eventId || 'event-1',
      timestamp: Date.now(),
    });
  }

  /**
   * Parse QR code data
   */
  static parseQRData(qrData: string): {
    type: string;
    sessionId: string;
    eventId?: string;
    timestamp?: number;
  } | null {
    try {
      const data = JSON.parse(qrData);
      if (data.type === 'session_checkin' && data.sessionId) {
        return data;
      }
      return null;
    } catch (error) {
      console.error('[CheckInsService] Invalid QR code data:', error);
      return null;
    }
  }
}
