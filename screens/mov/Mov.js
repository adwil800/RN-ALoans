import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, ScrollView, Keyboard, Animated, TextInput, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'
import IconF5 from 'react-native-vector-icons/FontAwesome5'
import Modal from "react-native-modal";

import {modalAlert} from "../../components/util/modal";

import DatePicker from 'react-native-date-picker' 
import AText from "../../components/util/text";
import {Table, genCell} from "../../components/util/table";
 
import {writeFile, readFile} from "../../components/util/fileManager";

import { RadioButton } from 'react-native-paper';
//phone dimensions
const dime = Dimensions.get("screen");
/**0: Prestado, 1: Pago */

function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
const getMax = (arr, prop) => {
    let max;
    for (var i=0 ; i<arr.length ; i++) {
        if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
            max = arr[i];
    }
    return max;
}

const Movements = () => {

 
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

    function modalAlertHandling(message){
        if(finished)
        fadeIn();
        setModalMessage(message);
    }


    
    function openGetClient(){
        setFilterInput(""); 
        setIsGetClient(true);
        setModalVisible(true);
    }

    function openNewLoan(){
        setLoanAmount("");
        setIsNewLoan(true);
        setModalVisible(true);
    }

    function openNewPayment(){
        setPayAmount("");
        setIsPayLoan(true);
        setModalVisible(true);
    }

    function getClient(client){
        setSelectedClient(client);
        setIsClientSelected(true);  
        closeModal();

    }

    function filterMovements(){

        let mType = "", fType = false;
        switch(typeFilter.toLocaleLowerCase()){
            case "todos": mType = -1; break;
            case "prestamos": mType = 0; break;
            case "pagos": mType = 1; break;
        }

        if(mType != -1) fType = true;

        return movements.filter((mov) => {

                //if date filter has been selected
                if(iniDate !== "- / - / -"){
                    
                    const cDate = iniDate.split("/");
                    const eDate = endDate.split("/");
                    const mDate = mov.date.split("-")[0].split("/");

                    const cIniDate =  new Date(cDate[1] +"/"+ cDate[0] +"/"+ cDate[2]),
                          cEndDate =  new Date(eDate[1] +"/"+ eDate[0] +"/"+ eDate[2]),
                          movDate =  new Date(mDate[1] +"/"+ mDate[0] +"/"+ mDate[2]);

                    
                    if(Number(mov.client) === selectedClient.id && movDate >= cIniDate && movDate <= cEndDate){
                        if(fType){
                            if(mov.movType == mType)
                                return mov;
                        }else{
                            return mov;
                        }
                    }
                }
                //default filtering
                else if(Number(mov.client) === selectedClient.id){
                    if(fType){
                        if(mov.movType == mType)
                            return mov;
                    }else{
                        return mov;
                    }
                }
            })
    } 
    function filterClients(){

        return clients.filter((client) => {
                //default filtering
            if(client.status == "1")
                return client;
        })
    } 
    function movType(type){
        return type == 0 ? "Préstamo" : "Pago";
    } 
    function pendingAmount(movements){
        return movements.reduce(function(sum, val) {
            

            if(typeFilter === "todos"){

                if(val.movType == 0)
                    return sum + Number(val.amount);
                else
                    return sum - Number(val.amount);

            }else if(typeFilter === "prestamos"){

                if(val.movType == 0)
                    return sum + Number(val.amount);

            }else{
                
                return "";
                
            }
                
        }, 0);
    };
    function paidAmount(movements){
        return movements.reduce(function(sum, val) {
            
            if(typeFilter === "todos" || typeFilter === "pagos"){

                if(val.movType == 1)
                    return sum + Number(val.amount)
                return sum + 0;
                
            }else{

                return "";

            }
        }, 0);
    };
    
    function closeModal(){
        setModalVisible(false);
        setIsGetClient(false);
        setIsNewLoan(false);
        setIsPayLoan(false);
    }


    //Filtering
    const [typeFilter, setTypeFilter] = useState('todos');
    const [iniDate, setIniDate] = useState("- / - / -");
    const [endDate, setEndDate] = useState("- / - / -");
    const [minDate, setMinDate] = useState(new Date());
    const [modalDate, setModalDate] = useState(new Date());
    const [openDate1, setOpen1] = useState(false);
    const [openDate2, setOpen2] = useState(false);
    

    //General vars
    const [selectedClient, setSelectedClient] = useState({name: "Cliente"});
    const [isClientSelected, setIsClientSelected] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
 
    //modalAlert validation
    const [modalMessage, setModalMessage] = useState("");
    const [onModalAlert, setOnModalAlert] = useState("");
 
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
    const mHeaders = ["Cantidad", "Fecha", "Tipo"]
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

            console.log("Called")


        }, [runEffect]);

    //MODAL CLIENTS


    //File management     

 
    return (
        
        <React.Fragment>

            <ScrollView nestedScrollEnabled = {true} contentContainerStyle={styles.body}> 
                {/*Client selector*/}
                <View style={styles.formContainer}>
                <AText textContent={"Cliente MAYBE ADD AN ICON TO CLEAR SELECTED CLIENT"}/> 
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
                
                {/*Date selector for filtering*/} 

                 <View style={styles.formContainer} > 

                    <View style={[styles.rowForm, {padding: 5} ]}>

                        <AText textContent={"Filtros"} size={16} weight={"bold"}/>
                        <TouchableOpacity  onPress={() => {
                    
                            //Default filters
                            setIniDate("- / - / -");
                            setEndDate("- / - / -");
                            setTypeFilter("todos");
                            modalAlertHandling("Filtros restablecidos")
                            }
                        }>
                            <IconF5 style={{marginLeft: 10}} name={'remove-format'} size={20} color={"white"}/> 
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rowForm}>
                        <View style={{flexDirection:"column"}}>
                            <AText textContent={"Fecha inicial"}/> 
                            <TouchableOpacity style={[styles.col, !isClientSelected || filterMovements().length < 1 && iniDate === "- / - / -" ? {opacity: 0.2} : null]}
                                disabled={!isClientSelected || filterMovements().length < 1 && iniDate === "- / - / -"}
                                onPress={() => {
                

                                    if(iniDate !== "- / - / -"){
                                        const mDate = iniDate.split("/");
                                        setModalDate(new Date(mDate[1] +"/"+ mDate[0] +"/"+ mDate[2]));
                                    }

                                    setOpen1(true);
                                
                                }}>
                                <TextInput
                                    style={styles.input}
                                    editable={false} 
                                    selectTextOnFocus={false}
                                    value={iniDate}
                                    color={"black"}
                                />
                                <Icon style={styles.innerIcon} name={'search'} size={20} color={"black"}/> 
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection:"column"}}>
                            <AText textContent={"Fecha final"}/> 
                            <TouchableOpacity style={[styles.col, iniDate === "- / - / -" ? {opacity: 0.2} : null]}
                                disabled={iniDate === "- / - / -"}
                                onPress={() => {
                                        

                                        if(endDate !== "- / - / -"){
                                            const mDate = endDate.split("/");
                                            setModalDate(new Date(mDate[1] +"/"+ mDate[0] +"/"+ mDate[2]));
                                        }

                                        setOpen2(true);
                                    
                                }}>
                                <TextInput
                                    style={styles.input}
                                    editable={false} 
                                    selectTextOnFocus={false}
                                    value={endDate}
                                    color={"black"}
                                />
                                    <Icon style={styles.innerIcon} name={'search'} size={20} color={"black"}/> 
                            </TouchableOpacity>
                        </View> 
                    </View>
                    <View style={{flexDirection:"column"}}>
                        <AText textContent={"Tipo"}/> 
                                
                        <View style={[styles.rowForm, !isClientSelected || filterMovements() < 1 && typeFilter === "todos" ? {opacity: 0.2} : null]}
                         pointerEvents={!isClientSelected || filterMovements() < 1 && typeFilter === "todos" ? "none" : "auto"} >
                            <View>
                                <RadioButton.Item
                                    value="todos"
                                    label="Todos"
                                    labelStyle={{color: "white", fontSize: 14}}
                                    uncheckedColor={"white"}
                                    color={"#3056d3"}
                                    status={ typeFilter === 'todos' ? 'checked' : 'unchecked' }
                                    onPress={() => setTypeFilter('todos')}
                                />
                            </View>
                            <View >
                                <RadioButton.Item
                                    value="prestamos"
                                    label="Préstamos"
                                    uncheckedColor={"white"}
                                    color={"#3056d3"}
                                    labelStyle={{color: "white", fontSize: 14}}
                                    status={ typeFilter === 'prestamos' ? 'checked' : 'unchecked' }
                                    onPress={() => setTypeFilter('prestamos')}
                                />
                            </View>
                            <View >
                                <RadioButton.Item
                                    value="pagos"
                                    label="Pagos"
                                    uncheckedColor={"white"}
                                    color={"#3056d3"}
                                    labelStyle={{color: "white", fontSize: 14}}
                                    status={ typeFilter === 'pagos' ? 'checked' : 'unchecked' }
                                    onPress={() => setTypeFilter('pagos')}
                                />
                            </View>
                        </View>
                    </View>

                    <DatePicker
                        modal
                        title={null}
                        open={openDate1}
                        date={modalDate}
                        mode={"date"}
                        locale={"es"}
                        onConfirm={(date) => {
                            setOpen1(false)
                            setIniDate(date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear());
                            setMinDate(date);

                            if(endDate === "- / - / -" || new Date(endDate.split("/")[1] +"/"+ endDate.split("/")[0] +"/"+ endDate.split("/")[2]) < date)
                                setEndDate(date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear());

                            //Run filter movements
                        }}
                        onCancel={() => {
                            setOpen1(false)
                        }}
                    />
                    <DatePicker
                        modal
                        title={null}
                        open={openDate2}
                        minimumDate={minDate}
                        date={modalDate}
                        mode={"date"}
                        locale={"es"}
                        onConfirm={(date) => {
                            setOpen2(false)
                            setEndDate(date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear());

                            //Run filter movements

                        }}
                        onCancel={() => {
                            setOpen2(false)
                        }}
                    />
                </View>

                {/* Movements table */}
                <View style={[styles.formContainer, {paddingBottom: 10}]}>
                    
                {Table(mHeaders, 
                            () => {
                                if(!isClientSelected) {
                                    return <View>
                                                
                                            <TouchableOpacity 
                                                style={[{
                                                        flexDirection: "row",
                                                        alignSelf: 'stretch', 
                                                        borderBottomWidth: 1,
                                                        borderColor: "thistle",
                                                    }]} 
                                               
                                            >
                                                {genCell("Selecciona", mHeaders.length, "#3056d3")}
                                                {genCell("un", mHeaders.length, "#3056d3")} 
                                                {genCell("cliente", mHeaders.length, "#3056d3")}


                    
                                            </TouchableOpacity>
                    
                                        </View>  
                                }

                                if(filterMovements().length < 1 ){
                                            return <View>
                                                
                                            <TouchableOpacity 
                                                style={[{
                                                        flexDirection: "row",
                                                        alignSelf: 'stretch', 
                                                        borderBottomWidth: 1,
                                                        borderColor: "thistle",
                                                    }]} 
                                               
                                            >
                                                {genCell("No", mHeaders.length, "#3056d3")}
                                                {genCell("hay", mHeaders.length, "#3056d3")} 
                                                {genCell("movimientos", mHeaders.length, "#3056d3")}


                    
                                            </TouchableOpacity>
                    
                                        </View>  
                                }
                                  
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


                        <AText textContent={typeFilter !== "todos" ? "Total adeudado: - No calculado -" : "Total adeudado: "+ pendingAmount(filterMovements()) }  
                        color={"#d9534fce"} weight={"bold"} size={16}
                        />

                        <AText textContent={typeFilter !== "todos" ? "Total pagado: - No calculado -" : "Total pagado: "+ paidAmount(filterMovements()) }  
                        weight={"bold"} color={"#5cb85cce"} size={16}
                        />
                        
                        <AText textContent={"Total en transacciones: " + (paidAmount(filterMovements()) + pendingAmount(filterMovements()))} 
                        color={"#f0ad4eae"} weight={"bold"} size={16}
                        />

                </View>




                {/*Main buttons */}
                <View style={[styles.formContainer, styles.rowForm]} > 

                    <TouchableOpacity style={[ styles.formButton, isClientSelected  && typeFilter === "todos"? null: {opacity: 0.2}]} 
                                               disabled={!isClientSelected || typeFilter !== "todos"}
                                               onPress={() => {openNewLoan()}}> 
                        <AText textContent={"Nuevo"} />    
                    </TouchableOpacity>



                    <TouchableOpacity style={[ styles.formButton,  pendingAmount(filterMovements()) > 0 && isClientSelected  && typeFilter === "todos" ? null : {opacity: 0.2}]} 
                                               disabled={!isClientSelected || pendingAmount(filterMovements()) < 1 || typeFilter !== "todos"}
                                            
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
                animationIn={"fadeIn"}
                animationOut={"fadeOut"}
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
                                
                                                            {genCell("No", cHeaders.length, "#3056d3")}
                                                            {genCell("hay resultados", cHeaders.length, "#3056d3")}
                                                            
                                                        </TouchableOpacity>
                                
                                                    </View>  
                                            }
             
                                         const fc = filterClients().map(data=>{
            
                                            if(data.name.toString().toLowerCase().indexOf(filterInput.toLowerCase()) > -1){
                                                returned = true;
                                                return <View key={data.id}>
                                                
                                                        <TouchableOpacity 
                                                            style={{
                                                                    flexDirection: "row",
                                                                    alignSelf: 'stretch', 
                                                                    borderBottomWidth: 1,
                                                                    borderColor: "thistle",
                                                                }}
                                                            
                                                                onPress={() => {
                                
                                                                    //Modify existing
                                                                    getClient({id: data.id, name: data.name, createdAt: data.createdAt});
                                                                    //Default filters
                                                                    setIniDate("- / - / -");
                                                                    setEndDate("- / - / -");
                                                                    setTypeFilter("todos");
                                 
                                                                }
                                                            }
                                                        >
                                
                                                            {genCell(data.name, cHeaders.length)}
                                                            {genCell(data.createdAt, cHeaders.length)}
                                                            
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
                                
                                                            {genCell("No", cHeaders.length, "#3056d3")}
                                                            {genCell("hay resultados", cHeaders.length, "#3056d3")} 
                                                            
                                                        </TouchableOpacity>
                                
                                                    </View>  
                                        }else{
                                            return fc;
                                        }
                                       
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
                                
                                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>

                                        <AText textContent={"Cantidad de cargo "  }/> 

                                        
                                        <View style={[ onModalAlert === "" ? styles.hidden : null, {flexDirection: "row"}]}>
                                            <AText textContent={onModalAlert} color={"#d9534fce"} weight={"bold"}/> 
                                            <Icon name={"exclamation"} size={18} color={"#d9534fce"}/>
                                        </View>
                                    </View>

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
                                                    date: newDate.getDate()+ "/" +(newDate.getMonth()+1)+ "/" +newDate.getFullYear() + " - " +formatAMPM(new Date),
                                                    movType: "0",
                                                };

                                                //Merge with allClients
                                                movements.push(newMov);
                                                writeFile("movements", movements)

                                                setLoanAmount("");

                                                Keyboard.dismiss();
                                                closeModal();
                                                setTimeout(() => {
                                                    setRunEffect(!runEffect);
                                                }, 500);

                                                modalAlertHandling("Transacción completa")

                                            }
                                            else{
                                                setOnModalAlert("Valor inválido ");
                                                setTimeout(() => {
                                                    setOnModalAlert("");
                                                }, 2000);
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

                                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>

                                        <AText textContent={"Cantidad a pagar"  }/> 

                                        <View style={[ onModalAlert === "" ? styles.hidden : null, {flexDirection: "row"}]}>
                                            <AText textContent={onModalAlert} color={"#d9534fce"} weight={"bold"}/> 
                                            <Icon name={"exclamation"} size={18} color={"#d9534fce"}/>
                                        </View>
                                    </View>

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
                                                let currentPayAmount = payAmount;
                                                if(Number(payAmount) > pendingAmount(filterMovements())){
                                                    
                                                    setPayAmount(pendingAmount(filterMovements()).toString())
                                                    setOnModalAlert("Cantidad a pagar ajustada");
                                                    setTimeout(() => {
                                                        setOnModalAlert("");
                                                    }, 2000);
                                                    return;
                                                }
                                                
                                                const newDate = new Date();
                                                    
                                                //Gen new client object
                                                const newMov = {   
                                                    id: maxMovId+1 || 1,
                                                    client: selectedClient.id,
                                                    amount: payAmount,
                                                    date: newDate.getDate()+ "/" +(newDate.getMonth()+1)+ "/" +newDate.getFullYear() + " - " +formatAMPM(new Date),
                                                    movType: "1",
                                                };

                                                //Merge with allClients
                                                movements.push(newMov);
                                                writeFile("movements", movements)

                                                setPayAmount("");

                                                Keyboard.dismiss();
                                                closeModal();
                                                setTimeout(() => {
                                                    setRunEffect(!runEffect);
                                                }, 500);
                                                modalAlertHandling("Transacción completa")

                                            }
                                            else{ 
                                                setOnModalAlert("Valor inválido ");
                                                setTimeout(() => {
                                                    setOnModalAlert("");
                                                }, 2000);
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

            <Animated.View style={{opacity}}>
                {modalAlert(modalMessage)}
            </Animated.View>
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
    rowForm: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
    },
    col: {
        width: dime.width/2.1 ,
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

