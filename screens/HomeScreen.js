import {View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView} from 'react-native';
import React, {useState, useEffect} from 'react';
import { Feather } from '@expo/vector-icons';
import Carousel from 'react-native-snap-carousel';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../config';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72;

export default function HomeScreen({ navigation }){
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [page, setPage] = useState({
        trending: 1,
        upcoming: 1,
        topRated: 1
    });
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        getTrendingMovies();
        getUpcomingMovies();
        getTopRatedMovies();
    }, []);

    const getTrendingMovies = async (loadMore = false) => {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/3/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page.trending}`
            );
            const data = await response.json();
            setTrendingMovies(prev => loadMore ? [...prev, ...data.results] : data.results);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const getUpcomingMovies = async (loadMore = false) => {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/3/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page.upcoming}`
            );
            const data = await response.json();
            setUpcomingMovies(prev => loadMore ? [...prev, ...data.results] : data.results);
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
        }
    };

    const getTopRatedMovies = async (loadMore = false) => {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/3/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page.topRated}`
            );
            const data = await response.json();
            setTopRatedMovies(prev => loadMore ? [...prev, ...data.results] : data.results);
        } catch (error) {
            console.error('Error fetching top rated movies:', error);
        }
    };

    const loadMore = async () => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            
            // Increment pages
            const newPage = {
                trending: page.trending + 1,
                upcoming: page.upcoming + 1,
                topRated: page.topRated + 1
            };
            setPage(newPage);

            // Fetch new data with updated page numbers
            const [trendingResponse, upcomingResponse, topRatedResponse] = await Promise.all([
                fetch(`${TMDB_BASE_URL}/3/trending/movie/week?api_key=${TMDB_API_KEY}&page=${newPage.trending}`),
                fetch(`${TMDB_BASE_URL}/3/movie/upcoming?api_key=${TMDB_API_KEY}&page=${newPage.upcoming}`),
                fetch(`${TMDB_BASE_URL}/3/movie/top_rated?api_key=${TMDB_API_KEY}&page=${newPage.topRated}`)
            ]);

            const [trendingData, upcomingData, topRatedData] = await Promise.all([
                trendingResponse.json(),
                upcomingResponse.json(),
                topRatedResponse.json()
            ]);

            // Update state with new data
            setTrendingMovies(prev => [...prev, ...trendingData.results]);
            setUpcomingMovies(prev => [...prev, ...upcomingData.results]);
            setTopRatedMovies(prev => [...prev, ...topRatedData.results]);
        } catch (error) {
            console.error('Error loading more movies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMovieItem = ({item}) => {
        const formattedMovie = {
            id: item.id,
            poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            title: item.title,
            year: new Date(item.release_date).getFullYear(),
            duration: item.runtime || 120, // Default duration since TMDB doesn't provide it in list view
            genres: item.genre_ids?.map(id => getGenreName(id)) || [],
            description: item.overview,
            cast: [], // We'll need to fetch this separately
        };

        return (
            <TouchableOpacity 
                style={styles.movieCard}
                onPress={async () => {
                    const details = await fetchMovieDetails(item.id);
                    if (details) {
                        const formattedMovie = {
                            id: item.id,
                            poster: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
                            title: details.title,
                            year: new Date(details.release_date).getFullYear(),
                            duration: details.runtime,
                            genres: details.genres.map(g => g.name),
                            description: details.overview,
                            cast: details.cast,
                            rating: details.vote_average.toFixed(1),
                        };
                        navigation.navigate('Movie', { movie: formattedMovie });
                    }
                }}
            >
                <Image
                    source={{ uri: formattedMovie.poster }}
                    style={styles.movieImage}
                    loading="lazy"
                    fadeDuration={300}
                    cachePolicy="memory-disk"
                />
            </TouchableOpacity>
        );
    };

    const MovieCard = React.memo(({ item }) => {
        const formattedMovie = {
            id: item.id,
            poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            title: item.title,
            year: new Date(item.release_date).getFullYear(),
            duration: item.runtime || 120,
            genres: item.genre_ids?.map(id => getGenreName(id)) || [],
            description: item.overview,
            cast: [],
        };

        return (
            <TouchableOpacity 
                style={styles.smallMovieCard}
                onPress={async () => {
                    const details = await fetchMovieDetails(item.id);
                    if (details) {
                        const formattedMovie = {
                            id: item.id,
                            poster: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
                            title: details.title,
                            year: new Date(details.release_date).getFullYear(),
                            duration: details.runtime,
                            genres: details.genres.map(g => g.name),
                            description: details.overview,
                            cast: details.cast,
                            rating: details.vote_average.toFixed(1),
                        };
                        navigation.navigate('Movie', { movie: formattedMovie });
                    }
                }}
            >
                <Image
                    source={{ uri: formattedMovie.poster }}
                    style={styles.smallMovieImage}
                    loading="lazy"
                    fadeDuration={300}
                    cachePolicy="memory-disk"
                />
                <Text style={styles.smallMovieTitle} numberOfLines={1}>
                    {item.title}
                </Text>
            </TouchableOpacity>
        );
    });

    const MovieList = React.memo(({ title, data }) => (
        <View style={styles.movieSection}>
            <Text style={styles.header}>{title}</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={5}
                initialNumToRender={5}
            >
                {data.map((item) => (
                    <MovieCard key={item.id} item={item} />
                ))}
            </ScrollView>
        </View>
    ));

    const getGenreName = (genreId) => {
        const genres = {
            28: 'Action',
            12: 'Adventure',
            16: 'Animation',
            35: 'Comedy',
            80: 'Crime',
            99: 'Documentary',
            18: 'Drama',
            10751: 'Family',
            14: 'Fantasy',
            36: 'History',
            27: 'Horror',
            10402: 'Music',
            9648: 'Mystery',
            10749: 'Romance',
            878: 'Science Fiction',
            10770: 'TV Movie',
            53: 'Thriller',
            10752: 'War',
            37: 'Western'
        };
        return genres[genreId] || 'Unknown';
    };

    const fetchMovieDetails = async (movieId) => {
        try {
            const [movieResponse, creditsResponse] = await Promise.all([
                fetch(`${TMDB_BASE_URL}/3/movie/${movieId}?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE_URL}/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
            ]);

            const movieData = await movieResponse.json();
            const creditsData = await creditsResponse.json();

            return {
                ...movieData,
                cast: creditsData.cast.slice(0, 10).map(actor => ({
                    name: actor.name,
                    photo: `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                }))
            };
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    };

    const MovieGrid = React.memo(({ movies }) => {
        // Remove duplicates and add a unique identifier for the source
        const uniqueMovies = [...new Map(movies.map(movie => [movie.id, movie])).values()];
        
        return (
            <View style={styles.gridContainer}>
                {uniqueMovies.map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        style={styles.gridCard}
                        onPress={async () => {
                            const details = await fetchMovieDetails(item.id);
                            if (details) {
                                const formattedMovie = {
                                    id: item.id,
                                    poster: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
                                    title: details.title,
                                    year: new Date(details.release_date).getFullYear(),
                                    duration: details.runtime,
                                    genres: details.genres.map(g => g.name),
                                    description: details.overview,
                                    cast: details.cast,
                                    rating: details.vote_average.toFixed(1),
                                };
                                navigation.navigate('Movie', { movie: formattedMovie });
                            }
                        }}
                    >
                        <Image
                            source={{ 
                                uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`
                            }}
                            style={styles.gridImage}
                            loading="lazy"
                        />
                        <Text style={styles.gridMovieTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    });

    return(
        <ScrollView 
            style={styles.container}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={5}
            onScroll={({nativeEvent}) => {
                const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
                const paddingToBottom = 50;
                const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
                    contentSize.height - paddingToBottom;
                
                if (isCloseToBottom && !isLoading) {
                    console.log('Loading more movies...'); // Debug log
                    loadMore();
                }
            }}
            scrollEventThrottle={16}
        >
            <View style={styles.appBar}>
                <View style={{width: 24}} />
                <View style={styles.titleContainer}>
                    <Text style={styles.appBarTitleYellow}>M</Text>
                    <Text style={styles.appBarTitleWhite}>ovies</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <Feather name="search" size={24} color="white" />
                </TouchableOpacity>
            </View>
            
            <View>
                <Text style={styles.header}>Trending</Text>
                <Carousel
                    data={trendingMovies}
                    renderItem={renderMovieItem}
                    sliderWidth={width}
                    itemWidth={ITEM_WIDTH}
                    inactiveSlideScale={0.95}
                    inactiveSlideOpacity={0.7}
                    enableMomentum={true}
                    activeSlideAlignment={'start'}
                    containerCustomStyle={styles.movieList}
                    slideStyle={{ marginRight: 16 }}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    initialNumToRender={5}
                />
            </View>

            <MovieList title="Upcoming" data={upcomingMovies} />
            <MovieList title="Top Rated" data={topRatedMovies} />
            
            <Text style={[styles.header, { marginTop: 20 }]}>Now Streaming</Text>
            <MovieGrid movies={[...trendingMovies, ...upcomingMovies, ...topRatedMovies]} />
            
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading more movies...</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#333333',
    },
    appBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 35,
        paddingBottom: 10,
        backgroundColor: '#333333',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appBarTitleYellow: {
        color: '#FFD700',
        fontSize: 27,
        fontWeight: 'bold',
    },
    appBarTitleWhite: {
        color: '#fff',
        fontSize: 27,
        fontWeight: 'bold',
    },
    header: {
        color: '#fff',
        fontSize: 20,
        marginLeft: 20,
        marginTop: 5,
        marginBottom: 16,
    },
    movieList: {
        paddingHorizontal: 16,
    },
    movieCard: {
        width: ITEM_WIDTH,
        marginRight: 16,
    },
    movieImage: {
        width: '100%',
        height: ITEM_WIDTH * 1.5,
        borderRadius: 24,
        marginBottom: 8,
    },
    movieTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    movieSection: {
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    seeAll: {
        color: '#FFD700',
        fontSize: 16,
    },
    smallMovieCard: {
        width: 140,
        marginLeft: 20,
    },
    smallMovieImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 8,
    },
    smallMovieTitle: {
        color: '#fff',
        fontSize: 14,
        width: '100%',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFD700',
        fontSize: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    gridCard: {
        width: (width - 48) / 2, // 2 columns with 16px padding on sides and 16px between
        marginBottom: 20,
    },
    gridImage: {
        width: '100%',
        height: ((width - 48) / 2) * 1.5, // Maintain aspect ratio
        borderRadius: 16,
        marginBottom: 8,
    },
    gridMovieTitle: {
        color: '#fff',
        fontSize: 14,
        width: '100%',
    },
});