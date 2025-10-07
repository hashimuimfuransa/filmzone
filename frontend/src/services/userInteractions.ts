import api from './api';

export interface UserRating {
  _id?: string;
  userId: string;
  movieId: string;
  rating: number; // 1-5 stars
  createdAt?: string;
  updatedAt?: string;
}

export interface UserComment {
  _id?: string;
  userId: string;
  movieId: string;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  movie?: {
    _id: string;
    title: string;
    posterUrl?: string;
  };
}

export interface WatchlistItem {
  _id?: string;
  userId: string;
  movieId: string;
  addedAt?: string;
  movie?: {
    _id: string;
    title: string;
    posterUrl: string;
    releaseYear: number;
    rating: number;
    genre: string[];
    views?: number;
  };
}

export interface UserInteractionStats {
  totalWatchlistItems: number;
  totalRatings: number;
  totalComments: number;
  averageRating: number;
}

class UserInteractionsService {
  // Watchlist operations
  async addToWatchlist(movieId: string): Promise<WatchlistItem> {
    const response = await api.post('/watchlist', { movieId });
    return response.data;
  }

  async removeFromWatchlist(movieId: string): Promise<void> {
    await api.delete(`/watchlist/${movieId}`);
  }

  async getWatchlist(): Promise<WatchlistItem[]> {
    const response = await api.get('/watchlist');
    return response.data;
  }

  async isInWatchlist(movieId: string): Promise<boolean> {
    try {
      const response = await api.get(`/watchlist/check/${movieId}`);
      return response.data.isInWatchlist;
    } catch (error) {
      return false;
    }
  }

  // Rating operations
  async rateMovie(movieId: string, rating: number): Promise<UserRating> {
    const response = await api.post('/ratings', { movieId, rating });
    return response.data;
  }

  async updateRating(movieId: string, rating: number): Promise<UserRating> {
    const response = await api.put(`/ratings/${movieId}`, { rating });
    return response.data;
  }

  async getUserRating(movieId: string): Promise<UserRating | null> {
    try {
      const response = await api.get(`/ratings/${movieId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getMovieRatings(movieId: string): Promise<UserRating[]> {
    const response = await api.get(`/ratings/movie/${movieId}`);
    return response.data;
  }

  // Comment operations
  async addComment(movieId: string, comment: string): Promise<UserComment> {
    const response = await api.post('/comments', { movieId, comment });
    return response.data;
  }

  async updateComment(commentId: string, comment: string): Promise<UserComment> {
    const response = await api.put(`/comments/${commentId}`, { comment });
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  }

  async getMovieComments(movieId: string): Promise<UserComment[]> {
    const response = await api.get(`/comments/movie/${movieId}`);
    return response.data;
  }

  async getUserComments(): Promise<UserComment[]> {
    const response = await api.get('/comments/user');
    return response.data;
  }

  // Statistics
  async getUserStats(): Promise<UserInteractionStats> {
    const response = await api.get('/user-interactions/stats');
    return response.data;
  }

  // Bulk operations
  async getUserInteractions(movieId: string): Promise<{
    isInWatchlist: boolean;
    userRating: UserRating | null;
    userComments: UserComment[];
  }> {
    const response = await api.get(`/user-interactions/${movieId}`);
    return response.data;
  }
}

export default new UserInteractionsService();
