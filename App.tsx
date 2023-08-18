/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import { Image, StyleSheet, Text, View, Platform, TouchableOpacity, FlatList } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { FAB } from 'react-native-paper';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import SQLite from 'react-native-sqlite-storage'
import HomeScreen from './functions/TodoList';

const db = SQLite.openDatabase({name: 'todo.db', location: 'default'})

const Stack = createNativeStackNavigator();

function App() {
   useEffect(() => {
      (db).transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, todo TEXT, completed BOOLEAN)');
      }, error => {
        alert('Error on creating table')
      }, success => {
        console.log('success')
      });
    }, []);

  return(
    <NavigationContainer> 
      <Stack.Navigator initialRouteName="Todo App"  screenOptions={{
      headerStyle: {
        backgroundColor: Platform.OS === 'android' ? '#320bf4' : '#fff', // set background color
      },
      headerTintColor: Platform.OS === 'android' ? '#fff' : '#fff', // set text color
    }}>
        <Stack.Screen name="Todo App" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
)};


export default App;