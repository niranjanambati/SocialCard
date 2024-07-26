import './App.css';
import { BrowserRouter, Navigate, Route, Routes,redirect} from "react-router-dom"
import Navbar from './components/navbar/Navbar';
import Login from './pages/auth/Login';
import Home from './pages/home/Home';
import React, { useEffect, useState } from 'react';
import ProfileData from './pages/profile/profileData';
import auth from "./firebase/config"
import { getAuth,onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/profile/edit" element={user ? <ProfileData isEditMode /> : <Navigate to="/" />} />
        <Route path="/profile/create" element={<ProfileData isEditMode={false} />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
