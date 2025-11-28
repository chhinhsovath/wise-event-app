import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { CameraView, Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CheckInsService, SessionsService } from '@/services';

/**
 * QR Code Scanner Screen
 * Scans session QR codes for check-in
 */
export default function QRScanner() {
  const router = useRouter();
  const { user } = useUser();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);

    try {
      // Parse QR code data
      const qrData = CheckInsService.parseQRData(data);

      if (!qrData) {
        Alert.alert('Invalid QR Code', 'This QR code is not valid for session check-in.');
        resetScanner();
        return;
      }

      // Check if session exists
      const session = await SessionsService.getSessionById(qrData.sessionId);

      if (!session) {
        Alert.alert('Session Not Found', 'The session for this QR code could not be found.');
        resetScanner();
        return;
      }

      if (!user) {
        Alert.alert('Not Authenticated', 'Please sign in to check in to sessions.');
        resetScanner();
        return;
      }

      // Check in user
      const checkIn = await CheckInsService.checkIn(
        user.id,
        qrData.sessionId,
        'qr'
      );

      // Show success
      Alert.alert(
        'Check-in Successful! ✅',
        `You've checked in to "${session.title}"`,
        [
          {
            text: 'View Session',
            onPress: () => router.push(`/(app)/session/${session.$id}` as any),
          },
          {
            text: 'Scan Another',
            onPress: resetScanner,
          },
        ]
      );
    } catch (error: any) {
      console.error('Check-in error:', error);

      if (error.message?.includes('Already checked in')) {
        Alert.alert(
          'Already Checked In',
          'You are already checked in to this session.',
          [{ text: 'OK', onPress: resetScanner }]
        );
      } else {
        Alert.alert(
          'Check-in Failed',
          'Could not complete check-in. Please try again.',
          [{ text: 'OK', onPress: resetScanner }]
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setProcessing(false);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="camera" size={64} color="#d1d5db" />
          <Text className="text-lg text-gray-600 mt-4">Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="camera-off" size={64} color="#ef4444" />
          <Text className="text-lg font-semibold text-gray-900 mt-4">Camera Access Denied</Text>
          <Text className="text-sm text-gray-600 mt-2 text-center">
            Please enable camera access in your device settings to scan QR codes.
          </Text>
          <Button
            mode="contained"
            onPress={requestCameraPermission}
            className="mt-4"
            icon="camera"
          >
            Request Permission
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            className="mt-2"
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">Scan QR Code</Text>
            <Text className="text-sm text-gray-300">Point at session QR code</Text>
          </View>
        </View>
      </View>

      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Scanning Frame */}
        <View style={styles.container}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {processing && (
              <View style={styles.processingOverlay}>
                <MaterialCommunityIcons name="loading" size={48} color="#fff" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Card style={styles.instructionsCard}>
              <Card.Content>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="qrcode-scan" size={32} color="#6366f1" />
                  <View className="ml-3 flex-1">
                    <Text className="font-semibold">How to Check In</Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      1. Find the QR code at the session entrance
                    </Text>
                    <Text className="text-sm text-gray-600">
                      2. Point your camera at the QR code
                    </Text>
                    <Text className="text-sm text-gray-600">
                      3. Wait for automatic scan and check-in
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        </View>
      </CameraView>

      {/* Reset Button (shown when scanned) */}
      {scanned && !processing && (
        <View style={styles.resetContainer}>
          <Button
            mode="contained"
            onPress={resetScanner}
            icon="restart"
            style={styles.resetButton}
          >
            Scan Another
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  resetContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  resetButton: {
    backgroundColor: '#6366f1',
  },
});
