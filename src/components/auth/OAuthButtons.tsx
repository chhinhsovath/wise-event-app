import React, { useState } from 'react'
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { authService } from '@/services/auth'
import * as WebBrowser from 'expo-web-browser'

// Complete the auth session on redirect
WebBrowser.maybeCompleteAuthSession()

export function OAuthButtons() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleOAuth = async (provider: 'google' | 'apple' | 'linkedin' | 'facebook') => {
    setLoading(provider)
    setError('')

    try {
      switch (provider) {
        case 'google':
          await authService.signInWithGoogle()
          break
        case 'apple':
          await authService.signInWithApple()
          break
        case 'linkedin':
          await authService.signInWithLinkedIn()
          break
        case 'facebook':
          await authService.signInWithFacebook()
          break
      }
    } catch (err: any) {
      setError(err.message || `${provider} authentication failed`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.divider}>Or continue with</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.oauthButton, loading === 'google' && styles.buttonDisabled]}
        onPress={() => handleOAuth('google')}
        disabled={loading !== null}
      >
        {loading === 'google' ? (
          <ActivityIndicator color="#4285F4" />
        ) : (
          <Text style={styles.oauthButtonText}>Continue with Google</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.oauthButton, loading === 'apple' && styles.buttonDisabled]}
        onPress={() => handleOAuth('apple')}
        disabled={loading !== null}
      >
        {loading === 'apple' ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.oauthButtonText}>Continue with Apple</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.oauthButton, loading === 'linkedin' && styles.buttonDisabled]}
        onPress={() => handleOAuth('linkedin')}
        disabled={loading !== null}
      >
        {loading === 'linkedin' ? (
          <ActivityIndicator color="#0077B5" />
        ) : (
          <Text style={styles.oauthButtonText}>Continue with LinkedIn</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.oauthButton, loading === 'facebook' && styles.buttonDisabled]}
        onPress={() => handleOAuth('facebook')}
        disabled={loading !== null}
      >
        {loading === 'facebook' ? (
          <ActivityIndicator color="#1877F2" />
        ) : (
          <Text style={styles.oauthButtonText}>Continue with Facebook</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  divider: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  oauthButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    textAlign: 'center',
  },
})
