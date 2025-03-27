import {View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList} from 'react-native';
import React, {useState} from 'react';
import { Feather } from '@expo/vector-icons';
import { TMDB_BASE_URL, TMDB_API_KEY } from '../config';

export default function SearchScreen({ navigation }){
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const searchMovies = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            setSearchResults(data.results);
        } catch (error) {
            console.error('Error searching movies:', error);
        } finally {
            setIsLoading(false);
        }
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

    const renderMovieItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.movieItem}
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
                    uri: item.poster_path 
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : 'https://via.placeholder.com/150'
                }}
                style={styles.moviePoster}
            />
            <Text style={styles.movieTitle} numberOfLines={2}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="gray" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Movie"
                        placeholderTextColor="gray"
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            searchMovies(text);
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                        >
                            <Feather name="x" size={20} color="gray" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.resultsContainer}>
                {isLoading ? (
                    <Text style={styles.messageText}>Searching...</Text>
                ) : searchResults.length > 0 ? (
                    <>
                        <Text style={styles.resultsText}>Results ({searchResults.length})</Text>
                        <FlatList
                            data={searchResults}
                            renderItem={renderMovieItem}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.gridContainer}
                        />
                    </>
                ) : searchQuery.length > 0 ? (
                    <Text style={styles.messageText}>No results found</Text>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#333333',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
    },
    backButton: {
        marginRight: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#404040',
        borderRadius: 20,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        paddingVertical: 8,
    },
    resultsContainer: {
        flex: 1,
        padding: 16,
    },
    resultsText: {
        color: 'white',
        fontSize: 16,
        marginBottom: 16,
    },
    gridContainer: {
        paddingBottom: 20,
    },
    movieItem: {
        flex: 1,
        margin: 8,
        maxWidth: '50%',
    },
    moviePoster: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    movieTitle: {
        color: 'white',
        fontSize: 14,
        marginTop: 8,
    },
    messageText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});