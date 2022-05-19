import React, { useState, useEffect } from "react";
import { ActivityIndicator, Text, View, StyleSheet, Dimensions, Image, ScrollView, TouchableOpacity } from "react-native";
//Pure component call without brackets

//phone dimensions
const dime = Dimensions.get("screen");

const Home = ({navigation}) => {


    return (
        
        <React.Fragment>

            <ScrollView contentContainerStyle={styles.body}> 

                <View style={{flexGrow: 1, flexDirection: "column", justifyContent: "space-around"}}>

                    <TouchableOpacity style={styles.sectionMenu} onPress={()=>{navigation.push('Register');}} >
   
                        <View  style={{flexDirection: "row"}}>
                            
                            <Text style={styles.sectionText}>{"Registro de clientes"}</Text>
                            <Image
                                style={styles.sectionImage}
                                source={require('../../assets/images/reg.png')}
                            />
                        </View>    

                    </TouchableOpacity>



                    <TouchableOpacity style={styles.sectionMenu} onPress={()=>{navigation.push('Movements');}}>
                        <View  style={{flexDirection: "row"}}>
                            
                            <Text style={styles.sectionText}>{"Movimientos"}</Text>
                            <Image
                                style={styles.sectionImage}
                                source={require('../../assets/images/m.png')}
                            />
                        </View>                   
                    </TouchableOpacity>




                     

                </View>
                {/*Section*/}

                

            </ScrollView> 

        </React.Fragment>

    );

}

const styles = StyleSheet.create({

    body:{
        //backgroundColor: "#1e1e1e",
        backgroundColor: "#1e1e1e",
        flexGrow: 1
    },
    sectionMenu:{
        flex: 1,
        backgroundColor: "#3056d3",
        borderRadius: 10,
        padding: 5,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 15,
        marginRight: 15,
        marginTop: 25,
        marginBottom: 25
    },


    sectionText: {
        marginTop: 20,
        marginRight: 20,
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    sectionImage:{
        height: 80,
        width: 80,
    }


});

export default Home;
