import { useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { format } from 'date-fns';

/**
 * Chat/Messaging Screen
 * One-on-one messaging with another attendee
 * TODO: Implement real-time messaging with Appwrite
 */

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export default function Chat() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: 'other-user',
      content: 'Hi! Great to connect with you at WISE 2024!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      senderId: user?.id || 'current-user',
      content: 'Thanks! Looking forward to the AI in Education session.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || 'current-user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [newMessage, ...prev]);
    setMessage('');

    // TODO: Send to Appwrite
    console.log('[Chat] Sending message:', newMessage);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === user?.id || item.senderId === 'current-user';
    const messageTime = format(new Date(item.timestamp), 'h:mm a');

    return (
      <View
        className={`mb-3 px-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}
      >
        <View
          className={`max-w-[80%] px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-primary-500 rounded-br-sm'
              : 'bg-gray-200 rounded-bl-sm'
          }`}
        >
          <Text
            className={`text-base ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}
          >
            {item.content}
          </Text>
        </View>
        <Text className="text-xs text-gray-500 mt-1">{messageTime}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Chat',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Message Input */}
        <View className="flex-row items-center px-4 py-3 border-t border-gray-200 bg-white">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            mode="outlined"
            multiline
            maxLength={500}
            className="flex-1 mr-2"
            style={{ maxHeight: 100 }}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <IconButton
            icon="send"
            mode="contained"
            size={24}
            onPress={handleSend}
            disabled={!message.trim()}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Info Banner */}
      <View className="absolute bottom-20 left-0 right-0 px-4">
        <View className="bg-blue-50 p-3 rounded-lg">
          <Text className="text-sm text-blue-800 text-center">
            💡 This is a demo chat. Real-time messaging will be enabled when connected to Appwrite.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
