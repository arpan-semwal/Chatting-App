import { useContext, useEffect, useState , useRef } from "react"

import Logo from "./Logo";
import {uniqBy} from 'lodash';
import { UserContext } from "../Context/UserContext";
import axios from "axios";
import Person from "./Person";

const Chat = () => {
    const [ws ,setWs] = useState(null);
    const [onlinePeople , setOnlinePeople] = useState([]);
    const [selectedUserId , setSelectedUserId] = useState(null);
    const [newMessageText , setNewMessageText] = useState('');
    const { id} = useContext(UserContext);
    const [messages , setMessages] = useState([]);
    const [offlinePeople , setOfflinePeople] = useState({});
    const divUnderMessages = useRef();

    useEffect(() => {
      connectToWs();
    } , []);


    function connectToWs(){
      const ws = new WebSocket('ws://localhost:4000');
      setWs(ws);
      ws.addEventListener('message' , handleMessage);
      ws.addEventListener('close' , () => {
        setTimeout(() => {
          console.log('Disconnected . Trying to reconnect.'),
          connectToWs();
        } , 1000)
      })
    }



    
// Showing online people
    function showOnlinePeople(peopleArray){
       const people = {};
       peopleArray.forEach(({userId , username}) => {
        people[userId] = username;
       })
       setOnlinePeople(people);
    }


    //receives messages
    function handleMessage(ev){
      const messageData = JSON.parse(ev.data);
      console.log({ev,messageData});

      if('online' in messageData){
        showOnlinePeople(messageData.online);
      }else if('text' in messageData){
        setMessages(prev => ([...prev , {...messageData}]));
      }

    }


    //send messgage
    function sendMessage(ev){
      ev.preventDefault();
       
      ws.send(JSON.stringify({
          recipient: selectedUserId,
          text: newMessageText,
          _id:Date.now(), 
      }));
    
      setMessages(prev => ([
        ...prev, 
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(), 
        }

        

      ]));
     setNewMessageText('');
    }

    useEffect(() => {
      axios.get("/people").then(res => {
        const offlinePeopleArr = res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id));
        const offlinePeople = {};
        offlinePeopleArr.forEach(p => {
          offlinePeople[p._id] = p;
        });
        
        setOfflinePeople(offlinePeople);
      })
    } , [onlinePeople])

    useEffect(() => {
      if(selectedUserId){
         axios.get('/messages/' + selectedUserId).then(res => {
          setMessages(res.data);
         })
      }
    } , [selectedUserId]);

    const onlinePeopleExcudingOurUser = {...onlinePeople};
    delete onlinePeopleExcudingOurUser[id];
    
    
    const messageWithoutDupes = uniqBy(messages, '_id');


    
  return (


    <div className="flex h-screen"> 

    {/* Divide the screen into two margins left for online people and right for chat */}

      
      {/* left margin */}
        <div className="bg-blue-100 w-1/3 ">
         <Logo/>
         {Object.keys(onlinePeopleExcudingOurUser).map(userId => (
          
          <Person
          key={userId}
          id={userId}
          online={true}
          username = {onlinePeopleExcudingOurUser[userId]}
          onClick={() => setSelectedUserId(userId)}
          selected = {userId === selectedUserId}/>
         ))}

      {Object.keys(offlinePeople).map(userId => (
          
          <Person
          key={userId} 
          id={userId}
          online={false}
          username = {offlinePeople[userId].username}
          onClick={() => setSelectedUserId(userId)}
          selected = {userId === selectedUserId}

          />


  ))}

  
</div>





{/* right margin */}


      <div className="flex flex-col h-full bg-blue-300 w-2/3 p-2 overflow-y-auto">

        <div className="flex grow">
           {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-500">&larr;Select a person from the sidebar</div>
              
            </div>
           )}



            {!!selectedUserId && (
  
            <div className="flex-grow">
                 {messageWithoutDupes.map((message, index) => (
                <div
                  key={index} // Make sure to provide a unique key for each element in the array
                     className={message.sender === id ? 'text-left' : 'text-right'}
                >
              <div
               className={`text-left inline-block p-2 my-2 rounded-sm text-sm ${
               message.sender === id
                  ? 'bg-blue-500 text-white'
                 : 'bg-white text-gray-500'
             }`}
        >
        
          {message.text}
        </div>
        </div>
      
    ))}
    <div className="h-12" ref={divUnderMessages}></div>
    
  </div>
)}


</div>

  {!!selectedUserId && (
    <form className="flex   gap-2" onSubmit={sendMessage}>
               <input type="text" 
               value={newMessageText}
               onChange={ev => setNewMessageText(ev.target.value)}
                   placeholder="Type Your message"  
                   className="bg-white flex-grow border p-2 rounded-sm"/>
                   <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                       <svg xmlns="http://www.w3.org/2000/ svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                       </svg>
                   </button>
           </form>
          )}
      </div>
    </div>
  )
}

export default Chat