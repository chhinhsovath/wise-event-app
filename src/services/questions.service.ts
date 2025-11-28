import { databases } from './appwrite';
import { Query } from 'react-native-appwrite';
import { Question } from '@/types';

/**
 * Questions Service
 * Manages Q&A for sessions
 */
export class QuestionsService {
  private static dbId = 'main';
  private static collectionId = 'questions';

  /**
   * Submit a question
   */
  static async submitQuestion(
    sessionId: string,
    userId: string,
    content: string
  ): Promise<Question> {
    try {
      const response = await databases.createDocument(
        this.dbId,
        this.collectionId,
        'unique()',
        {
          sessionId,
          userId,
          content,
          upvotes: 0,
          upvotedBy: [],
          isAnswered: false,
          status: 'pending',
        }
      );

      return response as unknown as Question;
    } catch (error) {
      console.error('[QuestionsService] Error submitting question:', error);
      throw error;
    }
  }

  /**
   * Get all questions for a session
   */
  static async getSessionQuestions(
    sessionId: string,
    status?: 'pending' | 'approved' | 'answered' | 'hidden'
  ): Promise<Question[]> {
    try {
      const queries = [
        Query.equal('sessionId', sessionId),
        Query.orderDesc('upvotes'),
        Query.limit(200),
      ];

      if (status) {
        queries.push(Query.equal('status', status));
      }

      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        queries
      );

      return response.documents as unknown as Question[];
    } catch (error) {
      console.error('[QuestionsService] Error getting session questions:', error);
      throw error;
    }
  }

  /**
   * Get approved questions (for display)
   */
  static async getApprovedQuestions(sessionId: string): Promise<Question[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('sessionId', sessionId),
          Query.equal('status', 'approved'),
          Query.orderDesc('upvotes'),
          Query.limit(100),
        ]
      );

      return response.documents as unknown as Question[];
    } catch (error) {
      console.error('[QuestionsService] Error getting approved questions:', error);
      throw error;
    }
  }

  /**
   * Get answered questions
   */
  static async getAnsweredQuestions(sessionId: string): Promise<Question[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('sessionId', sessionId),
          Query.equal('status', 'answered'),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
      );

      return response.documents as unknown as Question[];
    } catch (error) {
      console.error('[QuestionsService] Error getting answered questions:', error);
      throw error;
    }
  }

  /**
   * Get user's questions for a session
   */
  static async getUserQuestions(
    sessionId: string,
    userId: string
  ): Promise<Question[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('sessionId', sessionId),
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(50),
        ]
      );

      return response.documents as unknown as Question[];
    } catch (error) {
      console.error('[QuestionsService] Error getting user questions:', error);
      throw error;
    }
  }

  /**
   * Upvote a question
   */
  static async upvoteQuestion(
    questionId: string,
    userId: string
  ): Promise<Question> {
    try {
      // Get current question
      const question = await this.getQuestionById(questionId);

      // Check if user already upvoted
      if (question.upvotedBy.includes(userId)) {
        throw new Error('User has already upvoted this question');
      }

      // Add user to upvotedBy array and increment upvotes
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        questionId,
        {
          upvotes: question.upvotes + 1,
          upvotedBy: [...question.upvotedBy, userId],
        }
      );

      return response as unknown as Question;
    } catch (error) {
      console.error('[QuestionsService] Error upvoting question:', error);
      throw error;
    }
  }

  /**
   * Remove upvote from a question
   */
  static async removeUpvote(
    questionId: string,
    userId: string
  ): Promise<Question> {
    try {
      // Get current question
      const question = await this.getQuestionById(questionId);

      // Check if user has upvoted
      if (!question.upvotedBy.includes(userId)) {
        throw new Error('User has not upvoted this question');
      }

      // Remove user from upvotedBy array and decrement upvotes
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        questionId,
        {
          upvotes: Math.max(0, question.upvotes - 1),
          upvotedBy: question.upvotedBy.filter((id) => id !== userId),
        }
      );

      return response as unknown as Question;
    } catch (error) {
      console.error('[QuestionsService] Error removing upvote:', error);
      throw error;
    }
  }

  /**
   * Toggle upvote (smart upvote/remove)
   */
  static async toggleUpvote(
    questionId: string,
    userId: string
  ): Promise<Question> {
    try {
      const question = await this.getQuestionById(questionId);

      if (question.upvotedBy.includes(userId)) {
        return await this.removeUpvote(questionId, userId);
      } else {
        return await this.upvoteQuestion(questionId, userId);
      }
    } catch (error) {
      console.error('[QuestionsService] Error toggling upvote:', error);
      throw error;
    }
  }

  /**
   * Answer a question (speaker/moderator)
   */
  static async answerQuestion(
    questionId: string,
    answer: string,
    answeredBy: string
  ): Promise<Question> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        questionId,
        {
          answer,
          answeredBy,
          answeredAt: new Date().toISOString(),
          isAnswered: true,
          status: 'answered',
        }
      );

      return response as unknown as Question;
    } catch (error) {
      console.error('[QuestionsService] Error answering question:', error);
      throw error;
    }
  }

  /**
   * Approve a question (moderator)
   */
  static async approveQuestion(questionId: string): Promise<Question> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        questionId,
        { status: 'approved' }
      );

      return response as unknown as Question;
    } catch (error) {
      console.error('[QuestionsService] Error approving question:', error);
      throw error;
    }
  }

  /**
   * Hide a question (moderator)
   */
  static async hideQuestion(questionId: string): Promise<Question> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        questionId,
        { status: 'hidden' }
      );

      return response as unknown as Question;
    } catch (error) {
      console.error('[QuestionsService] Error hiding question:', error);
      throw error;
    }
  }

  /**
   * Delete a question
   */
  static async deleteQuestion(questionId: string): Promise<void> {
    try {
      await databases.deleteDocument(this.dbId, this.collectionId, questionId);
    } catch (error) {
      console.error('[QuestionsService] Error deleting question:', error);
      throw error;
    }
  }

  /**
   * Get question by ID
   */
  static async getQuestionById(questionId: string): Promise<Question> {
    try {
      const response = await databases.getDocument(
        this.dbId,
        this.collectionId,
        questionId
      );

      return response as unknown as Question;
    } catch (error) {
      console.error('[QuestionsService] Error getting question:', error);
      throw error;
    }
  }

  /**
   * Get top questions by upvotes
   */
  static async getTopQuestions(
    sessionId: string,
    limit: number = 10
  ): Promise<Question[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('sessionId', sessionId),
          Query.equal('status', 'approved'),
          Query.orderDesc('upvotes'),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as Question[];
    } catch (error) {
      console.error('[QuestionsService] Error getting top questions:', error);
      throw error;
    }
  }

  /**
   * Get unanswered questions count
   */
  static async getUnansweredCount(sessionId: string): Promise<number> {
    try {
      const questions = await this.getApprovedQuestions(sessionId);
      return questions.filter((q) => !q.isAnswered).length;
    } catch (error) {
      console.error('[QuestionsService] Error getting unanswered count:', error);
      return 0;
    }
  }

  /**
   * Search questions
   */
  static async searchQuestions(
    sessionId: string,
    query: string
  ): Promise<Question[]> {
    try {
      const questions = await this.getSessionQuestions(sessionId);

      // Client-side search (server-side search requires full-text index)
      const lowerQuery = query.toLowerCase();
      return questions.filter((q) =>
        q.content.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('[QuestionsService] Error searching questions:', error);
      throw error;
    }
  }
}
