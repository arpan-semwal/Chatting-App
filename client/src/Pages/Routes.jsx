import Register from "./Register"
import { useContext } from "react";
import { UserContext } from "../Context/UserContext";
import Chat from "../components/Chat";


export default function Routes(){
    const {username} = useContext(UserContext);
    
    

    if(username){
        return <Chat/>
    }
    return(
        <Register/>
    )
}