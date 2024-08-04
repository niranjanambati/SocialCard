import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setHasUsername, selectUser } from '../redux/userSlice';
import { Box, Input, Text, Button, VStack, useToast } from '@chakra-ui/react';
import debounce from 'lodash/debounce';

const SelectUsername = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const db = getFirestore();
  const toast = useToast();
  const dispatch = useDispatch();

  const debouncedCheckUsername = useCallback(
    debounce(async (username) => {
      if (username) {
        if (username.includes(' ')) {
          setError('Invalid username (username should not contain space)');
        } else {
          const docRef = doc(collection(db, 'usernames'), username);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setError('Username already taken');
          } else {
            setError('Username available');
          }
        }
      } else {
        setError('');
      }
    }, 2000),
    [db]
  );

  useEffect(() => {
    debouncedCheckUsername(username);
  }, [username, debouncedCheckUsername]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSave = async () => {
    if (user && error === 'Username available') {
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
      dispatch(setHasUsername(true));
      navigate('/');
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
        <Text color={error.includes('taken') || error.includes('Invalid') ? 'red.500' : 'green.500'}>{error}</Text>
        <Button
          onClick={handleSave}
          colorScheme={error === 'Username available' ? 'green' : 'gray'}
          isDisabled={error !== 'Username available'}
        >
          Save Username
        </Button>
      </VStack>
    </Box>
  );
};

export default SelectUsername;