import React, { useState, useEffect } from "react";
import { TextInput, View, StyleSheet, Dimensions, Animated, ScrollView, TouchableOpacity, Alert } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
//Pure component call without brackets

import AText from "../../components/util/text";
import {writeFile, readFile, removeFile} from "../../components/util/fileManager";

import {Table, genCell} from "../../components/util/table";
import {modalAlert} from "../../components/util/modal";
 

const tHeaders = ["Nombre", "Fecha de creación"] 
 
function getMax(arr, prop) {
    let max;
    for (var i=0 ; i<arr.length ; i++) {
        if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
            max = arr[i];
    }
    return max;
}

//phone dimensions
const dime = Dimensions.get("screen");

const Registration = () => {

    const delConfirmation = (clientName, cancelCallback, deleteCallback) =>
        Alert.alert(
            "Atención!",
            "El cliente "+clientName+" será eliminado.",
            [
                {
                text: "Cancelar",
                onPress: () => cancelCallback(),
                style: "cancel"
                },
                { text: "Eliminar", onPress: () => deleteCallback()}
            ]
        );


    const opacity = useState(new Animated.Value(0))[0];
    let finished = true;
    function fadeIn(){
        finished = false;
        Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            finished = true;
            fadeOut();
          });
         
    }    
    
    function fadeOut(){
        Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
            delay: 1000
        }).start();
    }



    

    //update
    const [updateId, setUpdateId] = useState("");
    const [filterInput, setFilterInput] = useState("");

    //modalAlert validation
    const [modalMessage, setModalMessage] = useState("");


    const [runEffect, setRunEffect] = useState(true);
    const [isCreate, setCreate] = useState(true);

    const [clients, setClients] = useState([]);
    const [newClient, setNewClient] = useState();
    const [maxClientId, setClientId] = useState();
    

    function modalAlertHandling(message){

        if(finished)
        fadeIn();
        setModalMessage(message);


 
    }

    //runs only once
    useEffect( () => {
        
        const fetchData = async () => {
            const data = await readFile("clients");
            let jsonRes = "";
            if(data)
                jsonRes = JSON.parse(data);
            
            if( jsonRes.length > 0){
                setClientId(getMax(jsonRes, "id").id);
                setClients(jsonRes);
            }
        }

        fetchData()
        // make sure to catch any error
        .catch(console.error);;



    }, [runEffect]);


    return (
        
        <React.Fragment>

            <ScrollView contentContainerStyle={styles.body} nestedScrollEnabled = {true}> 

                <View style={styles.formContainer}>

                    <AText textContent={"Nombre de cliente"}/> 
                    <TextInput
                        style={styles.input}
                        placeholder="Cliente"
                        onChangeText={(input) => {setNewClient(input);}}
                        value={newClient}
                    /> 

                { isCreate ?
                (
                    <TouchableOpacity style={styles.formButton} 
                    
                        onPress={() =>{
                            //Register
                            if(newClient !== undefined && newClient.trim().length > 0){

                                const newDate = new Date();
                                
                                //Gen new client object
                                const nClient = {
                                        id: maxClientId+1 || 1,
                                        name: newClient,
                                        createdAt: newDate.getDate()+ "/" +newDate.getMonth()+ "/" +newDate.getFullYear()
                                };

                                //Merge with allClients
                                clients.push(nClient);
                                writeFile("clients", clients)

                                setNewClient("");
                                setFilterInput("");
                                setRunEffect(!runEffect);

                                modalAlertHandling("Cliente registrado")

                            }else{
                                modalAlertHandling("Introduzca el nombre del cliente")
                            }

                        }}
                    >
                    
                        <AText textContent={"Registrar"} />                 
                    
                    </TouchableOpacity>
                )
                :
                (
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.formButton, {backgroundColor: "#5cb85cce", width: "30%"}]} 
                            
                            onPress={() =>{
                                //updateClient
                                if(newClient !== undefined && newClient.trim().length > 0){
                                    
                                    //Replace client name given that the ID matches

                                    for (let i = 0; i < clients.length; i++) {

                                        if(Number(clients[i].id) === Number(updateId)){
                                            clients[i].name = newClient;
                                            break;
                                        }  
                                        
                                    }
                                    
                                    writeFile("clients", clients)

                                    //Set default states
                                    setNewClient("");
                                    setUpdateId("");
                                    setCreate(true);
                                    setRunEffect(!runEffect);
                                    modalAlertHandling("Cliente actualizado")

                                }else{
                                    modalAlertHandling("Introduzca el nombre del cliente")
                                }

                            }}
                        >
                        
                            <AText textContent={"Actualizar"} />                 
                        
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.formButton, {backgroundColor: "#d9534fce", width: "30%"}]} 
                            
                            onPress={() =>{
                                //updateClient
                                if(updateId){
                                    let cliName = "";

                                    for (let i = 0; i < clients.length; i++) {

                                        if(Number(clients[i].id) === Number(updateId)){
                                            cliName = clients[i].name;
                                            break;
                                        }  
                                        
                                    };

                                    //Replace client name given that the ID matches
                                    delConfirmation(`'${cliName}'`, ()=>{}, () => {
                                        for (let i = 0; i < clients.length; i++) {

                                            if(Number(clients[i].id) === Number(updateId)){
                                                clients.splice(i, 1);
                                                break;
                                            }  
                                            
                                        }
                                        
                                        writeFile("clients", clients)
    
                                        //Set default states
                                        setFilterInput("");
                                        setNewClient("");
                                        setUpdateId("");
                                        setCreate(true);
                                        setRunEffect(!runEffect);
                                        modalAlertHandling("Cliente eliminado")
                                    })
                                    
                                }else{
                                    modalAlertHandling("Algo salió mal")
                                }

                            }}
                        >
                        
                            <AText textContent={"Eliminar"} />                 
                        
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.formButton, {backgroundColor: "#f0ad4eae", width: "30%"}]} 
                            
                            onPress={() =>{
                                
                                //Set default states
                                setNewClient("");
                                setUpdateId("");
                                setCreate(true);
                                setRunEffect(!runEffect);

                            }}
                        >
                        
                            <AText textContent={"Cancelar"} />                 
                        
                        </TouchableOpacity>
                    </View>
                )
                }
                </View>
            
                  
                

                <View style={[styles.formContainer, {paddingBottom: 10}]}>
                    
                    {/*Filter*/}
                    <AText textContent={"Buscar"}/> 
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        onChangeText={(input) => {
                                
                                setFilterInput(input);

                        }}
                        value={filterInput}
                    /> 

                    {Table(tHeaders, 
                        () => {

                            if(clients.length < 1) return;  

                             return clients.map(data=>{

                                if(data.name.toString().toLowerCase().indexOf(filterInput.toLowerCase()) > -1){
                                    return <View key={data.id}>
                                    
                                            <TouchableOpacity 
                                                style={[data.id === updateId ? styles.selectedCell : {}
                                                    ,{
                                                        flexDirection: "row",
                                                        alignSelf: 'stretch', 
                                                        borderBottomWidth: 1,
                                                        borderColor: "thistle",
                                                    }]} 
                                                
                                                onPress={() => {
                    
                                                        //Modify existing
                                                        setUpdateId(data.id);
                                                        setNewClient(data.name);
                                                        setCreate(false);
                    
                                                    }
                                                }
                                            >
                    
                                                {genCell(data.name, tHeaders.length)}
                                                {genCell(data.createdAt, tHeaders.length)}
                    
                                            </TouchableOpacity>
                    
                                        </View>  
                                }

                            });

                        } 
                    )}

                </View>



            </ScrollView> 
        
            <Animated.View style={{opacity}}>
                {modalAlert( modalMessage)}
            </Animated.View>

        </React.Fragment>

    );

}

const styles = StyleSheet.create({

    body: {
        //backgroundColor: "#1e1e1e",
        backgroundColor: "#1e1e1e",
        flexGrow: 1,
    }, 
    input: {
        height: 40,
        margin: 5,
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        backgroundColor: "#ffffff"
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
    formButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 35,
        borderRadius: 5,
        backgroundColor: "#3056d3",
        margin: 5,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
    selectedCell: {
        backgroundColor: "#3056d3ce"
    },

  

});

export default Registration;

