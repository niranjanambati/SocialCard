import React, { useEffect,useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import ProfileData from './pages/profile/profileData/profileData';
import Login from './pages/auth/Login';
import SelectUsername from './pages/selectUsername';
import { ChakraProvider, Spinner, Center } from '@chakra-ui/react';
import { auth, db } from './firebase/config';
import { setUser, setHasUsername, selectUser, selectHasUsername } from './redux/userSlice';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const hasUsername = useSelector(selectHasUsername);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch(setUser(user));
        const userDoc = await getDoc(doc(db, 'profiles', user.uid));
        dispatch(setHasUsername(userDoc.exists() && userDoc.data().username));
      } else {
        dispatch(setUser(null));
        dispatch(setHasUsername(false));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return (
      <ChakraProvider>
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
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