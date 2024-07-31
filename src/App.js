import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import ProfileData from './pages/profile/profileData/profileData';
import Login from './pages/auth/Login';
import SelectUsername from './pages/selectUsername';
import { ChakraProvider } from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/react';
import { auth, db } from './firebase/config';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        console.log("User is logged in: ", user);
        const userDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (userDoc.exists()) {
          const username = userDoc.data().username;
          console.log("Username found: ", username);
          setHasUsername(username);
        } else {
          console.log("No username found");
          setHasUsername(false);
        }
      } else {
        console.log("No user is logged in");
        setHasUsername(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  if (loading) {
    return (
      <ChakraProvider>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spinner size="xl" />
        </div>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/select-username" element={user && !hasUsername ? <SelectUsername /> : <Navigate to="/" />} />
          <Route path="/:username" element={<ProfileData isEditMode={false} />} />
          <Route
            path="/"
            element={
              user 
                ? hasUsername 
                  ? <ProfileData isEditMode={true} /> 
                  : <Navigate to="/select-username" />
                : <Navigate to="/login" />
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
};

export default App;
