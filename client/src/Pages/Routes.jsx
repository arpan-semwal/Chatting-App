import Register from "./Register"
import { useContext } from "react";
import { UserContext } from "../Context/UserContext";


export default function Routes(){
    const {username} = useContext(UserContext);
    
    

    if(username){
        return "Logged in!" + username;
    }
    return(
        <Register/>
    )
}