import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

export default function MovieScreen(){
    return(
        <View style={styles.container}>
            <Text style={{ color: 'black' }}>Movie Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});