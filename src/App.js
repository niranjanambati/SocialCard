import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ProfileData from './pages/profile/profileData/profileData.js';
import Login from './pages/auth/Login';
import { ChakraProvider } from '@chakra-ui/react'

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
    <ChakraProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/:userId" element={<ProfileData isEditMode={false} />} />
        <Route
          path="/"
          element={user ? <ProfileData isEditMode={true} /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;
