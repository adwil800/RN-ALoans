/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import MainStackNavigator from "./components/navigation/stackNavigator"
import { NavigationContainer } from '@react-navigation/native'; 

 const App = () => {

  return (
    <NavigationContainer>
      <MainStackNavigator />
    </NavigationContainer>

  );

};


export default App;
