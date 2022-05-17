import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, TextInput, ScrollView, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Checkbox  } from 'react-native-paper';

import DatePicker from 'react-native-date-picker' 
import AText from "../../components/util/text";
import {Table, genCell} from "../../components/util/table";
 
//phone dimensions
const dime = Dimensions.get("screen");

const tHeaders = ["Cliente", "Cantidad", "Fecha", "TipoMov"]
const tData = [ /**0: Prestado, 1: Pago */
    {
        id: "1",
        client: "1",
        amount: "90",
        date: "01/02/2022",
        movType: "1",
    },
    {
        id: "2",
        client: "1",
        amount: "23",
        date: "01/02/2022",
        movType: "1"
    },
    {
        id: "3",
        client: "3",
        amount: "2900",
        date: "01/02/2022",
        movType: "0"
    },
    {
        id: "4",
        client: "4",
        amount: "5",
        date: "01/02/2022",
        movType: "1"
    },
    {
        id: "5",
        client: "5",
        amount: "900",
        date: "01/02/2022, 10:43 AM",
        movType: "0"
    },   
];


const movType = (type) =>{
    return type == 0 ? "Préstamo" : "Pago";
}
const genData = () => {

    return tData.map(data=>{
            return <View key={data.id} 
                    style={{
                            flexDirection: "row",
                            alignSelf: 'stretch', 
                            borderBottomWidth: 1,
                            borderColor: "thistle",
                        }}
                    >

                        {genCell(data.client, tHeaders.length)}
                        {genCell(data.amount, tHeaders.length)}
                        {genCell(data.date, tHeaders.length)}
                        {genCell(movType(data.movType), tHeaders.length)}
     
                    </View>  
        });

}
const pendingAmount = () =>{
    return tData.reduce(function(sum, val) {
        
        if(val.movType == 0)
            return sum + Number(val.amount)
        return sum + 0;
            
    }, 0);
};
const paidAmount = () =>{
    return tData.reduce(function(sum, val) {
        
        if(val.movType == 1)
            return sum + Number(val.amount)
        return sum + 0;
            
    }, 0);
};

const Movements = ({navigation}) => {

    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);

    const [checked, setChecked] = useState(false);
    
    return (
        
        <React.Fragment>

            <ScrollView nestedScrollEnabled = {true} contentContainerStyle={styles.body}> 

                <View style={[styles.formContainer, styles.colForm]}>

                    <TouchableOpacity style={[styles.col, checked ? styles.disabledTO : {}]} disabled={checked}>
                        <TextInput 
                            style={styles.input}
                            editable={false} 
                            selectTextOnFocus={false}
                        >
                            <Icon style={styles.innerIcon} name={'search'} size={20} color={"black"}/> 
                            <AText textContent={"   Cliente"} color={"black"}/>
                        </TextInput> 
                    </TouchableOpacity>
                    
                    
                    <AText textContent={"   Todos"} />
                        <Checkbox
                            uncheckedColor={"white"}
                            color={"#3056d3"}
                            status={checked ? 'checked' : 'unchecked'}
                            onPress={() => {
                                setChecked(!checked);
                            }}
                        />

                </View>

                
                <View style={[styles.formContainer, styles.colForm]}> 

                    <TouchableOpacity style={styles.col} onPress={() => setOpen(true)}>
                        <TextInput
                            style={styles.input}
                            editable={false} 
                            selectTextOnFocus={false}
                        >
                            <Icon style={styles.innerIcon} name={'search'} size={20} color={"black"}/> 
                            <AText textContent={"   Fecha inicial"} color={"black"}/>
                        </TextInput> 
                    </TouchableOpacity>


                    <TouchableOpacity style={styles.col}  onPress={() => setOpen(true)}>
                        <TextInput
                            style={styles.input}
                            editable={false} 
                            selectTextOnFocus={false}
                        >
                            <Icon style={styles.innerIcon} name={'search'} size={20} color={"black"}/> 
                            <AText textContent={"   Fecha final"} color={"black"}/>
                        </TextInput> 
                    </TouchableOpacity>

                    <DatePicker
                    modal
                    title={null}
                    open={open}
                    date={date}
                    mode={"date"}
                    locale={"es"}
                    onConfirm={(date) => {
                        setOpen(false)
                        setDate(date)
                    }}
                    onCancel={() => {
                        setOpen(false)
                    }}
                    />

                </View>

                <View style={[styles.formContainer, {paddingBottom: 10}]}>
                    
                    {Table(tHeaders, genData())}
                    
                    <AText textContent={"Total adeudado: " + pendingAmount() } weight={"bold"} size={16}/>
                   <AText textContent={"Total pagado: " + paidAmount() } weight={"bold"} size={16}/>

                </View>



                <View style={[styles.formContainer, styles.colForm]}> 

                    <TouchableOpacity style={[ styles.formButton]}> 
                        <AText textContent={"Generar PDF"} />    
                    </TouchableOpacity>


                    <TouchableOpacity style={[styles.formButton]}> 
                        <AText textContent={"Imprimir"} />    
                    </TouchableOpacity>

                </View>

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
    input:{
        height: 40,
        margin: 5,
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        backgroundColor: "#ffffff"
    }, 
    formContainer:{
        backgroundColor: "rgba(52, 52, 52, 0.8)",
        borderRadius: 5,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 10,
        marginBottom: 10,
    },
    formButton:{
        alignItems: 'center',
        justifyContent: 'center',
        height: 35,
        borderRadius: 5,
        backgroundColor: "#3056d3",
        margin: 5,
    },
    colForm:{
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
    },
    col:{
        width: "50%" ,
    }, 

    formButton:{
        height: 35,
        borderRadius: 5,     
        alignItems: 'center',
        justifyContent: 'center',
        width: "40%",
        margin: 5,
        backgroundColor: "#3056d3",
    },
    disabledTO:{
        opacity: 0.5,
    }
    
  

});

export default Movements;

