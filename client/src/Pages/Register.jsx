import  { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../Context/UserContext';
const Register = () => {

    const [username , setUsername] = useState('');
    const [password , setPassword] = useState('');
    const [isLoginOrRegister , setisLoginOrRegister] = useState('register');
    

    const {setUsername:setLoggedInUsername , setId} = useContext(UserContext);
    async function handleSubmit(ev){
      ev.preventDefault();
      const url  = isLoginOrRegister === "register" ? "register" : "login";
      const {data} =   await axios.post(url , {username , password});

        setLoggedInUsername(username);
        setId(data.id);
    }




  return (
    <div className='bg-blue-50 h-screen flex items-center' >
      <form className='w-64 mx-auto mb-12' onSubmit={handleSubmit} >
        <input type='text' 
            value={username} 
            placeholder='username' 
            onChange={ev => setUsername(ev.target.value)}  
            className='block w-full rounded-sm p-2 mb-2 border'/>
        <input type="password" 
            value={password} 
            placeholder='password'  
            onChange={ev => setPassword(ev.target.value)}  
            className='block w-full rounded-sm p-2 mb-2 border' />
        <button className='bg-blue-500 text-whilte block w-full rounded-sm p-2'>
            {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>

        <div className='text-center mt-2' >
          {isLoginOrRegister === "register" && (
            <div>
               Already a member?
               <button onClick={() => setisLoginOrRegister('login')}>Login here</button>
            </div>
          )}
         {isLoginOrRegister === "login" && (
          <div>
          Dont have an account?
          <button onClick={() => setisLoginOrRegister('register')}>Register here</button>
       </div>
         )}
        </div>

      </form>

    </div>
  )
}

export default Register
