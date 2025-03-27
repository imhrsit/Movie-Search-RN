import {View, Text, StyleSheet, Image, ScrollView, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons'; // Make sure to install this package
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MovieScreen({ route, navigation }){
    const { movie } = route.params;
    const [similarMovies, setSimilarMovies] = useState([]);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        fetchSimilarMovies();
        checkWishlistStatus();
    }, []);

    const fetchSimilarMovies = async () => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=2bd579dccedea6421279acb41d1adc7d`
            );
            const data = await response.json();
            setSimilarMovies(data.results);
        } catch (error) {
            console.error('Error fetching similar movies:', error);
        }
    };

    const checkWishlistStatus = async () => {
        try {
            const wishlist = await AsyncStorage.getItem('wishlist');
            const wishlistArray = wishlist ? JSON.parse(wishlist) : [];
            setIsWishlisted(wishlistArray.some(item => item.id === movie.id));
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    };

    const toggleWishlist = async () => {
        try {
            const wishlist = await AsyncStorage.getItem('wishlist');
            const wishlistArray = wishlist ? JSON.parse(wishlist) : [];

            if (isWishlisted) {
                const newWishlist = wishlistArray.filter(item => item.id !== movie.id);
                await AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
            } else {
                wishlistArray.push(movie);
                await AsyncStorage.setItem('wishlist', JSON.stringify(wishlistArray));
            }

            setIsWishlisted(!isWishlisted);
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    const fetchMovieDetails = async (movieId) => {
        try {
            const [movieResponse, creditsResponse] = await Promise.all([
                fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=2bd579dccedea6421279acb41d1adc7d`),
                fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=2bd579dccedea6421279acb41d1adc7d`)
            ]);

            const movieData = await movieResponse.json();
            const creditsData = await creditsResponse.json();

            return {
                ...movieData,
                cast: creditsData.cast.slice(0, 10).map(actor => ({
                    id: actor.id,
                    name: actor.name,
                    photo: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : null
                }))
            };
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    };

    const SimilarMovieCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.similarMovieCard}
            onPress={async () => {
                const details = await fetchMovieDetails(item.id);
                if (details) {
                    navigation.push('Movie', { movie: {
                        id: item.id,
                        poster: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
                        title: details.title,
                        year: new Date(details.release_date).getFullYear(),
                        duration: details.runtime,
                        genres: details.genres.map(g => g.name),
                        description: details.overview,
                        cast: details.cast,
                        rating: details.vote_average.toFixed(1),
                    }});
                }
            }}
        >
            <Image
                source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                style={styles.similarMoviePoster}
            />
            <Text style={styles.similarMovieTitle} numberOfLines={1}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    return(
        <ScrollView style={styles.container}>
            {/* Header with back and wishlist buttons */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={32} color="#FFA500" />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleWishlist}>
                    <Icon 
                        name={isWishlisted ? "heart" : "heart-outline"} 
                        size={32} 
                        color={isWishlisted ? "red" : "white"} 
                    />
                </TouchableOpacity>
            </View>

            {/* Movie Poster */}
            <Image
                source={{ uri: movie.poster }}
                style={styles.poster}
                resizeMode="cover"
            />

            {/* Movie Details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{movie.title}</Text>
                <View style={styles.ratingContainer}>
                    <Icon name="star" size={20} color="#FFD700" />
                    <Text style={styles.rating}>{movie.rating}</Text>
                </View>
                <Text style={styles.metadata}>
                    Released • {movie.year} • {movie.duration} min
                </Text>
                
                {/* Genres */}
                <View style={styles.genreContainer}>
                    {movie.genres?.map((genre, index) => (
                        <Text key={index} style={styles.genre}>{genre}</Text>
                    ))}
                </View>

                {/* Description */}
                <Text style={styles.description}>{movie.description}</Text>

                {/* Cast Section */}
                <Text style={styles.sectionTitle}>Top Cast</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castContainer}>
                    {movie.cast?.map((actor, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.castMember}
                            onPress={async () => {
                                try {
                                    const response = await fetch(
                                        `https://api.themoviedb.org/3/person/${actor.id}?api_key=2bd579dccedea6421279acb41d1adc7d`
                                    );
                                    const castDetails = await response.json();
                                    navigation.navigate('Cast', { 
                                        cast: castDetails
                                    });
                                } catch (error) {
                                    console.error('Error fetching cast details:', error);
                                }
                            }}
                        >
                            <Image
                                source={{ uri: actor.photo }}
                                style={styles.castPhoto}
                            />
                            <Text style={styles.castName}>{actor.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Similar Movies Section */}
                <Text style={styles.sectionTitle}>Similar Movies</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.similarMoviesContainer}
                >
                    {similarMovies.map((movie, index) => (
                        <SimilarMovieCard key={index} item={movie} />
                    ))}
                </ScrollView>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F1D2B',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    poster: {
        width: '100%',
        height: 500,
    },
    detailsContainer: {
        padding: 16,
        marginTop: -10,
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rating: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    metadata: {
        color: '#888',
        fontSize: 14,
        marginBottom: 12,
    },
    genreContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    genre: {
        color: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    description: {
        color: '#AAA',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 24,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    castContainer: {
        marginBottom: 24,
    },
    castMember: {
        alignItems: 'center',
        marginRight: 16,
        width: 80,
    },
    castPhoto: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 8,
    },
    castName: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
    },
    similarMoviesContainer: {
        marginBottom: 24,
    },
    similarMovieCard: {
        width: 140,
        marginRight: 16,
    },
    similarMoviePoster: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 8,
    },
    similarMovieTitle: {
        color: 'white',
        fontSize: 14,
        textAlign: 'left',
    },
});