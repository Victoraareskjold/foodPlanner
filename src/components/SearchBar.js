import { StyleSheet, View, Image, TextInput } from "react-native";
import { useState } from "react";
import React from "react";
import Colors from "../../styles/Colors";

const SearchBar = ({  placeholder }) => {
    const [ input, setInput ] = useState("");
    console.log(input)
    return (
        <View style={styles.searchContainer}>
            {/* <Image 
                source={require("../../assets/searchIcon.png")}
                style={{ width: 18, height: 18, marginRight: 4 }}
            /> */}
            <TextInput 
                placeholderTextColor={Colors.defaultLight}
                value={input} onChangeText={(text) => setInput(text)} 
                placeholder={placeholder}
                style={{width: '100%'}}
            >
            </TextInput>
        </View>
    );
};

export default SearchBar;

const styles = StyleSheet.create ({
    searchContainer: {
        flexDirection: 'row',
        marginTop: 0,
        backgroundColor: '#FBFBFB',
        paddingVertical: 12,
        flexDirection: 'row',
        borderRadius: 5,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.lightGrey,
    },
});