import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { Box, Input, Text, Button, VStack, useToast } from '@chakra-ui/react';

const SelectUsername = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const db = getFirestore();
  const toast = useToast();

  useEffect(() => {
    const checkUsername = async () => {
      if (username) {
        const docRef = doc(collection(db, 'usernames'), username);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setError('Username already taken');
        } else {
          setError('Username available');
        }
      } else {
        setError('');
      }
    };

    const timeoutId = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, db]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSave = async () => {
    if (user) {
      if (error === 'Username available') {
        const userRef = doc(collection(db, 'profiles'), user.uid);
        await setDoc(userRef, { username }, { merge: true });
        const usernameRef = doc(collection(db, 'usernames'), username);
        await setDoc(usernameRef, { uid: user.uid });
        toast({
          title: "Username saved",
          description: "Your username has been successfully set.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        console.log("Navigating home");
        navigate(`/`);
      }
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bg="black" color="white">
      <VStack spacing={4}>
        <Input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Choose a username"
          bg="white"
          color="black"
        />
        <Text color={error.includes('taken') ? 'red.500' : 'green.500'}>{error}</Text>
        <Button
          onClick={handleSave}
          colorScheme={error.includes('taken') ? 'gray' : 'green'}
          isDisabled={error.includes('taken')}
        >
          Save Username
        </Button>
      </VStack>
    </Box>
  );
};

export default SelectUsername;