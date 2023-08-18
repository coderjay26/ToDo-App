import React, {useEffect, useState} from 'react';
import { Image, Text, View, TouchableOpacity, FlatList, StyleSheet, Modal, Button, ToastAndroid } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { FAB } from 'react-native-paper';
import SQLite from 'react-native-sqlite-storage'
import Icon from 'react-native-vector-icons/FontAwesome';


const db = SQLite.openDatabase({name: 'todo.db', location: 'default'})

function HomeScreen(){
  const [todoForm, setTodoForm] = useState('');
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    // fetch todos from the database
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM todos WHERE completed="completed"',
        [],
        (tx, results) => {
          const len = results.rows.length;
          const data = [];
         
          for (let i = 0; i < len; i++) {
            const row = results.rows.item(i);
            data.push({
              id: row.id.toString(),
              todo: row.todo,
              completed: row.completed,
            });
          }
          setTodos(data);
        },
        (error) => {
          console.log(`Error querying data: ${error}`);
        },
      );
    });
  }, []);

  
  const handleSubmit = () => {
    if (!todoForm) {
      console.log('Please enter some text');
      return;
    }
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO todos (todo, completed) VALUES (?, ?)',
        [todoForm, false],
        (_, result) => {
          setTodos([...todos, { id: result.insertId, todo: todoForm, completed: false }]);
        },
        error => console.log(error)
      );
    });
    setTodoForm('');
  }

  const handleDelete = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM todos WHERE id = ?',
        [id],
        () => {
          setTodos(todos.filter(todo => todo.id !== id));
          ToastAndroid.show('Deleted', ToastAndroid.SHORT)
        },
        error => console.log(error)
      );
    });
  }
  const [editTodoId, setEditTodoId] = useState(null);
const [editTodoText, setEditTodoText] = useState('');
const handleEdits = (todoId) => {
  const todo = todos.find((t) => t.id === todoId);
  setEditTodoId(todoId);
  setEditTodoText(todo.todo);
};
  const handleEdit = (id, updatedTodo) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE todos SET todo=? WHERE id=?',
        [editTodoText, editTodoId],
        () => {
          const updatedTodos = [...todos];
          const index = updatedTodos.findIndex((t) => t.id === editTodoId);
          updatedTodos[index].todo = editTodoText;
          setTodos(updatedTodos);
          setEditTodoId(null);
          setEditTodoText('');
          ToastAndroid.show('Updated!', ToastAndroid.SHORT)
        },
        (error) => console.log(`Error updating todo: ${error}`)
      );
    });
  }
  const handleComplete = (id, completed) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE todos SET completed = ? WHERE id = ?',
        [completed, id],
        () => {
          setTodos(todos.map(todo => todo.id === id ? { ...todo, completed } : todo));
        },
        error => console.log(error)
      );
    });
  }

  return (
  <><View style={styles.container}>
      <FlatList
  data={todos}
  renderItem={({ item }) => (
    <View style={[styles.listItem, item.completed && styles.completedListItem]}>
      <Text
        style={
          styles.listItemText}
      >
        {item.todo}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleComplete(item.id, !item.completed)}
        >
         <Icon name={item.completed ? 'undo' : 'check'} size={20} color={item.completed ? 'orange' : 'green'} />
        </TouchableOpacity>
        <TouchableOpacity
  style={styles.editButton}
  onPress={() => handleEdits(item.id)}
>
<Icon name='edit' size={20} color='blue' />
</TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Icon name='trash' size={20} color='red' />
        </TouchableOpacity>
      </View>
    </View>
  )}
  keyExtractor={(item) => item.id.toString()}
/>
<Modal visible={editTodoId !== null} animationType='slide'>
  <View style={{padding: 20}}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Update Todo</Text>
    <TextInput
     style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 }}
      value={editTodoText}
      onChangeText={(text) => setEditTodoText(text)}
    />
    <Button title="Save" onPress={() => handleEdit()} />
  </View>
</Modal>

    </View><View style={styles.inputContainer}>
        <TextInput placeholder="Enter Task Here"
          placeholderTextColor='#EBEBEB'
          value={todoForm}
          onChangeText={setTodoForm}
          style={{ ...styles.input, color: '#EBEBEB' }}
          onSubmitEditing={handleSubmit} // Call the handleSubmit function when "Done" is pressed
          returnKeyType="done" />
      </View><FAB
        small
        icon={({ size }) => (
          <Image
            source={require('../images/add.png')}
            style={{ width: size, height: size }} />
        )}
        style={styles.fab}
        onPress={() => alert('Upgrade to PRO to use this features XD 😁')} />
        </>
  )
}

const styles = StyleSheet.create({
  listItemText: {
    fontSize: 16,
    flex: 1,
  },
  completedListItem: {
    backgroundColor: '#00e13c',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
    elevation: 4,
  },
  completedItem: {
    backgroundColor: '#C7F5D8',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  completeButton: {
    backgroundColor: '#CCE5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  deleteButton: {
    backgroundColor: '#FEB2B2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  editButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 4,
  },
container: {
flex: 1,
backgroundColor: '#2308a7',
paddingBottom: 40
},
inputContainer:{
position: 'absolute',
width: '100%',
flex: 1,
bottom: 0,
backgroundColor: '#417AF1',
height: 60,
paddingHorizontal: 20,
},
input: {
  fontSize: 18,
  borderBottomWidth: 1,
  borderBottomColor: '#fff',
},
fab: {
  position: 'absolute',
  marginRight: 16,
  marginBottom: 70,
  right: 0,
  bottom: 0,
  borderRadius: 50
},
});
export default HomeScreen;