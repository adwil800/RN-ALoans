
import React from 'react'
import { Text,  View, StyleSheet, Dimensions, TextInput, ScrollView, TouchableOpacity } from "react-native";

import AText from "./text";

const dime = Dimensions.get("screen");

const genCell = (data, colAmount, style = "") =>{
    return  <View  style={[styles.cell, {width: 100 / colAmount + "%", backgroundColor: style}]}>
                <AText textContent={data}/>
            </View>
}

const Table = (tableHeaders, cellsCallback ) => {

        const tableCells = cellsCallback();

    let colAmount = tableHeaders.length;
    return (
                        
        <View style={styles.table}>
        {/*Table headers*/}
        <View style={styles.tHeader}>
            <View  
            style={{
                    flexDirection: "row",
                    alignSelf: 'stretch', 
                    borderColor: "thistle",
                }}
            >
    
                {
                    tableHeaders.map(h=>{
                        return  <View  key={h} style={[styles.cell, {width: 100 / colAmount + "%",}]}>
                                    <AText textContent={h} weight={"bold"} size={16}/>
                                </View>
                                    
                    })
                }    
            </View>   
        </View>
        {/*Table content*/}
        <View style={[styles.tBody]}>
            <ScrollView nestedScrollEnabled = {true}>  
                

                            {tableCells}
                    

            </ScrollView> 
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
   
    tHeader:{

        flexDirection: "row",
        borderWidth: 1,

        borderColor: "thistle",
        
    },  
    tBody:{ 
        
        borderWidth: 1,
        borderColor: "thistle",
        minHeight: dime.height*0.45,
        maxHeight: dime.height*0.45,

    },
    table:{

        paddingBottom: 10,
        marginBottom: 10,
        paddingTop: 10,
        maxHeight: dime.height*0.5,
        minHeight: dime.height*0.5,
    }, 
    
  
    cell:{
        borderRightWidth: 1,
        borderColor: "thistle",
        alignItems: "center",
        paddingRight: 10,
        paddingLeft: 10,
    }
    
});

export {Table, genCell};
