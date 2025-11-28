import { View, ScrollView, Image, Pressable, Linking } from 'react-native';
import { Text, Button, Card, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getSpeakerById, mockSessions } from '@/lib/mockData';
import { SessionCard } from '@/components/session/SessionCard';
import { useBookmarks } from '@/hooks/useBookmarks';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Speaker Details Screen
 * Shows speaker profile, bio, expertise, and their sessions
 */
export default function SpeakerDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  // Get speaker data
  const speaker = getSpeakerById(id);

  // Get sessions by this speaker
  const speakerSessions = mockSessions.filter(
    (session) => session.speakerIds && session.speakerIds.includes(id)
  );

  if (!speaker) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Speaker Not Found',
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg text-gray-600 text-center">
            Speaker not found
          </Text>
          <Button mode="contained" onPress={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleSocialLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn('[Speaker] Cannot open URL:', url);
      }
    } catch (error) {
      console.error('[Speaker] Error opening URL:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen
        options={{
          title: speaker.name,
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView>
        <View className="bg-white">
          {/* Speaker Header */}
          <View className="items-center p-6">
            {/* Speaker Photo */}
            {speaker.photo ? (
              <Image
                source={{ uri: speaker.photo }}
                className="w-32 h-32 rounded-full mb-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-primary-100 items-center justify-center mb-4">
                <Text className="text-4xl text-primary-600">
                  {speaker.name.charAt(0)}
                </Text>
              </View>
            )}

            {/* Name & Title */}
            <Text className="text-2xl font-bold text-center mb-1">
              {speaker.name}
            </Text>
            <Text className="text-base text-gray-600 text-center">
              {speaker.title}
            </Text>
            {speaker.organization && (
              <Text className="text-base text-gray-500 text-center mt-1">
                {speaker.organization}
              </Text>
            )}

            {/* Featured Badge */}
            {speaker.isFeatured && (
              <Chip icon="star" className="mt-3" mode="flat">
                Featured Speaker
              </Chip>
            )}
          </View>

          <Divider />

          {/* Bio Section */}
          {speaker.bio && (
            <View className="p-6">
              <Text className="text-lg font-bold mb-3">About</Text>
              <Text className="text-base text-gray-700 leading-6">
                {speaker.bio}
              </Text>
            </View>
          )}

          {/* Expertise Section */}
          {speaker.expertise && speaker.expertise.length > 0 && (
            <>
              <Divider />
              <View className="p-6">
                <Text className="text-lg font-bold mb-3">Expertise</Text>
                <View className="flex-row flex-wrap gap-2">
                  {speaker.expertise.map((skill, index) => (
                    <Chip key={index} mode="outlined" icon="lightbulb-outline">
                      {skill}
                    </Chip>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Social Links Section */}
          {speaker.socialLinks && Object.keys(speaker.socialLinks).length > 0 && (
            <>
              <Divider />
              <View className="p-6">
                <Text className="text-lg font-bold mb-3">Connect</Text>
                <View className="flex-row gap-3">
                  {speaker.socialLinks.twitter && (
                    <Pressable
                      onPress={() => handleSocialLink(speaker.socialLinks!.twitter!)}
                      className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
                    >
                      <MaterialCommunityIcons
                        name="twitter"
                        size={20}
                        color="#1DA1F2"
                      />
                      <Text className="ml-2 text-blue-600 font-medium">Twitter</Text>
                    </Pressable>
                  )}
                  {speaker.socialLinks.linkedin && (
                    <Pressable
                      onPress={() => handleSocialLink(speaker.socialLinks!.linkedin!)}
                      className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
                    >
                      <MaterialCommunityIcons
                        name="linkedin"
                        size={20}
                        color="#0A66C2"
                      />
                      <Text className="ml-2 text-blue-600 font-medium">LinkedIn</Text>
                    </Pressable>
                  )}
                  {speaker.socialLinks.website && (
                    <Pressable
                      onPress={() => handleSocialLink(speaker.socialLinks!.website!)}
                      className="flex-row items-center bg-gray-50 px-4 py-2 rounded-lg"
                    >
                      <MaterialCommunityIcons
                        name="web"
                        size={20}
                        color="#6b7280"
                      />
                      <Text className="ml-2 text-gray-600 font-medium">Website</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Sessions Section */}
        {speakerSessions.length > 0 && (
          <View className="p-6">
            <Text className="text-xl font-bold mb-4">
              Sessions ({speakerSessions.length})
            </Text>
            {speakerSessions.map((session) => (
              <SessionCard
                key={session.$id}
                session={session}
                onBookmark={toggleBookmark}
                isBookmarked={isBookmarked(session.$id)}
              />
            ))}
          </View>
        )}

        {/* Follow Feature (Future) */}
        <View className="p-6 pb-8">
          <Button
            mode="contained"
            icon="account-plus"
            onPress={() => {
              // TODO: Implement follow speaker functionality
              console.log('[Speaker] Follow speaker - Coming soon!');
            }}
          >
            Follow Speaker
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
