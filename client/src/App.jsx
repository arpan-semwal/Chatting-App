
import axios from 'axios'
import { UserContextProvider ,  } from './Context/UserContext';

import Routes from './Pages/Routes';



function App() {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;
  

  return (
    <UserContextProvider>
      <Routes/>
    </UserContextProvider>
   
  )
}

export default App
