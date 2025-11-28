import { ID, Models } from 'react-native-appwrite'
import { account } from './appwrite'

export const authService = {
  /**
   * Email/Password Authentication
   */
  async signUp(email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> {
    try {
      // Create user account
      const user = await account.create(ID.unique(), email, password, name)

      // Automatically sign in after registration
      await account.createEmailPasswordSession(email, password)

      return user
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  },

  async signIn(email: string, password: string): Promise<Models.Session> {
    try {
      return await account.createEmailPasswordSession(email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  async signOut(): Promise<void> {
    try {
      await account.deleteSession('current')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  /**
   * OAuth Authentication
   */
  async signInWithGoogle(): Promise<void> {
    try {
      await account.createOAuth2Session(
        'google',
        'wise-event-app://oauth-callback',
        'wise-event-app://oauth-callback'
      )
    } catch (error) {
      console.error('Google auth error:', error)
      throw error
    }
  },

  async signInWithApple(): Promise<void> {
    try {
      await account.createOAuth2Session(
        'apple',
        'wise-event-app://oauth-callback',
        'wise-event-app://oauth-callback'
      )
    } catch (error) {
      console.error('Apple auth error:', error)
      throw error
    }
  },

  async signInWithLinkedIn(): Promise<void> {
    try {
      await account.createOAuth2Session(
        'linkedin',
        'wise-event-app://oauth-callback',
        'wise-event-app://oauth-callback'
      )
    } catch (error) {
      console.error('LinkedIn auth error:', error)
      throw error
    }
  },

  async signInWithFacebook(): Promise<void> {
    try {
      await account.createOAuth2Session(
        'facebook',
        'wise-event-app://oauth-callback',
        'wise-event-app://oauth-callback'
      )
    } catch (error) {
      console.error('Facebook auth error:', error)
      throw error
    }
  },

  /**
   * Magic URL (Passwordless) Authentication
   */
  async sendMagicLink(email: string): Promise<Models.Token> {
    try {
      return await account.createMagicURLToken(
        ID.unique(),
        email,
        'wise-event-app://magic-link'
      )
    } catch (error) {
      console.error('Send magic link error:', error)
      throw error
    }
  },

  async confirmMagicLink(userId: string, secret: string): Promise<Models.Session> {
    try {
      return await account.createSession(userId, secret)
    } catch (error) {
      console.error('Confirm magic link error:', error)
      throw error
    }
  },

  /**
   * Phone Authentication
   */
  async sendPhoneOTP(phone: string): Promise<Models.Token> {
    try {
      return await account.createPhoneToken(ID.unique(), phone)
    } catch (error) {
      console.error('Send phone OTP error:', error)
      throw error
    }
  },

  async confirmPhoneOTP(userId: string, secret: string): Promise<Models.Session> {
    try {
      return await account.createSession(userId, secret)
    } catch (error) {
      console.error('Confirm phone OTP error:', error)
      throw error
    }
  },

  /**
   * User Management
   */
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await account.get()
    } catch (error) {
      // User not authenticated
      return null
    }
  },

  async updateName(name: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updateName(name)
    } catch (error) {
      console.error('Update name error:', error)
      throw error
    }
  },

  async updateEmail(email: string, password: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updateEmail(email, password)
    } catch (error) {
      console.error('Update email error:', error)
      throw error
    }
  },

  async updatePassword(password: string, oldPassword: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updatePassword(password, oldPassword)
    } catch (error) {
      console.error('Update password error:', error)
      throw error
    }
  },

  /**
   * Password Recovery
   */
  async sendPasswordRecovery(email: string): Promise<Models.Token> {
    try {
      return await account.createRecovery(
        email,
        'wise-event-app://reset-password'
      )
    } catch (error) {
      console.error('Send password recovery error:', error)
      throw error
    }
  },

  async confirmPasswordRecovery(
    userId: string,
    secret: string,
    password: string
  ): Promise<Models.Token> {
    try {
      return await account.updateRecovery(userId, secret, password)
    } catch (error) {
      console.error('Confirm password recovery error:', error)
      throw error
    }
  },

  /**
   * Email Verification
   */
  async sendEmailVerification(): Promise<Models.Token> {
    try {
      return await account.createVerification('wise-event-app://verify-email')
    } catch (error) {
      console.error('Send email verification error:', error)
      throw error
    }
  },

  async confirmEmailVerification(userId: string, secret: string): Promise<Models.Token> {
    try {
      return await account.updateVerification(userId, secret)
    } catch (error) {
      console.error('Confirm email verification error:', error)
      throw error
    }
  },

  /**
   * Session Management
   */
  async getSessions(): Promise<Models.SessionList> {
    try {
      return await account.listSessions()
    } catch (error) {
      console.error('Get sessions error:', error)
      throw error
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await account.deleteSession(sessionId)
    } catch (error) {
      console.error('Delete session error:', error)
      throw error
    }
  },

  async deleteSessions(): Promise<void> {
    try {
      await account.deleteSessions()
    } catch (error) {
      console.error('Delete sessions error:', error)
      throw error
    }
  },

  /**
   * Preferences
   */
  async getPreferences(): Promise<Models.Preferences> {
    try {
      return await account.getPrefs()
    } catch (error) {
      console.error('Get preferences error:', error)
      throw error
    }
  },

  async updatePreferences(prefs: object): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updatePrefs(prefs)
    } catch (error) {
      console.error('Update preferences error:', error)
      throw error
    }
  },
}

export default authService
