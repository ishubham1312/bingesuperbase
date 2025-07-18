

export type MediaType = 'movie' | 'tv';

export enum MovieCategory {
  Hollywood = 'Hollywood',
  Bollywood = 'Bollywood',
  WebSeries = 'Web Series',
  Anime = 'Anime',
  Animated = 'Animated',
}

export interface Movie {
  id: number; // Changed for TMDB
  title: string;
  posterPath: string;
  backdropPath: string;
  overview: string;
  releaseDate: string;
  genres: string[];
  publicRating: number;
  popularity: number;
  category: MovieCategory;
  mediaType: MediaType; // Added
  originalLanguage: string; // Added
  adult: boolean; // Added
  seasons?: { season: number; episodes: number }[];
  cast: { name:string; character: string; avatar: string }[];
  gallery: string[];
  whereToWatch: string[];
  trailerUrl?: string;
  runtime?: number; // Added
  // New fields for Details Page
  budget?: number;
  revenue?: number;
  status?: string;
}

export interface ListItem {
  movieId: number; // Changed for TMDB
  mediaType: MediaType; // Added
  userRating: number;
  addedOn: string; // ISO Date string
  watchedEpisodes?: number[];
}

export interface DetailedListItem extends Movie {
    userRating: number;
    addedOn: string; // ISO Date string
    watchedEpisodes?: number[];
}

export interface UserList {
  id: string;
  name: string;
  items: ListItem[];
  pinned?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverImageUrl: string;
  lists: UserList[];
}

export interface Episode {
    id: number;
    name: string;
    overview: string;
    airDate: string;
    episodeNumber: number;
    seasonNumber: number;
    stillPath: string;
}