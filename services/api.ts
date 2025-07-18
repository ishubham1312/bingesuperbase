

import { User, Movie, UserList, ListItem, MovieCategory, MediaType, Episode, DetailedListItem } from '../types';

// --- TMDB API CONFIG ---
const API_KEY = 'eae7b604e25cc93b51025d8a7379a202';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// --- TMDB GENRE MAPS ---
const MOVIE_GENRE_MAP: Record<number, string> = { 28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western" };
const TV_GENRE_MAP: Record<number, string> = { 10759: "Action & Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 10762: "Kids", 9648: "Mystery", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics", 37: "Western" };

const GENRE_KEYWORD_MAP: Record<string, {type: 'genre' | 'keyword', movie: number[], tv: number[]}> = {
    'action': { type: 'genre', movie: [28], tv: [10759] },
    'adventure': { type: 'genre', movie: [12], tv: [10759] },
    'animation': { type: 'genre', movie: [16], tv: [16] },
    'comedy': { type: 'genre', movie: [35], tv: [35] },
    'crime': { type: 'genre', movie: [80], tv: [80] },
    'documentary': { type: 'genre', movie: [99], tv: [99] },
    'drama': { type: 'genre', movie: [18], tv: [18] },
    'family': { type: 'genre', movie: [10751], tv: [10751] },
    'fantasy': { type: 'genre', movie: [14], tv: [10765] },
    'history': { type: 'genre', movie: [36], tv: [10768] },
    'horror': { type: 'genre', movie: [27], tv: [] },
    'music': { type: 'genre', movie: [10402], tv: [] },
    'mystery': { type: 'genre', movie: [9648], tv: [9648] },
    'romance': { type: 'genre', movie: [10749], tv: [] },
    'science fiction': { type: 'genre', movie: [878], tv: [10765] },
    'sci-fi': { type: 'genre', movie: [878], tv: [10765] },
    'tv movie': { type: 'genre', movie: [10770], tv: [] },
    'thriller': { type: 'genre', movie: [53], tv: [] },
    'war': { type: 'genre', movie: [10752], tv: [10768] },
    'western': { type: 'genre', movie: [37], tv: [37] },
    'kids': { type: 'genre', movie: [], tv: [10762] },
    'superhero': { type: 'keyword', movie: [9715], tv: [210024] },
    'superheroes': { type: 'keyword', movie: [9715], tv: [210024] }
};


// --- HELPER for MOCK DATA ---
const simulateDelay = <T>(data: T): Promise<T> => {
    // Create a new object reference to ensure React state updates
    const freshData = JSON.parse(JSON.stringify(data));
    return new Promise(resolve => setTimeout(() => resolve(freshData), 300));
};

// --- MOCK USER DATA (persists locally) ---
let MOCK_USER: User = {
    id: 'u1',
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
    bio: 'Movie enthusiast. Binge-watcher. Critic.',
    avatarUrl: '', // Will be dynamically set by fetchUser/login
    coverImageUrl: '/cover-collage.jpg',
    lists: [
        { id: 'l2', name: 'Mind-Bending Sci-Fi', items: [{ movieId: 693134, mediaType: 'movie', userRating: 5, addedOn: new Date().toISOString() }], pinned: true },
        { id: 'l1', name: 'Weekend Binge', items: [{ movieId: 786892, mediaType: 'movie', userRating: 4.5, addedOn: new Date().toISOString() }, { movieId: 1396, mediaType: 'tv', userRating: 4, addedOn: new Date().toISOString(), watchedEpisodes: [63056, 63057] }] },
    ]
};

// --- API HELPERS ---

const tmdbFetch = async (endpoint: string) => {
    const url = `${TMDB_BASE_URL}/${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`TMDB API request failed for endpoint: ${endpoint}`);
        throw new Error(`TMDB API request failed: ${response.statusText}`);
    }
    return response.json();
};

const transformTmdbItem = (item: any, category?: MovieCategory, details: any = {}): Movie => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    const combinedData = { ...item, ...details };

    const getGenres = (): string[] => {
        if (combinedData.genres && Array.isArray(combinedData.genres)) { // From details endpoint
            return combinedData.genres.map((g: any) => g.name);
        }
        if (combinedData.genre_ids && Array.isArray(combinedData.genre_ids)) { // From list endpoints
            const genreMap = mediaType === 'movie' ? MOVIE_GENRE_MAP : TV_GENRE_MAP;
            return combinedData.genre_ids.map((id: number) => genreMap[id]).filter((name): name is string => !!name);
        }
        return [];
    };
    
    const genres = getGenres();

    const getCategory = (): MovieCategory => {
        if (category) return category;
        // The category is pre-defined for category pages. This is a fallback for search/trending.
        const hasAnimationGenre = combinedData.genre_ids?.includes(16) || combinedData.genres?.some((g: any) => g.id === 16);

        if (hasAnimationGenre) {
            if (mediaType === 'tv' && combinedData.origin_country?.includes('JP')) return MovieCategory.Anime;
            if (mediaType === 'movie') return MovieCategory.Animated;
        }

        if (mediaType === 'tv') return MovieCategory.WebSeries;
        if (combinedData.origin_country?.includes('IN')) return MovieCategory.Bollywood;
        return MovieCategory.Hollywood;
    }


    return {
        id: combinedData.id,
        title: combinedData.title || combinedData.name,
        posterPath: combinedData.poster_path ? `${TMDB_IMAGE_BASE_URL}w500${combinedData.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image',
        backdropPath: combinedData.backdrop_path ? `${TMDB_IMAGE_BASE_URL}w1280${combinedData.backdrop_path}` : 'https://via.placeholder.com/1280x720?text=No+Image',
        overview: combinedData.overview,
        releaseDate: combinedData.release_date || combinedData.first_air_date || 'N/A',
        genres: genres,
        publicRating: combinedData.vote_average || 0,
        popularity: combinedData.popularity || 0,
        mediaType,
        category: getCategory(),
        originalLanguage: combinedData.original_language || 'en',
        adult: combinedData.adult || false,
        seasons: combinedData.seasons?.map((s: any) => ({ season: s.season_number, episodes: s.episode_count })) || [],
        cast: combinedData.credits?.cast.slice(0, 10).map((c: any) => ({
            name: c.name,
            character: c.character,
            avatar: c.profile_path ? `${TMDB_IMAGE_BASE_URL}w200${c.profile_path}` : 'https://via.placeholder.com/200x300?text=No+Avatar'
        })) || [],
        gallery: combinedData.images?.backdrops.slice(0, 10).map((i: any) => `${TMDB_IMAGE_BASE_URL}original${i.file_path}`) || [],
        whereToWatch: [...new Set((combinedData['watch/providers']?.results?.IN?.flatrate || []).map((p: any) => p.provider_name).filter(Boolean) as string[])],
        trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${combinedData.title || combinedData.name} trailer`)}`,
        runtime: combinedData.runtime || (combinedData.episode_run_time && combinedData.episode_run_time[0]) || undefined,
        // New fields
        budget: combinedData.budget,
        revenue: combinedData.revenue,
        status: combinedData.status,
    };
};

const transformTmdbEpisode = (item: any): Episode => ({
    id: item.id,
    name: item.name,
    overview: item.overview,
    airDate: item.air_date || 'N/A',
    episodeNumber: item.episode_number,
    seasonNumber: item.season_number,
    stillPath: item.still_path ? `${TMDB_IMAGE_BASE_URL}w500${item.still_path}` : 'https://via.placeholder.com/500x281?text=No+Image',
});

// --- EXPORTED API ---

export const api = {
    async login(email: string, pass: string): Promise<User> {
        console.log(`Attempting login for ${email}`);
        MOCK_USER.email = email;
        // If avatar isn't a preset, assign one.
        if (!MOCK_USER.avatarUrl || !MOCK_USER.avatarUrl.startsWith('/dp/')) {
            const userIdNum = parseInt(MOCK_USER.id.replace(/[^0-9]/g, ''), 10) || 1;
            const presetId = (userIdNum % 10) + 1; // 10 presets
            MOCK_USER.avatarUrl = `/dp/${presetId}.png`;
        }
        return simulateDelay(MOCK_USER);
    },

    async fetchTrendingMovies(): Promise<Movie[]> {
        const data = await tmdbFetch('trending/all/week');
        return data.results
            .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
            .map((item: any) => transformTmdbItem(item));
    },

    async fetchMoviesByCategory(category: MovieCategory, page: number = 1): Promise<Movie[]> {
        let endpoint = '';
        switch(category) {
            case MovieCategory.Hollywood:
                endpoint = `discover/movie?with_origin_country=US&sort_by=popularity.desc&page=${page}`;
                break;
            case MovieCategory.Bollywood:
                endpoint = `discover/movie?with_origin_country=IN&sort_by=popularity.desc&page=${page}`;
                break;
            case MovieCategory.WebSeries:
                endpoint = `discover/tv?sort_by=popularity.desc&with_original_language=en&page=${page}`;
                break;
            case MovieCategory.Anime:
                endpoint = `discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=${page}`;
                break;
            case MovieCategory.Animated:
                endpoint = `discover/movie?with_genres=16&sort_by=popularity.desc&page=${page}`;
                break;
            default:
                return [];
        }
        const data = await tmdbFetch(endpoint);
        return data.results.map((item: any) => transformTmdbItem(item, category));
    },

    async performSearch(query: string): Promise<Movie[]> {
        if (!query) return [];
        
        const lowerCaseQuery = query.toLowerCase().trim();
        const specialSearch = GENRE_KEYWORD_MAP[lowerCaseQuery];

        if (specialSearch) {
            let movieResults: any[] = [];
            let tvResults: any[] = [];
            const param = specialSearch.type === 'genre' ? 'with_genres' : 'with_keywords';

            const promises = [];
            if(specialSearch.movie.length > 0) {
                const movieEndpoint = `discover/movie?${param}=${specialSearch.movie.join(',')}&sort_by=popularity.desc&page=1`;
                promises.push(tmdbFetch(movieEndpoint));
            } else {
                promises.push(Promise.resolve({results: []}));
            }
            
            if(specialSearch.tv.length > 0) {
                const tvEndpoint = `discover/tv?${param}=${specialSearch.tv.join(',')}&sort_by=popularity.desc&page=1`;
                promises.push(tmdbFetch(tvEndpoint));
            } else {
                promises.push(Promise.resolve({results: []}));
            }

            const [movieData, tvData] = await Promise.all(promises);

            movieResults = movieData.results || [];
            tvResults = tvData.results || [];

            const combined = [...movieResults, ...tvResults]
                .map(item => transformTmdbItem(item));
            
            combined.sort((a,b) => b.popularity - a.popularity);

            return combined;
        }

        // Fallback to text search for other queries
        const data = await tmdbFetch(`search/multi?query=${encodeURIComponent(query)}&include_adult=false&page=1`);
        
        const moviesAndTv: Movie[] = [];
        const personMedia: any[] = [];

        data.results.forEach((item: any) => {
            if (item.media_type === 'movie' || item.media_type === 'tv') {
                moviesAndTv.push(transformTmdbItem(item));
            } else if (item.media_type === 'person' && Array.isArray(item.known_for)) {
                personMedia.push(...item.known_for);
            }
        });

        const transformedPersonMedia = personMedia
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item => transformTmdbItem(item));

        const combined = [...moviesAndTv, ...transformedPersonMedia];
        const uniqueResults = Array.from(new Map(combined.map(item => [`${item.id}-${item.mediaType}`, item])).values());
        
        // Sorting for relevance (popularity first, then recency)
        uniqueResults.sort((a, b) => {
            if (b.popularity !== a.popularity) {
                return b.popularity - a.popularity;
            }
            if (!a.releaseDate || !b.releaseDate || a.releaseDate === 'N/A' || b.releaseDate === 'N/A') return 0;
            return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        });
        
        return uniqueResults;
    },

    async fetchContentDetails(mediaType: MediaType, id: number): Promise<Movie | null> {
        try {
            const details = await tmdbFetch(`${mediaType}/${id}?append_to_response=videos,credits,images,watch/providers`);
            return transformTmdbItem(details, undefined, details);
        } catch (error) {
            console.error(`Failed to fetch details for ${mediaType}/${id}`, error);
            return null;
        }
    },

    async fetchSeasonDetails(tvId: number, seasonNumber: number): Promise<Episode[]> {
        try {
            const data = await tmdbFetch(`tv/${tvId}/season/${seasonNumber}`);
            return data.episodes?.map(transformTmdbEpisode) || [];
        } catch (error) {
            console.error(`Failed to fetch season details for tv/${tvId}/season/${seasonNumber}`, error);
            return [];
        }
    },

    async fetchRecommendations(mediaType: MediaType, id: number): Promise<Movie[]> {
        try {
            const data = await tmdbFetch(`${mediaType}/${id}/recommendations`);
            return data.results
                .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
                .map((item: any) => transformTmdbItem(item));
        } catch (error) {
            console.error(`Failed to fetch recommendations for ${mediaType}/${id}`, error);
            return [];
        }
    },

    async fetchUser(): Promise<User> {
        // If avatar isn't a preset, assign one.
        if (!MOCK_USER.avatarUrl || !MOCK_USER.avatarUrl.startsWith('/dp/')) {
            const userIdNum = parseInt(MOCK_USER.id.replace(/[^0-9]/g, ''), 10) || 1;
            const presetId = (userIdNum % 10) + 1; // 10 presets
            MOCK_USER.avatarUrl = `/dp/${presetId}.png`;
        }
        return simulateDelay(MOCK_USER);
    },

    async updateUser(user: Partial<User>): Promise<User> {
        MOCK_USER = { ...MOCK_USER, ...user };
        return simulateDelay(MOCK_USER);
    },

    async addMovieToList(listId: string, movieId: number, mediaType: MediaType, rating: number, watchedEpisodes?: number[]): Promise<User> {
        const newLists = MOCK_USER.lists.map(list => {
            if (list.id !== listId) {
                return list;
            }
    
            const existingItemIndex = list.items.findIndex(i => i.movieId === movieId && i.mediaType === mediaType);
            let newItems: ListItem[];
    
            if (existingItemIndex > -1) {
                // Update existing item's rating and watched episodes
                newItems = list.items.map((item, index) => {
                    if (index === existingItemIndex) {
                        const updatedItem: ListItem = { ...item, userRating: rating };
                        if (mediaType === 'tv') {
                            // Merge watched episodes
                            const currentEpisodes = new Set(item.watchedEpisodes || []);
                            (watchedEpisodes || []).forEach(epId => currentEpisodes.add(epId));
                            updatedItem.watchedEpisodes = Array.from(currentEpisodes).sort((a,b)=>a-b);
                        }
                        return updatedItem;
                    }
                    return item;
                });
            } else {
                // Add new item to the beginning
                const newItem: ListItem = { movieId, mediaType, userRating: rating, addedOn: new Date().toISOString() };
                if (mediaType === 'tv') {
                    newItem.watchedEpisodes = watchedEpisodes ? watchedEpisodes.sort((a,b)=>a-b) : [];
                }
                newItems = [newItem, ...list.items];
            }
            
            return { ...list, items: newItems };
        });
    
        MOCK_USER = { ...MOCK_USER, lists: newLists };
        return simulateDelay(MOCK_USER);
    },

    async createList(name: string): Promise<User> {
        const newList: UserList = {
            id: `l${Date.now()}`,
            name,
            items: [],
            pinned: false,
        };
        const updatedUser = { 
            ...MOCK_USER, 
            lists: [...MOCK_USER.lists, newList] 
        };
        MOCK_USER = updatedUser;
        return simulateDelay(MOCK_USER);
    },

    async deleteList(listId: string): Promise<User> {
        const listsAfterDeletion = MOCK_USER.lists.filter(list => list.id !== listId);
        const updatedUser = {
            ...MOCK_USER,
            lists: listsAfterDeletion
        };
        MOCK_USER = updatedUser;
        return simulateDelay(MOCK_USER);
    },

    async renameList(listId: string, newName: string): Promise<User> {
        const newLists = MOCK_USER.lists.map(l => 
            l.id === listId ? { ...l, name: newName } : l
        );
        MOCK_USER = { ...MOCK_USER, lists: newLists };
        return simulateDelay(MOCK_USER);
    },

    async pinList(listId: string): Promise<User> {
        const listToToggle = MOCK_USER.lists.find(l => l.id === listId);
        if (!listToToggle) return MOCK_USER;

        const otherLists = MOCK_USER.lists.filter(l => l.id !== listId);
        const isNowPinned = !listToToggle.pinned;
        const updatedList = { ...listToToggle, pinned: isNowPinned };

        let newLists;
        if (isNowPinned) {
            // Pinning: add to the end of pinned lists
            const pinned = otherLists.filter(l => l.pinned);
            const unpinned = otherLists.filter(l => !l.pinned);
            newLists = [...pinned, updatedList, ...unpinned];
        } else {
            // Unpinning: add to the start of unpinned lists
            const pinned = otherLists.filter(l => l.pinned);
            const unpinned = otherLists.filter(l => !l.pinned);
            newLists = [...pinned, updatedList, ...unpinned];
        }

        MOCK_USER = { ...MOCK_USER, lists: newLists };
        return simulateDelay(MOCK_USER);
    },
    
    async reorderLists(orderedIds: string[]): Promise<User> {
        const listMap = new Map(MOCK_USER.lists.map(l => [l.id, l]));
        const unpinnedLists = MOCK_USER.lists.filter(l => !l.pinned);

        const orderedPinnedLists = orderedIds
            .map(id => listMap.get(id))
            .filter((l): l is UserList => !!l);
            
        const newLists = [...orderedPinnedLists, ...unpinnedLists];
        MOCK_USER = { ...MOCK_USER, lists: newLists };
        return simulateDelay(MOCK_USER);
    },

    async exportList(listId: string): Promise<string> {
        const list = MOCK_USER.lists.find(l => l.id === listId);
        if (!list) throw new Error("List not found");

        const movieItems = await Promise.all(
            list.items.map(item => this.fetchContentDetails(item.mediaType, item.movieId))
        );

        const exportData = {
            listName: list.name,
            items: movieItems.filter(Boolean).map(movie => {
                 const listItem = list.items.find(item => item.movieId === movie!.id);
                 return { ...movie, userRating: listItem?.userRating };
            })
        };
        return JSON.stringify(exportData, null, 2);
    },

     async importList(jsonContent: string): Promise<User> {
        const data = JSON.parse(jsonContent);
        const newList: UserList = {
            id: `l${Date.now()}`,
            name: data.listName || 'Imported List',
            items: data.items.map((movie: Movie & { userRating: number }) => ({
                movieId: movie.id,
                mediaType: movie.mediaType,
                userRating: movie.userRating || 0,
                addedOn: new Date().toISOString(),
            }))
        };
        
        MOCK_USER = { ...MOCK_USER, lists: [...MOCK_USER.lists, newList] };
        return simulateDelay(MOCK_USER);
    },
    
    async getListDetails(listId: string): Promise<{ list: UserList; detailedItems: DetailedListItem[] } | null> {
        const list = MOCK_USER.lists.find(l => l.id === listId);
        if (!list) return simulateDelay(null);
        
        // Sort items by date added, newest first.
        const sortedItems = [...list.items].sort((a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime());

        const detailedItemsPromises = sortedItems.map(async (item) => {
            const movieDetails = await this.fetchContentDetails(item.mediaType, item.movieId);
            if (!movieDetails) return null;
            
            return {
                ...movieDetails,
                userRating: item.userRating,
                addedOn: item.addedOn,
                watchedEpisodes: item.watchedEpisodes,
            };
        });

        const detailedItems = await Promise.all(detailedItemsPromises);
        const validItems = detailedItems.filter((item): item is DetailedListItem => item !== null);

        return simulateDelay({ list, detailedItems: validItems });
    }
};