import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ProfileData from './pages/profile/profileData/profileData.js';
import Login from './pages/auth/Login';
import Navbar from './components/navbar/Navbar';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:userId" element={<ProfileData isEditMode={false} />} />
        <Route
          path="/profile"
          element={user ? <ProfileData isEditMode={true} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={user ? <Navigate to="/profile" /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
