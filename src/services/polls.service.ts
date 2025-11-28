import { databases } from './appwrite';
import { Query } from 'react-native-appwrite';
import { Poll, PollVote, PollOption } from '@/types';

/**
 * Polls Service
 * Manages live polls and voting for sessions
 */
export class PollsService {
  private static dbId = 'main';
  private static pollsCollection = 'polls';
  private static votesCollection = 'poll_votes';

  /**
   * Create a new poll
   */
  static async createPoll(
    sessionId: string,
    createdBy: string,
    question: string,
    options: string[],
    allowMultiple: boolean = false,
    showResults: boolean = true
  ): Promise<Poll> {
    try {
      // Create poll options with initial vote count
      const pollOptions: PollOption[] = options.map((text, index) => ({
        id: `option-${index + 1}`,
        text,
        votes: 0,
      }));

      const response = await databases.createDocument(
        this.dbId,
        this.pollsCollection,
        'unique()',
        {
          sessionId,
          createdBy,
          question,
          options: pollOptions,
          status: 'draft',
          allowMultiple,
          showResults,
          totalVotes: 0,
        }
      );

      return response as unknown as Poll;
    } catch (error) {
      console.error('[PollsService] Error creating poll:', error);
      throw error;
    }
  }

  /**
   * Get all polls for a session
   */
  static async getSessionPolls(sessionId: string): Promise<Poll[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.pollsCollection,
        [
          Query.equal('sessionId', sessionId),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
      );

      return response.documents as unknown as Poll[];
    } catch (error) {
      console.error('[PollsService] Error getting session polls:', error);
      throw error;
    }
  }

  /**
   * Get active polls for a session
   */
  static async getActivePolls(sessionId: string): Promise<Poll[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.pollsCollection,
        [
          Query.equal('sessionId', sessionId),
          Query.equal('status', 'active'),
          Query.orderDesc('$createdAt'),
          Query.limit(50),
        ]
      );

      return response.documents as unknown as Poll[];
    } catch (error) {
      console.error('[PollsService] Error getting active polls:', error);
      throw error;
    }
  }

  /**
   * Get a single poll by ID
   */
  static async getPollById(pollId: string): Promise<Poll> {
    try {
      const response = await databases.getDocument(
        this.dbId,
        this.pollsCollection,
        pollId
      );

      return response as unknown as Poll;
    } catch (error) {
      console.error('[PollsService] Error getting poll:', error);
      throw error;
    }
  }

  /**
   * Update poll status
   */
  static async updatePollStatus(
    pollId: string,
    status: 'draft' | 'active' | 'closed'
  ): Promise<Poll> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.pollsCollection,
        pollId,
        { status }
      );

      return response as unknown as Poll;
    } catch (error) {
      console.error('[PollsService] Error updating poll status:', error);
      throw error;
    }
  }

  /**
   * Submit a vote
   */
  static async submitVote(
    pollId: string,
    userId: string,
    optionIds: string[]
  ): Promise<PollVote> {
    try {
      // Check if user already voted
      const existingVote = await this.getUserVote(pollId, userId);
      if (existingVote) {
        throw new Error('User has already voted on this poll');
      }

      // Create vote record
      const voteResponse = await databases.createDocument(
        this.dbId,
        this.votesCollection,
        'unique()',
        {
          pollId,
          userId,
          optionIds,
        }
      );

      // Update poll vote counts
      await this.updateVoteCounts(pollId);

      return voteResponse as unknown as PollVote;
    } catch (error) {
      console.error('[PollsService] Error submitting vote:', error);
      throw error;
    }
  }

  /**
   * Get user's vote for a poll
   */
  static async getUserVote(
    pollId: string,
    userId: string
  ): Promise<PollVote | null> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.votesCollection,
        [
          Query.equal('pollId', pollId),
          Query.equal('userId', userId),
          Query.limit(1),
        ]
      );

      return response.documents.length > 0
        ? (response.documents[0] as unknown as PollVote)
        : null;
    } catch (error) {
      console.error('[PollsService] Error getting user vote:', error);
      return null;
    }
  }

  /**
   * Check if user has voted on a poll
   */
  static async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    const vote = await this.getUserVote(pollId, userId);
    return vote !== null;
  }

  /**
   * Get all votes for a poll
   */
  static async getPollVotes(pollId: string): Promise<PollVote[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.votesCollection,
        [
          Query.equal('pollId', pollId),
          Query.limit(10000),
        ]
      );

      return response.documents as unknown as PollVote[];
    } catch (error) {
      console.error('[PollsService] Error getting poll votes:', error);
      throw error;
    }
  }

  /**
   * Update vote counts for a poll (recalculate from votes)
   */
  private static async updateVoteCounts(pollId: string): Promise<void> {
    try {
      // Get poll
      const poll = await this.getPollById(pollId);

      // Get all votes
      const votes = await this.getPollVotes(pollId);

      // Count votes per option
      const optionCounts: Record<string, number> = {};
      votes.forEach((vote) => {
        vote.optionIds.forEach((optionId) => {
          optionCounts[optionId] = (optionCounts[optionId] || 0) + 1;
        });
      });

      // Update poll options
      const updatedOptions = poll.options.map((option) => ({
        ...option,
        votes: optionCounts[option.id] || 0,
      }));

      // Update poll document
      await databases.updateDocument(
        this.dbId,
        this.pollsCollection,
        pollId,
        {
          options: updatedOptions,
          totalVotes: votes.length,
        }
      );
    } catch (error) {
      console.error('[PollsService] Error updating vote counts:', error);
      throw error;
    }
  }

  /**
   * Get poll results
   */
  static async getPollResults(pollId: string): Promise<{
    poll: Poll;
    totalVotes: number;
    results: Array<{ option: PollOption; percentage: number }>;
  }> {
    try {
      const poll = await this.getPollById(pollId);

      const results = poll.options.map((option) => ({
        option,
        percentage: poll.totalVotes > 0
          ? Math.round((option.votes / poll.totalVotes) * 100)
          : 0,
      }));

      return {
        poll,
        totalVotes: poll.totalVotes,
        results,
      };
    } catch (error) {
      console.error('[PollsService] Error getting poll results:', error);
      throw error;
    }
  }

  /**
   * Delete a poll
   */
  static async deletePoll(pollId: string): Promise<void> {
    try {
      // Delete all votes first
      const votes = await this.getPollVotes(pollId);
      await Promise.all(
        votes.map((vote) =>
          databases.deleteDocument(this.dbId, this.votesCollection, vote.$id)
        )
      );

      // Delete poll
      await databases.deleteDocument(this.dbId, this.pollsCollection, pollId);
    } catch (error) {
      console.error('[PollsService] Error deleting poll:', error);
      throw error;
    }
  }

  /**
   * Close a poll (prevent further voting)
   */
  static async closePoll(pollId: string): Promise<Poll> {
    return this.updatePollStatus(pollId, 'closed');
  }

  /**
   * Activate a poll (allow voting)
   */
  static async activatePoll(pollId: string): Promise<Poll> {
    return this.updatePollStatus(pollId, 'active');
  }
}
