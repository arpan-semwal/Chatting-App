import { useState } from 'react'
import Register from './Pages/Register'
import axios from 'axios'



function App() {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;

  return (
   <Register/>
  )
}

export default App
