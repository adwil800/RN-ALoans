import React, { useState, useEffect } from "react";
import { TextInput, View, StyleSheet, Dimensions, Animated, ScrollView, TouchableOpacity, Alert } from "react-native";

import AText from "../../components/util/text";
import {writeFile, readFile} from "../../components/util/fileManager";

import {Table, genCell} from "../../components/util/table";
import {modalAlert} from "../../components/util/modal";
 
import { RadioButton } from 'react-native-paper';

const tHeaders = ["Nombre", "Fecha de creación", "Estado"] 
 
function getMax(arr, prop) {
    let max;
    for (var i=0 ; i<arr.length ; i++) {
        if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
            max = arr[i];
    }
    return max;
}
 

const Registration = () => {

    const delConfirmation = (clientName, status, cancelCallback, deleteCallback) =>
        Alert.alert(
            "Atención!",
            "El cliente "+clientName+" será " + status+ ".",
            [
                {
                text: "Cancelar",
                onPress: () => cancelCallback(),
                style: "cancel"
                },
                { text: "Confirmar", onPress: () => deleteCallback()}
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

    function filterClients(){

        let sType = "", fType = false;
        switch(typeFilter.toLocaleLowerCase()){
            case "todos": sType = -1; break;
            case "activos": sType = 1; break;
            case "inactivos": sType = 0; break;
        }

        if(sType != -1) fType = true;

        return clients.filter((client) => {
                //default filtering
                if(fType){
                    if(client.status == sType)
                        return client;
                }else{
                    return client;
                }
            })
    } 
    
    function filterMovements(){
        return movements.filter((mov) => {
                //default filtering
                 if(Number(mov.client) === updateId){
                        return mov;
                }

        })
    } 
    function pendingAmount(movements){
        return movements.reduce(function(sum, val) {
        
            if(val.movType == 0)
                return sum + Number(val.amount);
            else
                return sum - Number(val.amount);
                
        }, 0);
    };
    function cStatus(status){
        switch(status.toString()){
            case "0": return "Inactivo";
            case "1": return "Activo";
        }
    }

    function modalAlertHandling(message){

        if(finished)
        fadeIn();
        setModalMessage(message);

    }

    function clearClientSelection(){
        setFilterInput("");
        setNewClient("");
        setUpdateId("");
        setCreate(true);
        setRunEffect(!runEffect);
    }
    

    const [typeFilter, setTypeFilter] = useState('todos');
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
    
    const [movements, setMovements] = useState([]);


    //runs only once
    useEffect( () => {
        const fetchData = async () => {
            const data = await readFile("clients");
            
            let jsonResCli = "";
            if(data)
                jsonResCli = JSON.parse(data);

            if(jsonResCli.length > 0){
                setClientId(getMax(jsonResCli, "id").id);
                setClients(jsonResCli);
            }

            //Movements data
            const dataM = await readFile("movements");
            let jsonResMov = "";
            if(dataM)
                jsonResMov = JSON.parse(dataM);
            
            if(jsonResMov.length > 0){
                setMovements(jsonResMov);
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
                                        createdAt: newDate.getDate()+ "/" +newDate.getMonth()+ "/" +newDate.getFullYear(),
                                        status: "1"
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
                                    let cliName = "", cliStatus = "", statusString = "";

                                    for (let i = 0; i < clients.length; i++) {

                                        if(Number(clients[i].id) === Number(updateId)){
                                            cliName = clients[i].name;
                                            
                                            if(clients[i].status == "1"){
                                                cliStatus = "0";
                                                statusString = "desactivado";
                                            }
                                            else{
                                                cliStatus = "1";
                                                statusString = "activado";
                                            }
                                            break;
                                        }  
                                        
                                    };
                                    
                                    if(pendingAmount(filterMovements()) > 0){
                                    
                                        modalAlertHandling(`El cliente '${cliName}' tiene cuentas pendientes`);
                                        return;

                                    }
                                    //Replace client name given that the ID matches
                                    delConfirmation(`'${cliName}'`, statusString,()=>{}, () => {
                                        for (let i = 0; i < clients.length; i++) {

                                            if(Number(clients[i].id) === Number(updateId)){
                                                //clients.splice(i, 1);
                                                    clients[i].status = cliStatus;
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
                                        modalAlertHandling("Cliente "+statusString)
                                    })
                                    
                                }else{
                                    modalAlertHandling("Algo salió muy mal!")
                                }

                            }}
                        >
                        
                            <AText textContent={"Cambiar estado"} />                 
                        
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

                    <View style={{flexDirection:"column"}}>
                        <View style={[styles.rowForm, ]}>
                            <View>
                                <RadioButton.Item
                                    value="todos"
                                    label="Todos"
                                    labelStyle={{color: "white", fontSize: 14}}
                                    uncheckedColor={"white"}
                                    color={"#3056d3"}
                                    status={ typeFilter === 'todos' ? 'checked' : 'unchecked' }
                                    onPress={() => {
                                        clearClientSelection();
                                        setTypeFilter('todos');
                                    }}
                                />
                            </View>
                            <View >
                                <RadioButton.Item
                                    value="activos"
                                    label="Activos"
                                    uncheckedColor={"white"}
                                    color={"#3056d3"}
                                    labelStyle={{color: "white", fontSize: 14}}
                                    status={ typeFilter === 'activos' ? 'checked' : 'unchecked' }
                                    onPress={() =>  {
                                        clearClientSelection();
                                        setTypeFilter('activos');
                                    }}
                                />
                            </View>
                            <View >
                                <RadioButton.Item
                                    value="inactivos"
                                    label="Inactivos"
                                    uncheckedColor={"white"}
                                    color={"#3056d3"}
                                    labelStyle={{color: "white", fontSize: 14}}
                                    status={ typeFilter === 'inactivos' ? 'checked' : 'unchecked' }
                                    onPress={() => {
                                        clearClientSelection();
                                        setTypeFilter('inactivos');
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                    {Table(tHeaders, 
                        () => {
                            let returned = false;
                            if(filterClients().length < 1){
                                return <View >
                                    
                                            <TouchableOpacity 
                                                style={{
                                                        flexDirection: "row",
                                                        alignSelf: 'stretch', 
                                                        borderBottomWidth: 1,
                                                        borderColor: "thistle",
                                                    }} 
                                            >
                    
                                                {genCell("No", tHeaders.length, "#3056d3")}
                                                {genCell("hay", tHeaders.length, "#3056d3")}
                                                {genCell("clientes", tHeaders.length, "#3056d3")}
                                                
                                            </TouchableOpacity>
                    
                                        </View>  
                                }
 
                             const fc = filterClients().map(data=>{

                                if(data.name.toString().toLowerCase().indexOf(filterInput.toLowerCase()) > -1){
                                    returned = true;
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
                                                {genCell(cStatus(data.status), tHeaders.length,  data.status == 0 ? "#d9534fce" : "#5cb85cce")}
                                                
                                            </TouchableOpacity>
                    
                                        </View>  
                                } 
                                    
                                   
                            });
 
                            if(!returned){
                                return <View >
                                    
                                            <TouchableOpacity 
                                                style={{
                                                        flexDirection: "row",
                                                        alignSelf: 'stretch', 
                                                        borderBottomWidth: 1,
                                                        borderColor: "thistle",
                                                    }} 
                                            >
                    
                                                {genCell("No", tHeaders.length, "#3056d3")}
                                                {genCell("hay", tHeaders.length, "#3056d3")}
                                                {genCell("resultados", tHeaders.length, "#3056d3")}
                                                
                                            </TouchableOpacity>
                    
                                        </View>  
                            }else{
                                return fc;
                            }
                           

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
        marginTop: 10,
        marginBottom: 10,
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
    rowForm: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
    },
  

});

export default Registration;

