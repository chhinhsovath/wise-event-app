import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, RadioButton, Checkbox, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PollsService } from '@/services';
import { Poll, PollOption } from '@/types';
import { mockSessions } from '@/lib/mockData';
import { useRealtimePolls } from '@/hooks/useRealtimeCollection';

/**
 * Session Polls Screen
 * View and participate in session polls
 */
export default function SessionPolls() {
  const router = useRouter();
  const { user } = useUser();
  const { id: sessionId } = useLocalSearchParams<{ id: string }>();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const session = mockSessions.find((s) => s.$id === sessionId);

  useEffect(() => {
    loadPolls();
  }, []);

  // Realtime updates for polls
  useRealtimePolls(
    sessionId || '',
    (payload) => {
      console.log('[Polls] Realtime update:', payload);
      // Reload polls when any poll is created, updated, or deleted
      loadPolls();
    },
    !!sessionId // Only enable if sessionId exists
  );

  const loadPolls = async () => {
    try {
      setLoading(true);
      if (sessionId) {
        const sessionPolls = await PollsService.getSessionPolls(sessionId);
        setPolls(sessionPolls);

        // Check which polls user has voted on
        if (user) {
          const voted = new Set<string>();
          for (const poll of sessionPolls) {
            const hasVoted = await PollsService.hasUserVoted(poll.$id, user.id);
            if (hasVoted) {
              voted.add(poll.$id);
            }
          }
          setVotedPolls(voted);
        }
      }
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPolls();
  };

  const handleOptionSelect = (pollId: string, optionId: string, allowMultiple: boolean) => {
    setSelectedOptions((prev) => {
      if (allowMultiple) {
        const current = prev[pollId] || [];
        const updated = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [pollId]: updated };
      } else {
        return { ...prev, [pollId]: [optionId] };
      }
    });
  };

  const handleSubmitVote = async (pollId: string) => {
    if (!user) return;

    const options = selectedOptions[pollId];
    if (!options || options.length === 0) {
      alert('Please select at least one option');
      return;
    }

    try {
      await PollsService.submitVote(pollId, user.id, options);
      setVotedPolls((prev) => new Set([...prev, pollId]));
      loadPolls(); // Refresh to show updated results
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      alert(error.message || 'Failed to submit vote');
    }
  };

  const calculatePercentage = (votes: number, total: number): number => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: '#10b981',
      closed: '#6b7280',
      draft: '#f59e0b',
    };
    return colors[status] || '#6b7280';
  };

  const activePolls = polls.filter((p) => p.status === 'active');
  const closedPolls = polls.filter((p) => p.status === 'closed');

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold">Session Polls</Text>
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {session?.title || 'Session'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View className="items-center justify-center p-8">
            <MaterialCommunityIcons name="loading" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">Loading polls...</Text>
          </View>
        ) : polls.length === 0 ? (
          <View className="items-center justify-center p-8">
            <MaterialCommunityIcons name="poll" size={64} color="#d1d5db" />
            <Text className="text-lg text-gray-600 mt-4">No Polls Yet</Text>
            <Text className="text-sm text-gray-500 mt-2 text-center">
              The speaker will create polls during the session
            </Text>
          </View>
        ) : (
          <>
            {/* Active Polls */}
            {activePolls.length > 0 && (
              <View className="p-4">
                <Text className="text-lg font-bold mb-3">Active Polls</Text>

                {activePolls.map((poll) => {
                  const hasVoted = votedPolls.has(poll.$id);
                  const selected = selectedOptions[poll.$id] || [];

                  return (
                    <Card key={poll.$id} className="mb-4">
                      <Card.Content>
                        {/* Poll Header */}
                        <View className="flex-row items-start justify-between mb-3">
                          <Text className="text-base font-semibold flex-1 mr-2">
                            {poll.question}
                          </Text>
                          <Chip
                            mode="flat"
                            compact
                            textStyle={{ fontSize: 10, color: '#10b981' }}
                            style={{ height: 20, backgroundColor: '#d1fae5' }}
                          >
                            Active
                          </Chip>
                        </View>

                        {/* Options */}
                        {hasVoted || poll.showResults ? (
                          // Show results
                          <View className="gap-3 mb-3">
                            {poll.options.map((option) => {
                              const percentage = calculatePercentage(option.votes, poll.totalVotes);

                              return (
                                <View key={option.id}>
                                  <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-sm font-medium">{option.text}</Text>
                                    <Text className="text-sm text-gray-600">
                                      {percentage}% ({option.votes})
                                    </Text>
                                  </View>
                                  <ProgressBar
                                    progress={percentage / 100}
                                    color="#6366f1"
                                    style={{ height: 8, borderRadius: 4 }}
                                  />
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          // Show voting options
                          <View className="gap-2 mb-3">
                            {poll.options.map((option) => (
                              <Pressable
                                key={option.id}
                                onPress={() => handleOptionSelect(poll.$id, option.id, poll.allowMultiple)}
                                className="flex-row items-center p-3 bg-gray-50 rounded-lg"
                              >
                                {poll.allowMultiple ? (
                                  <Checkbox
                                    status={selected.includes(option.id) ? 'checked' : 'unchecked'}
                                    onPress={() => handleOptionSelect(poll.$id, option.id, poll.allowMultiple)}
                                  />
                                ) : (
                                  <RadioButton
                                    value={option.id}
                                    status={selected.includes(option.id) ? 'checked' : 'unchecked'}
                                    onPress={() => handleOptionSelect(poll.$id, option.id, poll.allowMultiple)}
                                  />
                                )}
                                <Text className="ml-2 flex-1">{option.text}</Text>
                              </Pressable>
                            ))}
                          </View>
                        )}

                        {/* Footer */}
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <MaterialCommunityIcons name="account-group" size={14} color="#6b7280" />
                            <Text className="text-xs text-gray-600 ml-1">
                              {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
                            </Text>
                            {poll.allowMultiple && (
                              <>
                                <Text className="text-xs text-gray-400 mx-2">•</Text>
                                <Text className="text-xs text-gray-600">Multiple choice</Text>
                              </>
                            )}
                          </View>

                          {!hasVoted && (
                            <Button
                              mode="contained"
                              onPress={() => handleSubmitVote(poll.$id)}
                              compact
                              disabled={!selected || selected.length === 0}
                            >
                              Submit
                            </Button>
                          )}

                          {hasVoted && (
                            <Chip
                              mode="flat"
                              compact
                              icon="check"
                              textStyle={{ fontSize: 10 }}
                              style={{ height: 20, backgroundColor: '#dbeafe' }}
                            >
                              Voted
                            </Chip>
                          )}
                        </View>
                      </Card.Content>
                    </Card>
                  );
                })}
              </View>
            )}

            {/* Closed Polls */}
            {closedPolls.length > 0 && (
              <View className="px-4 pb-4">
                <Text className="text-lg font-bold mb-3">Closed Polls</Text>

                {closedPolls.map((poll) => (
                  <Card key={poll.$id} className="mb-4 opacity-75">
                    <Card.Content>
                      <View className="flex-row items-start justify-between mb-3">
                        <Text className="text-base font-semibold flex-1 mr-2">
                          {poll.question}
                        </Text>
                        <Chip
                          mode="flat"
                          compact
                          textStyle={{ fontSize: 10, color: '#6b7280' }}
                          style={{ height: 20, backgroundColor: '#f3f4f6' }}
                        >
                          Closed
                        </Chip>
                      </View>

                      <View className="gap-3 mb-3">
                        {poll.options.map((option) => {
                          const percentage = calculatePercentage(option.votes, poll.totalVotes);

                          return (
                            <View key={option.id}>
                              <View className="flex-row items-center justify-between mb-1">
                                <Text className="text-sm font-medium">{option.text}</Text>
                                <Text className="text-sm text-gray-600">
                                  {percentage}% ({option.votes})
                                </Text>
                              </View>
                              <ProgressBar
                                progress={percentage / 100}
                                color="#9ca3af"
                                style={{ height: 8, borderRadius: 4 }}
                              />
                            </View>
                          );
                        })}
                      </View>

                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="account-group" size={14} color="#6b7280" />
                        <Text className="text-xs text-gray-600 ml-1">
                          {poll.totalVotes} total vote{poll.totalVotes !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
