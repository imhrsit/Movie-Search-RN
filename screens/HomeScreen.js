import {View, Text, StyleSheet, Image, Dimensions, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import { Feather } from '@expo/vector-icons';
import Carousel from 'react-native-snap-carousel';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72;

export default function HomeScreen(){
    const [trendingMovies, setTrendingMovies] = useState([]);
    
    useEffect(() => {
        getTrendingMovies();
    }, []);

    const getTrendingMovies = async () => {
        try {
            const response = await fetch(
                'https://api.themoviedb.org/3/trending/movie/week?api_key=2bd579dccedea6421279acb41d1adc7d'
            );
            const data = await response.json();
            setTrendingMovies(data.results);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const renderMovieItem = ({item}) => (
        <TouchableOpacity style={styles.movieCard}>
            <Image
                source={{
                    uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`
                }}
                style={styles.movieImage}
            />
            <Text style={styles.movieTitle} numberOfLines={2}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    return(
        <View style={styles.container}>
            <View style={styles.appBar}>
                <TouchableOpacity>
                    <Feather name="menu" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.appBarTitleYellow}>M</Text>
                    <Text style={styles.appBarTitleWhite}>ovies</Text>
                </View>
                <TouchableOpacity>
                    <Feather name="search" size={24} color="white" />
                </TouchableOpacity>
            </View>
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
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F1D2B',
    },
    appBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 35,
        paddingBottom: 10,
        backgroundColor: '#1F1D2B',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appBarTitleYellow: {
        color: '#FFD700',
        fontSize: 24,
        fontWeight: 'bold',
    },
    appBarTitleWhite: {
        color: '#fff',
        fontSize: 24,
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
    }
});