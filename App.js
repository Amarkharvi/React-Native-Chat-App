import { StatusBar } from 'expo-status-bar';
import React , {useState,useEffect,useCallback} from 'react';
import {  StyleSheet, Text, TextInput, View, YellowBox,KeyboardAvoidingView } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import AsyncStorage from '@react-native-community/async-storage';
import {GiftedChat,Send} from 'react-native-gifted-chat';
import { IconButton,Colors } from 'react-native-paper'
import {Permissions,Notifications} from 'expo';

const firebaseConfig = {
    apiKey: "AIzaSyDAsJxxIQPmgo8YKGNz--FBSrP6wa_d4y0",
    authDomain: "big6-dc862.firebaseapp.com",
    databaseURL: "https://big6-dc862.firebaseio.com",
    projectId: "big6-dc862",
    storageBucket: "big6-dc862.appspot.com",
    messagingSenderId: "531347154668",
    appId: "1:531347154668:web:cc2ac73b395d9738d167c9",
    measurementId: "G-VQHMC78CD2"
  }


  



  if (firebase.apps.length == 0){
  firebase.initializeApp(firebaseConfig);
  }

  YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])
  const db = firebase.firestore()
  const chatsRef =db.collection('chats')
  
  //Custom send button
  function renderSend(props){
    return(
      <Send {...props}>
        <View style={{justifyContent:"center", alignContent:"center" , alignItems:"center"}}>
          <IconButton  icon ='send-circle' size={45} color='#6646ee' />
        </View>
      </Send>
    );
  }
  

  // scroll to bottom

  function scrollToBottomComponent(){
    return(
      <View style={{justifyContent:"center",alignContent:"center"}}>
        <IconButton icon='chevron-double-down' size={36} color='#6646ee'/>
      </View>
    );
  }
 


  export default function App() {
    

     


    const [user,setUser]=useState(null);
    const [name,setName]=useState('');
    const [messages,setMessages]=useState([])

    useEffect(()=>{
      registerForPushNotifications = async () =>{
        //Get the current users id So you can post the token to the user in your database
        const  currentUser = firebase.auth().currentUser.uid
        const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        let finalStatus = existingStatus;
        // only ask if permissions have not already been determined, because
        // iOS won't necessarily prompt the user a second time.
        if (existingStatus !== 'granted') {
          // Android remote notification permissions are granted during the app// install, so this will only ask on iOS
          const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
          finalStatus = status;}
          // Stop here if the user did not grant permissions
          if (finalStatus !== 'granted') {return;}
          // Get the token that uniquely identifies this device
          try{
            let token = await Notifications.getExpoPushTokenAsync();
        // POST the token to your backend server from where you can retrieve it to send push notifications.
        var updates = {}
        updates['/expoToken'] = token
        firebase.database().ref('users').child(currentUser).update(updates)
      }
      catch(error){console.log(error)}
        }

      readUser()
      const unsubscribe =chatsRef.onSnapshot((querySnapshot) => {
        const messagesFirestore =querySnapshot.docChanges().filter(({type}) => type === 'added')
                                   .map(({doc})=>{
                                     const message =doc.data()
                                     return {...message,createdAt:message.createdAt.toDate()}
                                   })
                                   .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
      appendMessages(messagesFirestore)
                                  })
                                  return() => unsubscribe()
    },[])

    const appendMessages = useCallback(
      (messages) => {
          setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
      },
      [messages]
  )

    async function readUser(){
      const user =await AsyncStorage.getItem('user')
      if(user){
        setUser(JSON.parse(user))
      }
    }

    async function handlePress(){
      const _id= () =>'_' + Math.random().toString(36).substr(2,9)
      const user ={_id,name}
      await AsyncStorage.setItem('user',JSON.stringify(user))
      setUser(user)
    }

    async function handleSend(messages){
      const writes = messages.map(m => chatsRef.add(m))
      await Promise.all(writes)

    }

    if(!user){
      return( 
      <View style={{flex:1,flexDirection:'column',justifyContent:'flex-start',backgroundColor:'black'}}>
                    <StatusBar style="light"/>
<View style={{borderColor:'white',borderWidth:2,borderRadius:30,borderStyle:"dashed",marginTop:40}}>
      <View style={{padding:10}}>   
      <Text style={{color:'white',fontSize:60,fontFamily:'sans-serif-thin'}}>Welcome,</Text>
      </View>
      <View style={{paddingTop:20,paddingBottom:10,alignItems:'flex-end',paddingRight:30}}>   
      <Text style={{color:'yellow',textDecorationStyle:'double'
      ,textShadowRadius:40,textShadowColor:'white',fontWeight:'900',fontSize:50,fontFamily:'serif'}}>Big6</Text>
      </View>
      </View>
      <View style={{justifyContent:'center',paddingHorizontal:30,paddingTop:20}}>
        <TextInput style={styles.input} placeholder="Enter Your Name Pudang's" value={name} onChangeText={setName} />
        <View style={{alignItems:'flex-end'}}>
        <IconButton
    icon="message-draw"
    color={Colors.white}
    size={50}
    onPress={handlePress}
  />
        </View>

      </View>
      
      <View style={{padding:10}}>   
      <Text style={{color:'white',fontSize:30,
      fontFamily:'serif'}}>"""
       The secret for healthy friendship is to clear misunderstanding then and there. """
          </Text>
      </View>
      
      </View>);
    }

  

  return (
    
    <View style={{flex:1,flexDirection:'column',backgroundColor:'black'}}
    >
            <StatusBar style="light"/>

            
      <View style={{width:'100%',height:'20%',justifyContent:"center",paddingLeft:15
      }}
      ><Text style={{color:"white",fontWeight:"bold",fontSize:70}}>
        Big6
      </Text></View>
      
    <View style={{width:'100%', height:'80%',borderTopStartRadius:40,borderTopEndRadius:40,backgroundColor:'white'}}>

      <GiftedChat messages={messages} user={user} onSend={handleSend} scrollToBottomComponent={scrollToBottomComponent} showUserAvatar
      alwaysShowSend renderSend={renderSend} registerForPushNotifications={registerForPushNotifications}
      scrollToBottom
      />
    </View>  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
   flex:1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding:30,
  },
  input:{
    height:60,
    width:'100%',
    color:'white',
    borderWidth:3,
    borderColor:'white',
    marginBottom:30,
    padding:15,
    borderRadius:50,
    textAlign:'center',
    alignItems:'center'
  },
  
 
});
