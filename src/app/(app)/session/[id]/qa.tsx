import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, RefreshControl, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Button, Chip, SegmentedButtons, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QuestionsService } from '@/services';
import { Question } from '@/types';
import { mockSessions, mockAttendees } from '@/lib/mockData';
import { useRealtimeQuestions } from '@/hooks/useRealtimeCollection';

/**
 * Session Q&A Screen
 * Submit and view questions with upvoting
 */
export default function SessionQA() {
  const router = useRouter();
  const { user } = useAuth();
  const { id: sessionId } = useLocalSearchParams<{ id: string }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [questionText, setQuestionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const session = mockSessions.find((s) => s.$id === sessionId);

  useEffect(() => {
    loadQuestions();
  }, [filter]);

  // Realtime updates for questions
  useRealtimeQuestions(
    sessionId || '',
    (payload) => {
      console.log('[Q&A] Realtime update:', payload);
      // Reload questions when any question is created, updated, or deleted
      loadQuestions();
    },
    !!sessionId // Only enable if sessionId exists
  );

  const loadQuestions = async () => {
    try {
      setLoading(true);
      if (sessionId) {
        const allQuestions = await QuestionsService.getSessionQuestions(sessionId, 'approved');

        // Filter based on answered status
        let filtered = allQuestions;
        if (filter === 'answered') {
          filtered = allQuestions.filter((q) => q.isAnswered);
        } else if (filter === 'unanswered') {
          filtered = allQuestions.filter((q) => !q.isAnswered);
        }

        setQuestions(filtered);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadQuestions();
  };

  const handleSubmitQuestion = async () => {
    if (!user || !questionText.trim()) return;

    try {
      setSubmitting(true);
      await QuestionsService.submitQuestion(sessionId!, user.id, questionText.trim());
      setQuestionText('');
      alert('Question submitted! It will appear after moderator approval.');
      loadQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: string) => {
    if (!user) return;

    try {
      await QuestionsService.toggleUpvote(questionId, user.id);
      loadQuestions();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const hasUserUpvoted = (question: Question): boolean => {
    return user ? question.upvotedBy.includes(user.id) : false;
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const unansweredCount = questions.filter((q) => !q.isAnswered).length;
  const answeredCount = questions.filter((q) => q.isAnswered).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold">Q&A</Text>
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {session?.title || 'Session'}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Question Input */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-start gap-2">
            <View className="flex-1">
              <TextInput
                className="bg-gray-50 rounded-lg px-3 py-2 min-h-[44px] max-h-[100px]"
                placeholder="Ask a question..."
                value={questionText}
                onChangeText={setQuestionText}
                multiline
                maxLength={500}
              />
              <Text className="text-xs text-gray-500 mt-1 text-right">
                {questionText.length}/500
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={handleSubmitQuestion}
              disabled={!questionText.trim() || submitting}
              loading={submitting}
              compact
            >
              Submit
            </Button>
          </View>
        </View>

        {/* Filter */}
        <View className="px-4 py-3 bg-white border-b border-gray-200">
          <SegmentedButtons
            value={filter}
            onValueChange={(value) => setFilter(value as typeof filter)}
            buttons={[
              { value: 'all', label: `All (${questions.length})` },
              { value: 'unanswered', label: `Unanswered (${unansweredCount})` },
              { value: 'answered', label: `Answered (${answeredCount})` },
            ]}
            density="small"
          />
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {loading ? (
            <View className="items-center justify-center p-8">
              <MaterialCommunityIcons name="loading" size={48} color="#d1d5db" />
              <Text className="text-gray-500 mt-4">Loading questions...</Text>
            </View>
          ) : questions.length === 0 ? (
            <View className="items-center justify-center p-8">
              <MaterialCommunityIcons name="comment-question-outline" size={64} color="#d1d5db" />
              <Text className="text-lg text-gray-600 mt-4">No Questions Yet</Text>
              <Text className="text-sm text-gray-500 mt-2 text-center">
                Be the first to ask a question!
              </Text>
            </View>
          ) : (
            <View className="p-4 gap-3">
              {questions.map((question) => {
                const isUpvoted = hasUserUpvoted(question);
                const asker = mockAttendees.find((a) => a.id === question.userId);

                return (
                  <Card key={question.$id}>
                    <Card.Content>
                      {/* Question Header */}
                      <View className="flex-row items-start mb-3">
                        <Pressable
                          onPress={() => handleUpvote(question.$id)}
                          className="items-center mr-3"
                        >
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: isUpvoted ? '#dbeafe' : '#f3f4f6',
                            }}
                          >
                            <MaterialCommunityIcons
                              name={isUpvoted ? 'arrow-up-bold' : 'arrow-up'}
                              size={20}
                              color={isUpvoted ? '#3b82f6' : '#6b7280'}
                            />
                          </View>
                          <Text className={`text-sm font-semibold mt-1 ${isUpvoted ? 'text-primary' : 'text-gray-700'}`}>
                            {question.upvotes}
                          </Text>
                        </Pressable>

                        <View className="flex-1">
                          <Text className="text-base font-medium mb-2">
                            {question.content}
                          </Text>

                          <View className="flex-row items-center flex-wrap gap-2">
                            <Text className="text-xs text-gray-500">
                              {asker?.name || 'Anonymous'}
                            </Text>
                            <Text className="text-xs text-gray-400">•</Text>
                            <Text className="text-xs text-gray-500">
                              {formatTime(question.$createdAt)}
                            </Text>

                            {question.isAnswered && (
                              <>
                                <Text className="text-xs text-gray-400">•</Text>
                                <Chip
                                  mode="flat"
                                  compact
                                  icon="check"
                                  textStyle={{ fontSize: 10, color: '#10b981' }}
                                  style={{ height: 18, backgroundColor: '#d1fae5' }}
                                >
                                  Answered
                                </Chip>
                              </>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* Answer */}
                      {question.isAnswered && question.answer && (
                        <View className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="account-voice" size={16} color="#3b82f6" />
                            <Text className="text-sm font-semibold text-primary ml-1">
                              Speaker's Answer
                            </Text>
                          </View>
                          <Text className="text-sm text-gray-700">{question.answer}</Text>
                          {question.answeredAt && (
                            <Text className="text-xs text-gray-500 mt-2">
                              {formatTime(question.answeredAt)}
                            </Text>
                          )}
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          )}

          {/* Bottom Spacing */}
          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
