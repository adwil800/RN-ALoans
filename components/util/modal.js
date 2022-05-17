
import React from "react";
import { Text,  View, StyleSheet, Dimensions, TextInput, Alert, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'


const dime = Dimensions.get("screen");

import {writeFile, readFile, removeFile} from "./fileManager";
import {Table, genCell} from "./table";
import AText from "./text";

const modalAlert = (message) => {

        return (
                            
            <View style={[styles.modalBody]} pointerEvents="none"> 

                <AText textContent={message} weight={"bold"} size={16} />

            </View>
        );

}

  

 
const styles = StyleSheet.create({
   
    modalBody: {
        position: "absolute",
        zIndex: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        bottom: 0,
        padding: 20,
        width: dime.width,
        justifyContent: "center",
        alignItems: "center",
        

    },
    formContainer: {
        backgroundColor: "rgba(52, 52, 52, 0.8)",
        borderRadius: 5,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 15,
    },
   
    input: {
        height: 40,
        margin: 5,
        borderRadius: 5,
        padding: 10,
        backgroundColor: "#ffffff"
    },
    closeModal: {
    }
   
});

export {modalAlert};
