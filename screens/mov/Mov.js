import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, ScrollView, Keyboard, TextInput, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'
import Modal from "react-native-modal";

import DatePicker from 'react-native-date-picker' 
import AText from "../../components/util/text";
import {Table, genCell} from "../../components/util/table";
 
import {writeFile, readFile, removeFile} from "../../components/util/fileManager";

//phone dimensions
const dime = Dimensions.get("screen");

const tData = [ /**0: Prestado, 1: Pago */
    {   
        id: "1",
        client: "1",
        amount: "90",
        date: "01/02/2022",
        movType: "1",
    },  
];



const getMax = (arr, prop) => {
    let max;
    for (var i=0 ; i<arr.length ; i++) {
        if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
            max = arr[i];
    }
    return max;
}

const movType = (type) =>{
    return type == 0 ? "Préstamo" : "Pago";
} 
const pendingAmount = (movements) =>{
    return movements.reduce(function(sum, val) {
        
        if(val.movType == 0)
            return sum + Number(val.amount);
        else
            return sum - Number(val.amount);
            
    }, 0);
};
const paidAmount = (movements) =>{
    return movements.reduce(function(sum, val) {
        
        if(val.movType == 1)
            return sum + Number(val.amount)
        return sum + 0;
            
    }, 0);
};

const Movements = () => {

 

    //General vars
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    
    const [selectedClient, setSelectedClient] = useState({name: "Cliente"});
    const [isClientSelected, setIsClientSelected] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
 
    
    function openGetClient(){
        setFilterInput(""); 
        setIsGetClient(true);
        setModalVisible(true);
    }

    function openNewLoan(){
        setIsNewLoan(true);
        setModalVisible(true);
    }

    function openNewPayment(){
        setIsPayLoan(true);
        setModalVisible(true);
    }

    function getClient(client){
        setSelectedClient(client);
        setIsClientSelected(true);  
        closeModal();

    }

    function filterMovements(){
        return movements.filter((mov) => {
                if(Number(mov.client) === selectedClient.id){
                    return mov;
                }
            })
    }

    function closeModal(){
        setModalVisible(false);
        setIsGetClient(false);
        setIsNewLoan(false);
        setIsPayLoan(false);
    }


 
    //MODAL CLIENTS
    const [isGetClient, setIsGetClient] = useState(false);

    const [isNewLoan, setIsNewLoan] = useState(false);
    const [loanAmount, setLoanAmount] = useState("");

    const [isPayLoan, setIsPayLoan] = useState(false);
    const [payAmount, setPayAmount] = useState("");



    const [runEffect, setRunEffect] = useState(false);
        



    const [filterInput, setFilterInput] = useState("");
    const cHeaders = ["Nombre", "Fecha de creación"] 
    const [clients, setClients] = useState([]);
    const mHeaders = ["Cantidad", "Fecha", "TipoMov"]
    const [movements, setMovements] = useState([]);
    const [maxMovId, setMaxMovId] = useState();
    //runs only once
        useEffect( () => {
            const fetchData = async () => {
                const data = await readFile("clients");
                
                let jsonResCli = "";
                if(data)
                    jsonResCli = JSON.parse(data);

                if(jsonResCli.length > 0){
                    setClients(jsonResCli);
                }

                //Movements data
                const dataM = await readFile("movements");
                let jsonResMov = "";
                if(dataM)
                    jsonResMov = JSON.parse(dataM);
                
                if(jsonResMov.length > 0){
                    setMaxMovId(getMax(jsonResMov, "id").id);
                    setMovements(jsonResMov);
                }


            }

            fetchData()
            // make sure to catch any error
            .catch(console.error);;



        }, [runEffect]);

    //MODAL CLIENTS


    //File management     

 
    return (
        
        <React.Fragment>

            <ScrollView nestedScrollEnabled = {true} contentContainerStyle={styles.body}> 
                {/*Client selector*/}
                <View style={styles.formContainer}>

                    <TouchableOpacity onPress={() => {openGetClient()}}>
                        <TextInput
                            style={[styles.input, isClientSelected ? styles.selectedInput : null]}
                            editable={false} 
                            selectTextOnFocus={false}
                            value={selectedClient.name}
                            color={"black"}
                        />
                        <Icon style={styles.innerIcon} name={'search'} size={20} color={"black"}/> 
                         
                    </TouchableOpacity>

                </View>
                
                {/*Date selector for filtering*/} IM HERE, FILTER BY DATE OR SOME RADIO BUTTONS TO FILTER EITHER BY PRESTAMO OR PAGOS AND SEE THEM, THIS WILL AFFECT THE TOTAL RESULT AT THE BOTTOM
                <View style={[styles.formContainer, styles.colForm, !isClientSelected ? {opacity: 0.2} : null]} pointerEvents={isClientSelected ? "auto" : "none"}> 

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

                {/* Movements table */}
                <View style={[styles.formContainer, {paddingBottom: 10}]}>
                    
                {Table(mHeaders, 
                            () => {

                                if(filterMovements().length < 1 || !isClientSelected) return;  
                                 
                                return filterMovements().map(data=>{

                                    return <View key={data.id}>
                                        
                                                <TouchableOpacity 
                                                    style={[{
                                                            flexDirection: "row",
                                                            alignSelf: 'stretch', 
                                                            borderBottomWidth: 1,
                                                            borderColor: "thistle",
                                                        }]} 
                                                        
                                                        
                                                    onPress={() => {
                        
                                                            
                                                        }
                                                    }
                                                >
                                                    {genCell(data.amount, mHeaders.length)}
                                                    {genCell(data.date, mHeaders.length)} 
                                                    {genCell(movType(data.movType), mHeaders.length, data.movType == 0 ? "#d9534fce" : "#5cb85cce")}
 

                        
                                                </TouchableOpacity>
                        
                                            </View>  
                                    }

                            );

                            } 
                        )}


                   <AText textContent={"Total adeudado: " + pendingAmount(filterMovements()) }   color={"#d9534fce"} weight={"bold"} size={16}/>
                   <AText textContent={"Total pagado: " + paidAmount(filterMovements()) } weight={"bold"} color={"#5cb85cce"} size={16}/>
                   <AText textContent={"Total de transacciones: " + (paidAmount(filterMovements()) + pendingAmount(filterMovements()))} color={"#f0ad4eae"} weight={"bold"} size={16}/>

                </View>




                {/*Main buttons */}
                <View style={[styles.formContainer, styles.colForm]} > 

                    <TouchableOpacity style={[ styles.formButton, isClientSelected ? null: {opacity: 0.2}]} 
                                               disabled={!isClientSelected}
                                               onPress={() => {openNewLoan()}}> 
                        <AText textContent={"Nuevo"} />    
                    </TouchableOpacity>



                    <TouchableOpacity style={[ styles.formButton,  pendingAmount(filterMovements()) > 0 && isClientSelected? null : {opacity: 0.2}]} 
                                               disabled={!isClientSelected || pendingAmount(filterMovements()) < 1}
                                            
                                            onPress={() => {openNewPayment()}}> 
                        <AText textContent={"Pago"} />    
                    </TouchableOpacity>

                </View>

            </ScrollView> 

         
         
         
         
         
            <Modal
                isVisible={modalVisible}
                backdropTransitionOutTiming={0}
                onRequestClose={() => {
                    closeModal();
                }}
            >

                <View style={{backgroundColor: "#1e1e1e", borderRadius: 10, }}>



                    {/*Get client*/}
                    {isGetClient && (
                        
                        <React.Fragment>
                            <View style={{flexDirection: "row", justifyContent: "space-between", padding: 10, margin: 10}}>

                                <AText textContent={"Selección de cliente"} weight={"bold"} size={20} color={"white"} />

                                <TouchableOpacity style={[styles.closeModal]} onPress={()=>{closeModal()}}> 
                                    <Icon name={'close'} size={26} color={"white"}/> 
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.formContainer,  {paddingBottom: 10, }]}>
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
                                
                                {Table(cHeaders, 
                                    () => {

                                        if(clients.length < 1) return;  

                                        return clients.map(data=>{

                                        if(data.name.toString().toLowerCase().indexOf(filterInput.toLowerCase()) > -1){
                                            return <View key={data.id}>
                                                
                                                        <TouchableOpacity 
                                                            style={[{
                                                                    flexDirection: "row",
                                                                    alignSelf: 'stretch', 
                                                                    borderBottomWidth: 1,
                                                                    borderColor: "thistle",
                                                                }]} 
                                                            
                                                            onPress={() => {
                                
                                                                    //Modify existing
                                                                    getClient({id: data.id, name: data.name, createdAt: data.createdAt})
                                
                                                                }
                                                            }
                                                        >
                                
                                                            {genCell(data.name, cHeaders.length)}
                                                            {genCell(data.createdAt, cHeaders.length)}
                                
                                                        </TouchableOpacity>
                                
                                                    </View>  
                                            }

                                    });

                                    } 
                                )}

                            </View>
                        </React.Fragment>

                        )
                    }






                    {/*New loan */}
                    {isNewLoan && (
                        
                        <React.Fragment>
                            <View style={{flexDirection: "row", justifyContent: "space-between",  paddingLeft: 10, paddingRight: 10, paddingTop: 10}}>

                                <AText textContent={"Colocar cargo"} weight={"bold"} size={20} color={"white"} />

                                
                                
                                <TouchableOpacity style={[styles.closeModal]} onPress={()=>{closeModal()}}> 
                                    <Icon name={'close'} size={26} color={"white"}/> 
                                </TouchableOpacity>

                            </View>

                            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                                <View style={{padding: 10}}>
                                        
                                    <View style={[styles.formContainer, {flexDirection: "row", justifyContent: "space-around"}]}>
                                        <AText textContent={"Total adeudado: " + pendingAmount(filterMovements()) }   color={"#d9534fce"} weight={"bold"}/>
                                        <AText textContent={"Total pagado: " + paidAmount(filterMovements()) } color={"#5cb85cce"} weight={"bold"}/>
                                    </View>
                                
                                    <AText textContent={"Cantidad de cargo"}/> 
                                        <TextInput
                                            style={styles.input}
                                            placeholder="$00000000"
                                            keyboardType="numeric"
                                            onChangeText={(input) => {
                                                    
                                                setLoanAmount(input);

                                            }}
                                            value={loanAmount}
                                        /> 

                                    <TouchableOpacity style={[ styles.formButton]} onPress={() => {
                                         

                                            if(Number(loanAmount)){

                                                const newDate = new Date();
                                                    
                                                //Gen new client object
                                                const newMov = {   
                                                    id: maxMovId+1 || 1,
                                                    client: selectedClient.id,
                                                    amount: loanAmount,
                                                    date: newDate.getDate()+ "/" +newDate.getMonth()+ "/" +newDate.getFullYear(),
                                                    movType: "0",
                                                };

                                                //Merge with allClients
                                                movements.push(newMov);
                                                writeFile("movements", movements)

                                                setLoanAmount("");

                                                Keyboard.dismiss();
                                                setRunEffect(!runEffect);
                                                closeModal();

                                            }
                                            else{
                                                console.log("VALOL")
                                            }

                                    }}> 
                                        <AText textContent={"Confirmar"} />    
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>

                        </React.Fragment>

                    )
                    }






                    {/*New payment */}
                    {isPayLoan && (
                        <React.Fragment>
                            <View style={{flexDirection: "row", justifyContent: "space-between",  paddingLeft: 10, paddingRight: 10, paddingTop: 10}}>

                                <AText textContent={"Pagar cargo"} weight={"bold"} size={20} color={"white"} />

                                <TouchableOpacity style={[styles.closeModal]} onPress={()=>{closeModal()}}> 
                                    <Icon name={'close'} size={26} color={"white"}/> 
                                </TouchableOpacity>

                            </View>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                                <View style={{padding: 10}}>
                                    
                                    <View style={[styles.formContainer, {flexDirection: "row", justifyContent: "space-around"}]}>
                                        <AText textContent={"Total adeudado: " + pendingAmount(filterMovements()) }   color={"#d9534fce"} weight={"bold"}/>
                                        <AText textContent={"Total pagado: " + paidAmount(filterMovements()) } color={"#5cb85cce"} weight={"bold"}/>
                                    </View>

                                    <AText textContent={"Cantidad a pagar"}/> 
                                        <TextInput
                                            style={styles.input}
                                            placeholder="$00000000"
                                            keyboardType="numeric"
                                            onChangeText={(input) => {
                                                    
                                                setPayAmount(input);

                                            }}
                                            value={payAmount}
                                        /> 

                                    <TouchableOpacity style={[ styles.formButton]} onPress={() => {


                                            if(Number(payAmount)){
                                                if(Number(payAmount) > pendingAmount(filterMovements())){
                                                    console.log("Jaier")
                                                    return;
                                                }
                                                
                                                const newDate = new Date();
                                                    
                                                //Gen new client object
                                                const newMov = {   
                                                    id: maxMovId+1 || 1,
                                                    client: selectedClient.id,
                                                    amount: payAmount,
                                                    date: newDate.getDate()+ "/" +newDate.getMonth()+ "/" +newDate.getFullYear(),
                                                    movType: "1",
                                                };

                                                //Merge with allClients
                                                movements.push(newMov);
                                                writeFile("movements", movements)

                                                setPayAmount("");

                                                Keyboard.dismiss();
                                                setRunEffect(!runEffect);
                                                closeModal();

                                            }
                                            else{
                                                console.log("VALOL")
                                            }

                                        

                                    }}> 
                                        <AText textContent={"Confirmar"} />    
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>

                        </React.Fragment>
                    )
                    }

                </View>

            </Modal>

        </React.Fragment>

    );

}

const styles = StyleSheet.create({

    body: { 
        //backgroundColor: "#1e1e1e",
        backgroundColor: "#1e1e1e",
        flexGrow: 1
    },
    formContainer: {
        backgroundColor: "rgba(52, 52, 52, 0.8)",
        borderRadius: 5,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 10,
    },
    formButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 35,
        borderRadius: 5,
        backgroundColor: "#3056d3",
        margin: 5,
    },
    colForm: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
    },
    col: {
        width: "50%" ,
    }, 

    formButton: {
        height: 35,
        borderRadius: 5,     
        alignItems: 'center',
        justifyContent: 'center',
        width: "40%",
        margin: 5,
        backgroundColor: "#3056d3",
    },
    hidden: {
        display: "none"
    },

    innerIcon:{
        position: "absolute",
        top: "30%",
        right: 20,
    },
    input: {
        height: 40,
        margin: 5,
        borderRadius: 5,
        padding: 10,
        backgroundColor: "#ffffff"
    }, 
    selectedInput: {
        borderWidth: 2,
        borderColor: "#3056d3"
    },
    

});

export default Movements;

