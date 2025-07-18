import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import { Routes, Route, Link, useParams, useNavigate,  Navigate } from 'react-router-dom';
import { Movie, User, UserList, MovieCategory, MediaType, Episode, DetailedListItem } from './types';
import { AppContext, IAppContext } from './context';
import { api } from './services/api';
import { BsPinAngleFill , } from "react-icons/bs";
import { Spinner, MovieCard, StarRating, AddToListModal, StarIcon, SearchIcon, ChevronRightIcon, CloseIcon, PlayIcon, PlusIcon, ChevronLeftIcon, SunIcon, MoonIcon, DownloadIcon, Modal, CreateListModal, EditIcon, CameraIcon, TrendingMovieCard, RenameListModal, ListCard, ShareIcon,  EpisodeCard, CalendarIcon, FilterIcon, ResetIcon, SettingsIcon, EmailIcon, LogoutIcon, ToggleSwitch, UploadIcon, GoogleIcon } from './components/ui';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';

// Add this style block at the top of the file (or in a global CSS file if preferred):
// <style>
// @keyframes bg-move {
//   0% { transform: translateX(0); }
//   100% { transform: translateX(-20%); }
// }
// </style>

// ========= HELPERS / HOOKS =========
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// ========= UI Components =========

const Navbar = () => {
    const { user, theme, toggleTheme } = useContext(AppContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const buttonBgClass = isScrolled ? 'hover:bg-gray-500/10' : 'bg-black/20 hover:bg-black/40';

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="text-3xl font-bold text-primary">
                            BingeBoard
                        </Link>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                             <button 
                                onClick={toggleTheme} 
                                className={`p-2 rounded-full transition-colors ${buttonBgClass}`}
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <MoonIcon className="h-6 w-6 text-indigo-400" /> : <SunIcon className="h-6 w-6 text-yellow-400" />}
                            </button>
                            <button onClick={() => setIsSearchOpen(true)} className={`p-2 rounded-full transition-colors ${buttonBgClass}`}>
                                <SearchIcon className="h-6 w-6 text-primary" />
                            </button>
                            {user && (
                                <Link to="/profile" className={`block rounded-full transition-colors ${!isScrolled && 'p-0.5 bg-black/20 hover:bg-black/40'}`}>
                                    <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const navigate = useNavigate();

    useEffect(() => {
        if (debouncedQuery) {
            setIsLoading(true);
            api.performSearch(debouncedQuery).then(res => {
                setResults(res);
                setIsLoading(false);
            }).catch(() => setIsLoading(false));
        } else {
            setResults([]);
        }
    }, [debouncedQuery]);
    
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            e.preventDefault();
            navigate(`/search/${encodeURIComponent(query.trim())}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-50 p-4 pt-[10vh] sm:p-6 md:p-8" onClick={onClose}>
            <div className="bg-dark-card max-w-2xl mx-auto rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="relative">
                     <input
                        type="text"
                        placeholder="Search for movies, TV shows, genres..."
                        className="w-full bg-transparent text-white text-lg p-4 pr-12 outline-none border-b border-gray-600"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearchSubmit}
                        autoFocus
                    />
                    <button onClick={onClose} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                    {isLoading && <div className="text-center p-4 text-gray-400">Searching...</div>}
                    {!isLoading && results.length > 0 && (
                        <ul>
                            {results.map(movie => (
                                <li key={`${movie.id}-${movie.mediaType}`} className="border-b border-gray-700 last:border-b-0">
                                    <Link to={`/details/${movie.mediaType}/${movie.id}`} onClick={onClose} className="flex items-center space-x-4 p-3 hover:bg-gray-700/50 transition-colors">
                                        <img src={movie.posterPath} alt={movie.title} className="w-12 h-16 object-cover rounded-md flex-shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-white truncate">{movie.title}</p>
                                            <p className="text-sm text-gray-400">{movie.releaseDate?.split('-')[0]}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                     {!isLoading && debouncedQuery && results.length === 0 && <div className="text-center p-4 text-gray-400">No results found for "{debouncedQuery}"</div>}
                </div>
            </div>
        </div>
    );
};

const FloatingBackButton = () => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            className="fixed top-20 left-4 sm:left-6 lg:left-8 bg-light-bg/50 dark:bg-dark-bg/50 backdrop-blur-sm hover:bg-light-bg/80 dark:hover:bg-dark-bg/80 text-light-text dark:text-dark-text p-2 rounded-full transition-colors z-30"
            aria-label="Go back"
        >
            <ChevronLeftIcon className="h-6 w-6" />
        </button>
    );
};

// ========= PAGES =========

const categoryNameMap: Record<string, MovieCategory> = {
    'hollywood': MovieCategory.Hollywood,
    'bollywood': MovieCategory.Bollywood,
    'web-series': MovieCategory.WebSeries,
    'anime': MovieCategory.Anime,
    'animated': MovieCategory.Animated,
};

const languageMap: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    ja: 'Japanese',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ko: 'Korean',
};


const HomePage = () => {
    const { user, setMovieToAdd } = useContext(AppContext);
    const navigate = useNavigate();
    const [trending, setTrending] = useState<Movie[]>([]);
    const [categories, setCategories] = useState<Record<MovieCategory, Movie[]>>({
        [MovieCategory.Hollywood]: [],
        [MovieCategory.Bollywood]: [],
        [MovieCategory.WebSeries]: [],
        [MovieCategory.Anime]: [],
        [MovieCategory.Animated]: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);

    const existingMovieIds = useMemo(() => {
        if (!user) return new Set<string>();
        const ids = new Set<string>();
        user.lists.forEach(list => {
            list.items.forEach(item => {
                ids.add(`${item.mediaType}-${item.movieId}`);
            });
        });
        return ids;
    }, [user]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [trendingData, ...categoryData] = await Promise.all([
                    api.fetchTrendingMovies(),
                    api.fetchMoviesByCategory(MovieCategory.Hollywood),
                    api.fetchMoviesByCategory(MovieCategory.Bollywood),
                    api.fetchMoviesByCategory(MovieCategory.WebSeries),
                    api.fetchMoviesByCategory(MovieCategory.Anime),
                    api.fetchMoviesByCategory(MovieCategory.Animated),
                ]);

                const filterMovies = (movies: Movie[]) => 
                    movies.filter(movie => !existingMovieIds.has(`${movie.mediaType}-${movie.id}`));

                setTrending(filterMovies(trendingData));
                setCategories({
                    [MovieCategory.Hollywood]: filterMovies(categoryData[0]),
                    [MovieCategory.Bollywood]: filterMovies(categoryData[1]),
                    [MovieCategory.WebSeries]: filterMovies(categoryData[2]),
                    [MovieCategory.Anime]: filterMovies(categoryData[3]),
                    [MovieCategory.Animated]: filterMovies(categoryData[4]),
                });
            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
        // This effect runs only once on mount to fetch and filter data based on the initial
        // state of the user's lists. `existingMovieIds` is intentionally omitted from the
        // dependency array to prevent re-filtering when an item is added to a list,
        // which preserves the user's view until the next page load.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const nextSlide = useCallback(() => {
        if (trending.length > 0) {
            setActiveSlide(prev => (prev + 1) % Math.min(trending.length, 10));
        }
    }, [trending.length]);

    const prevSlide = () => {
        if (trending.length > 0) {
            setActiveSlide(prev => (prev - 1 + Math.min(trending.length, 10)) % Math.min(trending.length, 10));
        }
    };

    const goToSlide = (index: number) => {
        setActiveSlide(index);
    };

    useEffect(() => {
        if (trending.length > 0) {
            const interval = setInterval(nextSlide, 8000); // Increased duration for a better experience
            return () => clearInterval(interval);
        }
    }, [trending.length, nextSlide]);
    
    const recentlyAdded = user?.lists
        .flatMap(list => list.items.map(item => ({...item, listName: list.name, listId: list.id })))
        .sort((a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime())
        .slice(0, 15) || [];
    
    const [recentlyAddedMovies, setRecentlyAddedMovies] = useState<(Movie & {listName?: string, listId?: string})[]>([]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (recentlyAdded.length > 0) {
                const movies = await Promise.all(
                    recentlyAdded.map(item => api.fetchContentDetails(item.mediaType, item.movieId))
                );
                const validMovies = movies.filter((m): m is Movie => m !== null);
                
                const moviesWithListInfo = validMovies.map(movie => {
                   const listItem = recentlyAdded.find(i => i.movieId === movie.id);
                   return {...movie, listName: listItem?.listName, listId: listItem?.listId };
                });

                setRecentlyAddedMovies(moviesWithListInfo);
            }
        };
        fetchDetails();
    }, [user]);

    const heroTrending = useMemo(() => trending.slice(0, 10), [trending]);
    
    const activeMovie = heroTrending[activeSlide];

    const paginationIndices = useMemo(() => {
        const total = heroTrending.length;
        if (total <= 3) {
            return Array.from({ length: total }, (_, i) => i);
        }
        if (activeSlide === 0) {
            return [0, 1, 2];
        }
        if (activeSlide === total - 1) {
            return [total - 3, total - 2, total - 1];
        }
        return [activeSlide - 1, activeSlide, activeSlide + 1];
    }, [activeSlide, heroTrending.length]);

    const handleHeroClick = () => {
        if (activeMovie) {
            navigate(`/details/${activeMovie.mediaType}/${activeMovie.id}`);
        }
    };

    const handleInteraction = (e: React.MouseEvent) => {
        e.stopPropagation();
    };


    if (isLoading) return <Spinner />;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            {heroTrending.length > 0 && activeMovie && (
                <div 
                    className="relative w-full h-[95vh] lg:h-screen -mt-16 cursor-pointer"
                    onClick={handleHeroClick}
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        {heroTrending.map((movie, index) => (
                            <div key={movie.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}>
                                {/* Mobile Poster Image */}
                                <img
                                    src={movie.posterPath}
                                    alt={movie.title}
                                    className="w-full h-full object-cover object-center sm:hidden"
                                />
                                {/* Desktop Backdrop Image */}
                                <img
                                    src={movie.backdropPath}
                                    alt={movie.title}
                                    className="w-full h-full object-cover object-top hidden sm:block"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/40 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-light-bg dark:from-dark-bg to-transparent"></div>


                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end items-start text-white p-6 sm:p-12 lg:p-24 pb-20 sm:pb-24 lg:pb-32">
                        <div className="max-w-lg lg:max-w-xl">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider mb-4" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                                {activeMovie.title}
                            </h1>
                            <p className="text-gray-300 mb-4" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
                                {activeMovie.releaseDate?.split('-')[0]} &bull; {activeMovie.genres[0] || activeMovie.category} &bull; {languageMap[activeMovie.originalLanguage] || activeMovie.originalLanguage.toUpperCase()}
                            </p>
                            <p className="text-base md:text-lg line-clamp-3 text-gray-200 h-[4.5rem] md:h-[5.25rem]" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
                                {activeMovie.overview}
                            </p>
                            <div className="flex items-center space-x-4 mt-8" onClick={handleInteraction}>
                                <a href={activeMovie.trailerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-black/40 hover:bg-black/60 text-white font-bold py-3 px-6 rounded-md transition-colors backdrop-blur-sm">
                                    <PlayIcon className="h-6 w-6" />
                                    <span>Watch Trailer</span>
                                </a>
                                <button 
                                    onClick={() => setMovieToAdd(activeMovie)}
                                    className="flex items-center justify-center bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors w-12 h-12 rounded-full"
                                    aria-label="Add to list"
                                >
                                    <PlusIcon className="h-6 w-6 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <button onClick={(e) => { handleInteraction(e); prevSlide(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all duration-300 z-10 opacity-70 hover:opacity-100">
                        <ChevronLeftIcon className="h-8 w-8" />
                    </button>
                    <button onClick={(e) => { handleInteraction(e); nextSlide(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all duration-300 z-10 opacity-70 hover:opacity-100">
                        <ChevronRightIcon className="h-8 w-8" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-10">
                         {paginationIndices.map(index => (
                            <button
                                key={index}
                                onClick={(e) => { handleInteraction(e); goToSlide(index); }}
                                className={`transition-all duration-500 rounded-full ${
                                    index === activeSlide
                                        ? 'w-5 h-2 bg-white'
                                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            ></button>
                         ))}
                    </div>

                    {/* Rating Badge */}
                    {activeMovie.adult && (
                        <div className="absolute bottom-6 right-6 bg-black/50 border border-white/30 text-white text-sm font-semibold px-3 py-1 rounded-md z-10 backdrop-blur-sm">
                            18+
                        </div>
                    )}
                </div>
            )}
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 -mt-16 relative z-10">
                {/* Recently Added */}
                {recentlyAddedMovies.length > 0 && (
                    <section>
                         <h3 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">Recently Added</h3>
                         <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 custom-scrollbar">
                            {recentlyAddedMovies.map(movie => (
                                <MovieCard key={`${movie.id}-${movie.listId}`} movie={movie} listName={movie.listName} listId={movie.listId} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending Now */}
                {trending.length > 0 && (
                     <section>
                         <h3 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">Trending Now</h3>
                         <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 custom-scrollbar">
                            {trending.map(movie => (
                                <TrendingMovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    </section>
                )}


                {/* Categories */}
                {Object.entries(categories).map(([category, movies]) => (
                    movies.length > 0 && (
                        <section key={category}>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">{category}</h3>
                                 <Link to={`/category/${Object.keys(categoryNameMap).find(key => categoryNameMap[key] === category)}`} className="text-primary hover:underline flex items-center space-x-1">
                                    <span>See More</span>
                                    <ChevronRightIcon className="h-4 w-4" />
                                 </Link>
                            </div>
                            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 custom-scrollbar">
                                {movies.slice(0, 10).map(movie => <MovieCard key={movie.id} movie={movie} />)}
                            </div>
                        </section>
                    )
                ))}
            </main>
        </div>
    );
};

const CategoryPage = () => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const category = categorySlug ? categoryNameMap[categorySlug] : undefined;
    
    useEffect(() => {
        if (category) {
            setIsLoading(true);
            api.fetchMoviesByCategory(category).then(data => {
                setMovies(data);
                setIsLoading(false);
            }).catch(err => {
                console.error(err);
                setIsLoading(false);
            })
        }
    }, [category]);

    if(isLoading) return <Spinner />;
    if(!category) return <div className="text-center py-20 text-xl">Category not found.</div>

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex items-center gap-2 mb-8">
                 <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="h-6 w-6" />
                </Link>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{category}</h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 justify-items-center">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
};

const SearchPage = () => {
    const { query } = useParams<{ query: string }>();
    const [results, setResults] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const decodedQuery = useMemo(() => decodeURIComponent(query || ''), [query]);

    useEffect(() => {
        if(decodedQuery) {
            setIsLoading(true);
            api.performSearch(decodedQuery).then(data => {
                setResults(data);
                setIsLoading(false);
            }).catch(err => {
                console.error("Search page error:", err);
                setIsLoading(false);
            });
        }
    }, [decodedQuery]);

    if (isLoading) return <Spinner />;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
             <div className="flex items-center gap-2 mb-8">
                <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="h-6 w-6" />
                </Link>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                    Search Results for "{decodedQuery}"
                </h1>
            </div>
            {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 justify-items-center">
                    {results.map(movie => (
                        <MovieCard key={`${movie.id}-${movie.mediaType}`} movie={movie} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12">
                    <p className="text-xl text-gray-500 dark:text-gray-400">No results found.</p>
                </div>
            )}
        </div>
    );
};

const DetailsPage = () => {
    const { mediaType, id } = useParams<{ mediaType: MediaType, id: string }>();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [recommendations, setRecommendations] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, setMovieToAdd, updateUser } = useContext(AppContext);
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

    // State for seasons and episodes
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [isEpisodesLoading, setIsEpisodesLoading] = useState(false);
    
    const findListItem = useMemo(() => {
        if (!user || !movie) return null;
        const allItems = user.lists.flatMap(l => 
            l.items.map(i => ({ ...i, listId: l.id, listName: l.name }))
        );
        const movieItems = allItems.filter(item => item.movieId === movie.id && item.mediaType === movie.mediaType);
        if (movieItems.length === 0) return null;

        return movieItems.sort((a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime())[0];
    }, [user, movie]);

    useEffect(() => {
        if (mediaType && id) {
            setIsLoading(true);
            setMovie(null);
            setRecommendations([]);
            setEpisodes([]);
            setSelectedSeason(null);
            
            const numId = parseInt(id, 10);
            
            const fetchDetails = async () => {
                try {
                    const [detailsData, recsData] = await Promise.all([
                        api.fetchContentDetails(mediaType, numId),
                        api.fetchRecommendations(mediaType, numId)
                    ]);
                    setMovie(detailsData);
                    setRecommendations(recsData);

                    if (detailsData?.mediaType === 'tv' && detailsData.seasons && detailsData.seasons.length > 0) {
                        const firstSeason = detailsData.seasons.reduce((min, s) => s.season < min.season ? s : min, detailsData.seasons[0]);
                        setSelectedSeason(firstSeason.season);
                    }

                } catch (err) {
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            
            fetchDetails();
        }
    }, [mediaType, id]);

    useEffect(() => {
        if (selectedSeason !== null && id && mediaType === 'tv') {
            setIsEpisodesLoading(true);
            setEpisodes([]);
            api.fetchSeasonDetails(parseInt(id, 10), selectedSeason)
                .then(data => {
                    setEpisodes(data);
                })
                .catch(err => {
                    console.error(`Failed to fetch episodes for season ${selectedSeason}`, err);
                    setEpisodes([]);
                })
                .finally(() => {
                    setIsEpisodesLoading(false);
                });
        }
    }, [selectedSeason, id, mediaType]);


    const handleDownloadImage = async (imageUrl: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            a.download = filename || 'bingeboard-image.jpg';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading image:', error);
            window.open(imageUrl, '_blank');
        }
    };

    const handleSetCoverPhoto = (imageUrl: string) => {
        if (!user) return;
        updateUser({ coverImageUrl: imageUrl });
        setGalleryIndex(null);
    };
    
    const nextGalleryImage = () => {
        if (movie && galleryIndex !== null) {
            setGalleryIndex((prevIndex) => (prevIndex! + 1) % movie.gallery.length);
        }
    };

    const prevGalleryImage = () => {
        if (movie && galleryIndex !== null) {
            setGalleryIndex((prevIndex) => (prevIndex! - 1 + movie.gallery.length) % movie.gallery.length);
        }
    };

    if (isLoading) return <Spinner />;
    if (!movie) return <div className="text-center py-20 text-xl">Movie not found.</div>;
    
    const selectedImage = galleryIndex !== null ? movie.gallery[galleryIndex] : null;
    
    const formatRuntime = (minutes?: number) => {
        if (!minutes || minutes === 0) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        let result = '';
        if (hours > 0) result += `${hours}h `;
        if (mins > 0) result += `${mins}m`;
        return result.trim();
    };

    const formattedRuntime = formatRuntime(movie.runtime);
    const fullReleaseDate = movie.releaseDate && movie.releaseDate !== 'N/A' 
        ? new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : null;

    const detailsItems = [
        fullReleaseDate,
        movie.genres.length > 0 ? movie.genres.join(', ') : null,
        formattedRuntime ? `${formattedRuntime}${movie.mediaType === 'tv' ? ' / episode' : ''}` : null
    ].filter((item): item is string => !!item);

    return (
        <div>
            {/* Backdrop */}
            <div className="relative h-[40vh] sm:h-[50vh] -mt-16">
                <img src={movie.backdropPath} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-light-bg dark:from-dark-bg to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex flex-col sm:flex-row -mt-24 sm:-mt-32 relative space-y-4 sm:space-y-0 sm:space-x-8 items-center sm:items-start">
                    {/* Left Column: Poster */}
                    <div className="w-2/3 sm:w-1/3 lg:w-1/4 flex-shrink-0">
                         <img src={movie.posterPath} alt={movie.title} className="w-full h-auto rounded-lg shadow-2xl" />
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-full sm:w-2/3 lg:w-3/4 pt-0 sm:pt-8 md:pt-16 text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">{movie.title}</h1>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 mt-2 mb-4 text-gray-500 dark:text-gray-400">
                             {detailsItems.map((item, index) => (
                                <React.Fragment key={index}>
                                    <span>{item}</span>
                                    {index < detailsItems.length - 1 && <span className="opacity-50">&middot;</span>}
                                </React.Fragment>
                            ))}
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 mb-6">
                            <div className="flex items-center space-x-2">
                                <StarIcon className="w-6 h-6 text-yellow-400" />
                                <span className="text-xl font-bold">{movie.publicRating.toFixed(1)}</span>
                                <span className="text-sm text-gray-500">/ 10</span>
                            </div>
                             {findListItem && (
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold">Your rating:</span>
                                    <StarRating count={5} rating={findListItem.userRating} size="sm" />
                                </div>
                            )}
                        </div>

                        {findListItem ? (
                            <Link to={`/list/${findListItem.listId}`} className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors mb-6">
                                Watch in List
                            </Link>
                        ) : (
                            <button onClick={() => setMovieToAdd(movie)} className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-primary-hover transition-colors mb-6">
                                Add to List
                            </button>
                        )}

                        <h2 className="text-xl font-bold mb-2">Overview</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">{movie.overview}</p>

                        {/* Where to Watch */}
                         {movie.whereToWatch.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-3">Where to Watch in India</h3>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                    {movie.whereToWatch.map(provider => (
                                        <span key={provider} className="bg-gray-200 dark:bg-dark-card text-sm font-semibold px-3 py-1 rounded-full">{provider}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                 {/* Seasons & Episodes for TV */}
                {movie.mediaType === 'tv' && movie.seasons && movie.seasons.length > 0 && (
                    <section className="mt-12">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold">Seasons & Episodes</h2>
                            {movie.seasons && (
                                <select 
                                    value={selectedSeason ?? ''}
                                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {movie.seasons
                                        .filter(s => s.season > 0) // Often "Specials" are season 0, we can filter them out
                                        .map(s => (
                                            <option key={s.season} value={s.season}>
                                                Season {s.season} ({s.episodes} Episodes)
                                            </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {isEpisodesLoading ? (
                            <Spinner small />
                        ) : (
                            <div className="space-y-4">
                                {episodes.length > 0 ? (
                                    episodes.map(episode => <EpisodeCard key={episode.id} episode={episode} />)
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">No episode information available for this season.</p>
                                )}
                            </div>
                        )}
                    </section>
                )}
                
                 {/* Cast */}
                 {movie.cast.length > 0 && (
                    <section className="mt-12">
                         <h2 className="text-2xl font-bold mb-4">Cast</h2>
                         <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 custom-scrollbar">
                            {movie.cast.map(member => (
                                <div key={member.name} className="text-center w-28 flex-shrink-0">
                                    <img src={member.avatar} alt={member.name} className="w-24 h-24 object-cover rounded-full mb-2 mx-auto" />
                                    <p className="font-bold text-sm truncate">{member.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{member.character}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                 )}

                 {/* Gallery */}
                {movie.gallery.length > 0 && (
                     <section className="mt-12">
                         <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                         <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 custom-scrollbar">
                             {movie.gallery.map((img, index) => (
                                 <div key={index} className="relative w-64 h-40 flex-shrink-0 group rounded-lg overflow-hidden">
                                     <img 
                                         src={img.replace('/original/', '/w500/')}
                                         alt={`Gallery image ${index + 1}`} 
                                         className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110" 
                                         onClick={() => setGalleryIndex(index)}
                                     />
                                 </div>
                             ))}
                         </div>
                     </section>
                )}
                
                {/* Budget/Revenue Section */}
                {((movie.budget && movie.budget > 0) || (movie.revenue && movie.revenue > 0)) && (
                     <section className="mt-12">
                        <h2 className="text-2xl font-bold mb-4">Details</h2>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 p-4 bg-light-card dark:bg-dark-card rounded-lg shadow-md">
                            {/* Removed status */}
                            {movie.budget && movie.budget > 0 && <div><p className="text-sm text-gray-500 dark:text-gray-400">Budget</p><p className="font-bold text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(movie.budget)}</p></div>}
                            {movie.revenue && movie.revenue > 0 && <div><p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p><p className="font-bold text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(movie.revenue)}</p></div>}
                        </div>
                    </section>
                )}


                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <section className="mt-12">
                         <h2 className="text-2xl font-bold mb-4">You Might Also Like</h2>
                         <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 custom-scrollbar">
                            {recommendations.map(rec => (
                                <MovieCard key={rec.id} movie={rec} />
                            ))}
                        </div>
                    </section>
                 )}

            </div>

            {/* Gallery Image Modal */}
            <Modal
                isOpen={galleryIndex !== null}
                onClose={() => setGalleryIndex(null)}
                containerClassName="w-full max-w-6xl h-full max-h-[90vh] bg-transparent shadow-none p-0"
            >
                {selectedImage && (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Move close button to top right, above action buttons */}
                        <button onClick={() => setGalleryIndex(null)} className="absolute top-4 right-4 z-30 text-gray-100 bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors">
                            
                        </button>
                        <img src={selectedImage} alt="Selected gallery image" className="max-h-full max-w-full object-contain rounded-lg" />
                        <button onClick={prevGalleryImage} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 sm:p-3 rounded-full hover:bg-black/60 transition-colors z-20">
                            <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </button>
                        <button onClick={nextGalleryImage} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 sm:p-3 rounded-full hover:bg-black/60 transition-colors z-20">
                            <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </button>
                        <div className="absolute top-16 right-4 flex items-center space-x-4 z-20">
                            <button onClick={() => handleSetCoverPhoto(selectedImage)} className="flex items-center space-x-2 text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-lg transition-colors text-sm font-semibold">
                                <CameraIcon className="w-5 h-5"/>
                                <span>Set as Cover</span>
                            </button>
                            <button onClick={() => handleDownloadImage(selectedImage)} className="flex items-center space-x-2 text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-lg transition-colors text-sm font-semibold">
                               <DownloadIcon className="w-5 h-5"/>
                               <span>Download</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const ProfilePage = () => {
    const { user, createList, importList, exportList, deleteList, renameList, pinList, reorderLists } = useContext(AppContext);
    const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
    const [listToRename, setListToRename] = useState<UserList | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    if (!user) return <Spinner />;

    const pinnedLists = useMemo(() => user.lists.filter(l => l.pinned), [user.lists]);
    const unpinnedLists = useMemo(() => user.lists.filter(l => !l.pinned), [user.lists]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (over && active.id !== over.id) {
            const oldIndex = pinnedLists.findIndex(l => l.id === active.id);
            const newIndex = pinnedLists.findIndex(l => l.id === over.id);
            const newOrderIds = arrayMove(pinnedLists, oldIndex, newIndex).map(l => l.id);
            reorderLists(newOrderIds);
        }
    };

    const handleCreateList = (name: string) => {
        createList(name);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    importList(content);
                } catch (error) {
                    alert("Failed to import list. Please check the file format.");
                    console.error("Import error:", error);
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }
    };

    const handleDeleteList = (listId: string) => {
        if (window.confirm("Are you sure you want to delete this list? This action cannot be undone.")) {
            deleteList(listId);
        }
    };

    const handleRenameList = (newName: string) => {
        if (listToRename) {
            renameList(listToRename.id, newName);
        }
    };

    return (
        <>
            <div className="w-full">
                {/* Cover Photo */}
                <div className="h-60 sm:h-80 lg:h-96 relative bg-dark-card">
                    <img src={user.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black opacity-60"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-light-bg dark:from-dark-bg to-transparent"></div>
                </div>
                
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    {/* Profile Header */}
                    <div className="relative -mt-24 sm:-mt-20 z-10">
                        <div className="flex flex-col items-center sm:flex-row sm:items-end sm:space-x-6">
                            <div className="w-40 h-40 rounded-full border-4 border-light-bg dark:border-dark-bg flex-shrink-0 bg-dark-card">
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div className="flex-grow w-full text-center sm:text-left mt-4 sm:mt-0 sm:pb-4">
                                <h1 className="text-3xl font-bold">{user.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">{user.bio}</p>
                            </div>
                        </div>
                        {/* Settings Button */}
                        <button
                            onClick={() => navigate('/settings')}
                            className="absolute top-0 right-0 mt-4 sm:top-auto sm:bottom-0 sm:mb-4 flex-shrink-0 bg-gray-200 dark:bg-dark-card font-bold p-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center"
                            aria-label="Settings"
                        >
                           <SettingsIcon className="w-6 h-6"/>
                        </button>
                    </div>

                    {/* Actions and Lists */}
                    <div className="mt-12">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold">My Lists</h2>
                            <div className="flex items-center space-x-2">
                                <button onClick={handleImportClick} className="bg-gray-200 dark:bg-dark-card font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">Import List</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                                <button onClick={() => setIsCreateListModalOpen(true)} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors">Create New List</button>
                            </div>
                        </div>

                        {/* Lists Content */}
                        {user.lists.length > 0 ? (
                            <div className="space-y-12">
                                {/* Pinned Lists */}
                                {pinnedLists.length > 0 && (
                                    <section>
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <BsPinAngleFill className="w-5 h-5 text-primary"/>
                                            Pinned Lists
                                        </h3>
                                         <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={pinnedLists.map(l => l.id)}
                                                strategy={rectSortingStrategy}
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {pinnedLists.map(list => (
                                                        <ListCard 
                                                            key={list.id} 
                                                            list={list}
                                                            onPin={pinList}
                                                            onRename={setListToRename}
                                                            onShare={exportList}
                                                            onDelete={handleDeleteList}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </section>
                                )}

                                 {/* Unpinned Lists */}
                                 {unpinnedLists.length > 0 && (
                                    <section>
                                        {pinnedLists.length > 0 && <hr className="border-gray-200 dark:border-gray-700"/>}
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            More Lists
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {unpinnedLists.map(list => (
                                                 <ListCard 
                                                    key={list.id} 
                                                    list={list}
                                                    onPin={pinList}
                                                    onRename={setListToRename}
                                                    onShare={exportList}
                                                    onDelete={handleDeleteList}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                 )}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">You haven't created any lists yet.</p>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Click "Create New List" to get started!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <CreateListModal isOpen={isCreateListModalOpen} onClose={() => setIsCreateListModalOpen(false)} onCreate={handleCreateList} />
            {listToRename && (
                <RenameListModal
                    isOpen={!!listToRename}
                    onClose={() => setListToRename(null)}
                    onRename={handleRenameList}
                    currentName={listToRename.name}
                />
            )}
        </>
    );
};

const ListPage = () => {
    const { listId } = useParams<{ listId: string }>();
    const { exportList } = useContext(AppContext);
    const [listDetails, setListDetails] = useState<{ list: UserList; detailedItems: DetailedListItem[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (listId) {
            setIsLoading(true);
            api.getListDetails(listId).then(data => {
                setListDetails(data);
                setIsLoading(false);
            }).catch(err => {
                console.error(err);
                setIsLoading(false);
            });
        }
    }, [listId]);
    
    const handleExport = () => {
        if(listId) {
            exportList(listId);
        }
    };

    const groupedMovies = useMemo(() => {
        if (!listDetails) return {};
        return listDetails.detailedItems.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, DetailedListItem[]>);
    }, [listDetails]);

    const categoryOrder = Object.values(MovieCategory);

    const sortedCategories = useMemo(() => {
        return Object.keys(groupedMovies).sort((a, b) => {
            const indexA = categoryOrder.indexOf(a as MovieCategory);
            const indexB = categoryOrder.indexOf(b as MovieCategory);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [groupedMovies]);

    if (isLoading) return <Spinner />;
    if (!listDetails) return <div className="text-center py-20 text-xl">List not found.</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{listDetails.list.name}</h1>
                </div>
                <button onClick={handleExport} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors flex items-center space-x-2">
                    <ShareIcon className="w-5 h-5" />
                    <span>Export List</span>
                </button>
            </div>
            
            {listDetails.detailedItems.length > 0 ? (
                <div className="space-y-12">
                    {sortedCategories.map(category => {
                        const items = groupedMovies[category];
                        const categorySlug = Object.keys(categoryNameMap).find(key => categoryNameMap[key] === category as MovieCategory) || category.toLowerCase().replace(/\s+/g, '-');
                         return (
                            <section key={category}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">{category}</h3>
                                    {items.length > 8 && (
                                        <Link to={`/list/${listId}/${categorySlug}`} className="text-primary hover:underline flex items-center space-x-1">
                                            <span>See All</span>
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </Link>
                                    )}
                                </div>
                                <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 custom-scrollbar">
                                    {items.slice(0, 8).map(movie => (
                                        <MovieCard key={movie.id} movie={movie} />
                                    ))}
                                </div>
                            </section>
                         )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">This list is empty.</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Add some movies to see them here!</p>
                </div>
            )}
        </div>
    );
};

const ListCategoryPage = () => {
    const { listId, categorySlug } = useParams<{ listId: string, categorySlug: string }>();
    const [listDetails, setListDetails] = useState<{ list: UserList; detailedItems: DetailedListItem[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [monthFilter, setMonthFilter] = useState(''); // e.g., "2024-06"
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const categoryName = useMemo(() => categorySlug ? categoryNameMap[categorySlug] : undefined, [categorySlug]);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    
    useEffect(() => {
        if (listId) {
            setIsLoading(true);
            api.getListDetails(listId).then(data => {
                setListDetails(data);
                setIsLoading(false);
            }).catch(err => {
                console.error(err);
                setIsLoading(false);
            });
        }
    }, [listId]);
    
    const handleResetFilters = () => {
        setSearchQuery('');
        setMonthFilter('');
        setFromDate('');
        setToDate('');
        setIsFilterPanelOpen(false);
    };

    const filteredAndGroupedItems = useMemo(() => {
        if (!listDetails || !categoryName) return {};

        let items = listDetails.detailedItems.filter(item => item.category === categoryName);

        if (debouncedSearchQuery) {
            items = items.filter(item => item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
        }
        
        if (monthFilter) {
            items = items.filter(item => item.addedOn.startsWith(monthFilter));
        } else if (fromDate && toDate) {
            // Only apply date range if month filter is not active
            const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0); 
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            
            items = items.filter(item => {
                const itemDate = new Date(item.addedOn);
                return itemDate >= start && itemDate <= end;
            });
        }
        
        return items.reduce((acc, item) => {
            const monthYear = new Date(item.addedOn).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(item);
            return acc;
        }, {} as Record<string, DetailedListItem[]>);

    }, [listDetails, categoryName, debouncedSearchQuery, monthFilter, fromDate, toDate]);

    const availableMonths = useMemo(() => {
        if (!listDetails || !categoryName) return [];
        const categoryItems = listDetails.detailedItems.filter(item => item.category === categoryName);
        const months = new Set(categoryItems.map(item => item.addedOn.substring(0, 7)));
        return Array.from(months).sort().reverse();
    }, [listDetails, categoryName]);
    
    if (isLoading) return <Spinner />;
    if (!listDetails || !categoryName) return <div className="text-center py-20 text-xl">List or Category not found.</div>;

    const monthKeys = Object.keys(filteredAndGroupedItems).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex items-start gap-2 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mt-1">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{listDetails.list.name}</h1>
                    <h2 className="text-xl text-gray-500 dark:text-gray-400">{categoryName}</h2>
                </div>
            </div>

            <div className="p-4 bg-light-card dark:bg-dark-card rounded-lg shadow-md mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow w-full">
                        <input
                            type="text"
                            placeholder="Search in this category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
                        <button
                            onClick={() => setIsFilterPanelOpen(prev => !prev)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${isFilterPanelOpen ? 'bg-primary/20 text-primary' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
                            aria-controls="filter-panel"
                            aria-expanded={isFilterPanelOpen}
                        >
                            <FilterIcon className="w-5 h-5" />
                            <span>Filter</span>
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <ResetIcon className="w-5 h-5" />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                {isFilterPanelOpen && (
                    <div id="filter-panel" className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By Month Added</label>
                                <select
                                    id="month-filter"
                                    value={monthFilter}
                                    onChange={(e) => {
                                        setMonthFilter(e.target.value);
                                        setFromDate(''); setToDate('');
                                    }}
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">All Months</option>
                                    {availableMonths.map(month => (
                                        <option key={month} value={month}>
                                            {new Date(month + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By Date Range</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="date"
                                        aria-label="From Date"
                                        value={fromDate}
                                        onChange={e => { setFromDate(e.target.value); setMonthFilter(''); }}
                                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <span className="text-gray-500 dark:text-gray-400">to</span>
                                    <input
                                        type="date"
                                        aria-label="To Date"
                                        value={toDate}
                                        onChange={e => { setToDate(e.target.value); setMonthFilter(''); }}
                                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        min={fromDate}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {monthKeys.length > 0 ? (
                <div className="space-y-12">
                    {monthKeys.map(monthYear => (
                         <section key={monthYear}>
                             <h3 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                                <CalendarIcon className="w-6 h-6 text-gray-500" />
                                {monthYear}
                            </h3>
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 justify-items-center">
                                {filteredAndGroupedItems[monthYear].map(item => (
                                    <MovieCard key={item.id} movie={item} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No movies match your filters.</p>
                </div>
            )}
        </div>
    );
};

const SettingsPage = () => {
    const { user, theme, toggleTheme, logout } = useContext(AppContext);
    const navigate = useNavigate();

    if (!user) return <Spinner />;

    const settingsOptions = [
        { name: 'Edit Profile', icon: <EditIcon className="w-6 h-6"/>, action: () => navigate('/settings/edit-profile') },
        { name: 'Change Theme', icon: theme === 'dark' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>, action: toggleTheme, isToggle: true },
        { name: 'Feedback', icon: <EmailIcon className="w-6 h-6"/>, action: () => navigate('/feedback') },
    ];

    const handleSignOut = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex items-center gap-2 mb-8">
                <button onClick={() => navigate('/profile')} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Settings</h1>
            </div>

            <div className="flex flex-col items-center mb-8">
                <img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-primary/50" />
                <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>

            <div className="space-y-4">
                <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md p-2">
                    {settingsOptions.map(opt => (
                        <div key={opt.name} onClick={!opt.isToggle ? opt.action : undefined} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-primary">{opt.icon}</span>
                                <span className="font-semibold">{opt.name}</span>
                            </div>
                            {opt.isToggle ? <ToggleSwitch isToggled={theme === 'dark'} onToggle={toggleTheme} /> : <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
                        </div>
                    ))}
                </div>

                <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md p-4 flex items-center justify-between">
                     <span className="font-semibold">App Version</span>
                     <span className="text-gray-500 dark:text-gray-400">2.5.04</span>
                </div>

                <button 
                    onClick={handleSignOut}
                    className="w-full mt-4 flex items-center justify-center gap-3 p-4 bg-red-500/10 text-red-500 font-bold rounded-lg hover:bg-red-500/20 transition-colors"
                >
                    <LogoutIcon className="w-6 h-6"/>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

const EditProfilePage = () => {
    const { user, updateUser } = useContext(AppContext);
    const navigate = useNavigate();
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [coverImageUrl, setCoverImageUrl] = useState(user?.coverImageUrl || '');

    if (!user) return <Spinner />;
    
    // Avatar images: /1.png ... /10.png in public
    const presetAvatars = useMemo(() => Array.from({ length: 10 }, (_, i) => `/${i + 1}.png`), []);
    // Cover images: /Cover/1.png ... /Cover/4.png in public/Cover
    const presetCovers = useMemo(() => Array.from({ length: 4 }, (_, i) => `/Cover/${i + 1}.png`), []);

    const handleSave = () => {
        updateUser({ name, bio, avatarUrl, coverImageUrl });
        navigate('/settings');
    };

    return (
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex items-center gap-2 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Edit Profile</h1>
            </div>

            <div className="space-y-6 bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md">
                {/* Show selected avatar large */}
                <div className="flex flex-col items-center mb-4">
                    <img src={avatarUrl || '/1.png'} alt="Selected Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-primary/50 mb-2" />
                    <span className="text-gray-500 text-sm">Current Avatar</span>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose Avatar</label>
                    <div className="grid grid-cols-5 gap-3">
                        {presetAvatars.map(url => (
                            <button key={url} onClick={() => setAvatarUrl(url)} className={`w-16 h-16 p-0 border-0 rounded-full transition-all duration-200 focus:outline-none ${avatarUrl === url ? 'ring-4 ring-primary ring-offset-2 dark:ring-offset-dark-card' : 'hover:scale-110'}`}>
                                <img src={url} alt={`Avatar option ${url.split('/').pop()}`} className="w-full h-full object-cover rounded-full" />
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose Cover Art</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {presetCovers.map(url => (
                            <button key={url} onClick={() => setCoverImageUrl(url)} className={`rounded-lg transition-all duration-200 ${coverImageUrl === url ? 'ring-4 ring-primary ring-offset-2 dark:ring-offset-dark-card' : 'hover:scale-105'}`}>
                                <img src={url} alt={`Cover option ${url.split('/').pop()}`} className="w-full h-24 object-cover rounded-md" />
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const FeedbackPage = () => {
    const navigate = useNavigate();
    const [feedbackText, setFeedbackText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImages(prev => [...prev, ...filesArray]);

            const previews = filesArray.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...previews]);
        }
    };
    
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            // Revoke object URL to prevent memory leaks
            URL.revokeObjectURL(prev[index]);
            return newPreviews;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would upload images and text here
        alert(`Feedback submitted with ${images.length} image(s). Thank you!`);
        navigate('/settings');
    };
    
    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);


    return (
         <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex items-center gap-2 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Feedback</h1>
            </div>
            
            <div className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6 bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <div>
                        <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Feedback</label>
                        <textarea id="feedback-text" name="feedback" rows={6} required value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Tell us what you think..."></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attach Images (Optional)</label>
                        <div 
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <p className="pl-1">Click to upload or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, up to 5MB</p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/png, image/jpeg"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {imagePreviews.map((previewUrl, index) => (
                                <div key={index} className="relative group">
                                    <img src={previewUrl} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Remove image"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                     <div className="flex justify-end">
                        <button type="submit" disabled={!feedbackText.trim()} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">Submit Feedback</button>
                    </div>
                </form>

                <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Contact Us</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">If you need direct assistance, please feel free to email our support team.</p>
                    <a href="mailto:ishubham1312@gmail.com" className="inline-flex items-center gap-3 bg-gray-200 dark:bg-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <EmailIcon className="w-5 h-5"/>
                        <span>Contact Support</span>
                    </a>
                </div>
            </div>
         </div>
    );
};

const SignInPage = () => {
    const { login } = useContext(AppContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('alex.doe@example.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password.');
            setIsLoggingIn(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoggingIn(true);
        try {
            await login('alex.doe@example.com', 'password'); // Mock google sign in
            navigate('/');
        } catch (err) {
            setError('Google sign-in failed.');
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 w-full h-full overflow-hidden z-0 flex">
                {/* Repeat the background image 3 times for a seamless illusion */}
                <div className="flex w-full h-full" style={{ minWidth: '300%' }}>
                    <img src="/services/bg.png" alt="background" className="w-full h-full object-cover flex-shrink-0" style={{ pointerEvents: 'none', opacity: 0.5, animation: 'bg-move 30s linear infinite', minWidth: '100%' }} />
                    <img src="/services/bg.png" alt="background" className="w-full h-full object-cover flex-shrink-0" style={{ pointerEvents: 'none', opacity: 0.5, animation: 'bg-move 30s linear infinite', minWidth: '100%' }} />
                    <img src="/services/bg.png" alt="background" className="w-full h-full object-cover flex-shrink-0" style={{ pointerEvents: 'none', opacity: 0.5, animation: 'bg-move 30s linear infinite', minWidth: '100%' }} />
                </div>
            </div>
            <div className="absolute inset-0 animated-gradient-bg z-10" style={{ opacity: 0.7 }} />
            <div className="relative z-20 max-w-md w-full space-y-8 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-light-text dark:text-dark-text">
                        Sign in to BingeBoard
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
                    {error && <p className="text-center text-red-500">{error}</p>}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email address
                            </label>
                            <input id="email-address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-800/50 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="email@example.com" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-800/50 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="••••••••" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={isLoggingIn} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                            {isLoggingIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-light-card/80 dark:bg-dark-card/80 text-gray-500">Or continue with</span></div>
                </div>
                <div>
                     <button onClick={handleGoogleSignIn} disabled={isLoggingIn} className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-light-text dark:text-dark-text bg-light-card/80 dark:bg-dark-card/80 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        Sign in with Google
                    </button>
                </div>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-medium text-primary hover:text-primary-hover">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

const SignUpPage = () => {
    const { login } = useContext(AppContext);
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        // Mock sign up then login
        console.log("Creating account for:", name, email);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Could not create account.');
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 w-full h-full overflow-hidden z-0 flex">
                {/* Repeat the background image 3 times for a seamless illusion */}
                <div className="flex w-full h-full" style={{ minWidth: '300%' }}>
                    <img src="/services/bg.png" alt="background" className="w-full h-full object-cover flex-shrink-0" style={{ pointerEvents: 'none', opacity: 0.5, animation: 'bg-move 30s linear infinite', minWidth: '100%' }} />
                    <img src="/services/bg.png" alt="background" className="w-full h-full object-cover flex-shrink-0" style={{ pointerEvents: 'none', opacity: 0.5, animation: 'bg-move 30s linear infinite', minWidth: '100%' }} />
                    <img src="/services/bg.png" alt="background" className="w-full h-full object-cover flex-shrink-0" style={{ pointerEvents: 'none', opacity: 0.5, animation: 'bg-move 30s linear infinite', minWidth: '100%' }} />
                </div>
            </div>
            <div className="absolute inset-0 animated-gradient-bg z-10" style={{ opacity: 0.7 }} />
            <div className="relative z-20 max-w-md w-full space-y-8 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-light-text dark:text-dark-text">
                        Create your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                    {error && <p className="text-center text-red-500">{error}</p>}
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name
                            </label>
                            <input id="name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-800/50 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Alex Doe" />
                        </div>
                        <div>
                            <label htmlFor="email-address-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email address
                            </label>
                            <input id="email-address-signup" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-800/50 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="email@example.com" />
                        </div>
                        <div>
                            <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input id="password-signup" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-800/50 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="••••••••" />
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
                 <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-light-card/80 dark:bg-dark-card/80 text-gray-500">Or sign up with</span></div>
                </div>
                 <div>
                     <button disabled={isSubmitting} className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-light-text dark:text-dark-text bg-light-card/80 dark:bg-dark-card/80 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        Sign up with Google
                    </button>
                </div>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Mock sending email
        setTimeout(() => {
            setMessage(`If an account exists for ${email}, a password reset link has been sent.`);
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animated-gradient-bg">
            <div className="max-w-md w-full space-y-8 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-light-text dark:text-dark-text">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Enter your email and we'll send you a link to get back into your account.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {message && <p className="text-center text-green-500">{message}</p>}
                    <div>
                        <label htmlFor="email-address-forgot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email address
                        </label>
                        <input id="email-address-forgot" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-800/50 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Enter your email" />
                    </div>

                    <div>
                        <button type="submit" disabled={isSubmitting || !!message} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
                        &larr; Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};


const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [movieToAdd, setMovieToAdd] = useState<Movie | null>(null);
    const [theme, setTheme] = useState('dark');
    
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';

        // @ts-ignore
        if (!document.startViewTransition) {
            setTheme(newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            localStorage.setItem('theme', newTheme);
            return;
        }

        // @ts-ignore
        document.startViewTransition(() => {
            setTheme(newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            localStorage.setItem('theme', newTheme);
        });
    };

    useEffect(() => {
        // In a real app, you'd check for a token here. For this mock, we just start logged out.
        setIsLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        const userData = await api.login(email, pass);
        if (userData) {
            setUser(userData);
        } else {
            throw new Error("Login failed");
        }
    };
    
    const logout = () => {
        setUser(null);
        // In a real app, you'd clear the token from localStorage here
    };

    const updateUser = async (updatedData: Partial<User>) => {
        if (!user) return;
        const updatedUser = await api.updateUser(updatedData);
        setUser(updatedUser);
    };

    const addMovieToList = async (listId: string, movieId: number, mediaType: MediaType, rating: number, watchedEpisodes?: number[]) => {
        const updatedUser = await api.addMovieToList(listId, movieId, mediaType, rating, watchedEpisodes);
        setUser(updatedUser);
    };

    const createList = async (name: string): Promise<UserList | undefined> => {
        const updatedUser = await api.createList(name);
        setUser(updatedUser);
        // Find the newly created list to return its ID. It will be the last one.
        return updatedUser.lists[updatedUser.lists.length - 1];
    };

    const deleteList = async (listId: string) => {
        const updatedUser = await api.deleteList(listId);
        setUser(updatedUser);
    };

    const renameList = async (listId: string, newName: string) => {
        const updatedUser = await api.renameList(listId, newName);
        setUser(updatedUser);
    };
    
    const pinList = async (listId: string) => {
        const updatedUser = await api.pinList(listId);
        setUser(updatedUser);
    };

    const reorderLists = async (orderedIds: string[]) => {
        if (!user) return;
        // Optimistic update for instant UI feedback
        const currentLists = user.lists;
        const listMap = new Map(currentLists.map(l => [l.id, l]));
        const orderedPinned = orderedIds.map(id => listMap.get(id)).filter((l): l is UserList => !!l);
        const unpinned = currentLists.filter(l => !l.pinned);
        setUser({ ...user, lists: [...orderedPinned, ...unpinned] });
    
        // Persist change to the backend
        const updatedUser = await api.reorderLists(orderedIds);
        setUser(updatedUser);
    };

    const importList = async (jsonContent: string) => {
        const updatedUser = await api.importList(jsonContent);
        setUser(updatedUser);
        alert('List imported successfully!');
    };
    
    const exportList = async (listId: string) => {
        try {
            const listJson = await api.exportList(listId);
            const blob = new Blob([listJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const list = user?.lists.find(l => l.id === listId);
            a.download = `${list?.name.replace(/\s+/g, '_') || 'list'}.json`;
            a.href = url;
            a.click();
            URL.revokeObjectURL(url);
        } catch(e) {
            console.error("Failed to export list", e);
            alert("Failed to export list.");
        }
    };
    
    const appContextValue: IAppContext = {
        user,
        isLoading,
        login,
        logout,
        movieToAdd,
        setMovieToAdd,
        addMovieToList,
        createList,
        deleteList,
        renameList,
        pinList,
        reorderLists,
        updateUser,
        importList,
        exportList,
        theme,
        toggleTheme
    };

    if (isLoading) return <Spinner />;


    return (
        <AppContext.Provider value={appContextValue}>
            <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen">
                {user && <Navbar />}
                <Routes>
                    {user ? (
                        <>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/category/:categorySlug" element={<CategoryPage />} />
                            <Route path="/details/:mediaType/:id" element={<DetailsPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/list/:listId" element={<ListPage />} />
                            <Route path="/list/:listId/:categorySlug" element={<ListCategoryPage />} />
                            <Route path="/search/:query" element={<SearchPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/settings/edit-profile" element={<EditProfilePage />} />
                            <Route path="/feedback" element={<FeedbackPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                       <>
                            <Route path="/login" element={<SignInPage />} />
                            <Route path="/signup" element={<SignUpPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="*" element={<Navigate to="/login" />} />
                       </>
                    )}
                </Routes>
                {movieToAdd && user && (
                     <AddToListModal
                        isOpen={!!movieToAdd}
                        onClose={() => setMovieToAdd(null)}
                        movie={movieToAdd}
                    />
                )}
            </div>
        </AppContext.Provider>
    );
};

export default App;