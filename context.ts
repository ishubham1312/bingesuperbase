
import { createContext } from 'react';
import { Movie, User, UserList, MediaType } from './types';

// ========= App Context =========
export interface IAppContext {
    user: User | null;
    isLoading: boolean;
    movieToAdd: Movie | null;
    setMovieToAdd: (movie: Movie | null) => void;
    addMovieToList: (listId: string, movieId: number, mediaType: MediaType, rating: number, watchedEpisodes?: number[]) => Promise<void>;
    createList: (name: string) => Promise<UserList | undefined>;
    deleteList: (listId: string) => Promise<void>;
    renameList: (listId: string, newName: string) => Promise<void>;
    pinList: (listId: string) => Promise<void>;
    reorderLists: (orderedIds: string[]) => Promise<void>;
    updateUser: (updatedData: Partial<User>) => Promise<void>;
    importList: (jsonContent: string) => Promise<void>;
    exportList: (listId: string) => Promise<void>;
    theme: string;
    toggleTheme: () => void;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
}

export const AppContext = createContext<IAppContext>(null!);