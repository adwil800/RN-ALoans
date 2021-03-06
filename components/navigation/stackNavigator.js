
import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Navbar from "../util/stackNavbar";

import Home from "../../screens/main/Home";


import Register from "../../screens/register/Register";
import Movements from "../../screens/mov/Mov";

const Stack = createNativeStackNavigator(); 

const MainStackNavigator = () => { 
  return ( 
      <Stack.Navigator

        initialRouteName="Home"
      >

        <Stack.Screen
          name="Home"
          component={Home} 
          options={{
            //headerShown: false,
            header: ({navigation})=> <Navbar navigation={navigation} navTitle={"ALoans"} main={true}/>,

          }}
        />  

        <Stack.Screen
          name="Register"
          component={Register} 
          options={{
            //headerShown: false,
            header: ({navigation})=> <Navbar navigation={navigation} navTitle={"Registro de clientes"} main={false}/>,

          }}
        />  
        
        <Stack.Screen
          name="Movements"
          component={Movements} 
          options={{
            //headerShown: false,
            header: ({navigation})=> <Navbar navigation={navigation} navTitle={"Movimientos"} main={false}/>,

          }}
        />  
        
      </Stack.Navigator>
  );
}




export default MainStackNavigator;
