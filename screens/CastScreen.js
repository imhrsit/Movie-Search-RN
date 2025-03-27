import {View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView} from 'react-native';
import React, {useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CastScreen({ route, navigation }){
    const { cast } = route.params;
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Create a fallback description
    const fallbackDescription = "No biography available for this cast member at the moment.";

    useEffect(() => {
        checkWishlistStatus();
    }, []);

    const checkWishlistStatus = async () => {
        try {
            const wishlist = await AsyncStorage.getItem('castWishlist');
            const wishlistArray = wishlist ? JSON.parse(wishlist) : [];
            setIsWishlisted(wishlistArray.some(item => item.id === cast.id));
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    };

    const toggleWishlist = async () => {
        try {
            const wishlist = await AsyncStorage.getItem('castWishlist');
            const wishlistArray = wishlist ? JSON.parse(wishlist) : [];

            if (isWishlisted) {
                const newWishlist = wishlistArray.filter(item => item.id !== cast.id);
                await AsyncStorage.setItem('castWishlist', JSON.stringify(newWishlist));
            } else {
                wishlistArray.push(cast);
                await AsyncStorage.setItem('castWishlist', JSON.stringify(wishlistArray));
            }

            setIsWishlisted(!isWishlisted);
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    return(
        <ScrollView style={styles.background}>
            {/* Header with back and wishlist buttons */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={32} color="#FFA500" />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleWishlist}>
                    <Icon 
                        name={isWishlisted ? "heart" : "heart-outline"} 
                        size={32} 
                        color={isWishlisted ? "white" : "white"} 
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {/* Use photo from MovieScreen if profile_path is not available */}
                {cast.profile_path ? (
                    <Image
                        source={{uri: `https://image.tmdb.org/t/p/w500${cast.profile_path}`}}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : cast.photo ? (
                    <Image
                        source={{uri: cast.photo}}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.image, styles.placeholderImage]}>
                        <Icon name="person" size={100} color="#666" />
                    </View>
                )}
                
                {/* Show name from either source */}
                <Text style={styles.name}>{cast.name}</Text>
                
                {/* Only show info container if any data exists */}
                {(cast.gender || cast.birthday || cast.known_for_department || cast.popularity) && (
                    <View style={styles.infoContainer}>
                        {cast.gender && (
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Gender</Text>
                                <Text style={styles.infoValue}>
                                    {cast.gender === 1 ? 'Female' : 'Male'}
                                </Text>
                            </View>
                        )}
                        
                        {cast.birthday && (
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Birthday</Text>
                                <Text style={styles.infoValue}>{cast.birthday}</Text>
                            </View>
                        )}
                        
                        {cast.known_for_department && (
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Known For</Text>
                                <Text style={styles.infoValue}>{cast.known_for_department}</Text>
                            </View>
                        )}
                        
                        {cast.popularity && (
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Popularity</Text>
                                <Text style={styles.infoValue}>{cast.popularity?.toFixed(2)}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Always show biography section with fallback text if needed */}
                <View style={styles.biographyContainer}>
                    <Text style={styles.sectionTitle}>Biography</Text>
                    <Text style={styles.biography}>
                        {cast.biography || fallbackDescription}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#333333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        position: 'absolute',
        top: 30,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    container: {
        padding: 16,
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginTop: 60,
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    infoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    infoItem: {
        width: '48%',
        marginBottom: 16,
    },
    infoLabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 4,
    },
    infoValue: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    biographyContainer: {
        width: '100%',
        marginBottom: 24,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    biography: {
        color: '#AAA',
        fontSize: 14,
        lineHeight: 22,
    },
    placeholderImage: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});