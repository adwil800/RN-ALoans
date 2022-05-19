
import React from "react";
import {View, StyleSheet, Dimensions} from "react-native";


const dime = Dimensions.get("screen");

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
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        bottom: 0,
        padding: 20,
        width: dime.width,
        justifyContent: "center",
        alignItems: "center",
    }, 
   
});

export {modalAlert};
