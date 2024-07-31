import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';

const SelectUsername = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const db = getFirestore();

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

    checkUsername();
  }, [username, db]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSave = async () => {
    if (user) {
      if (error === 'Username available') {
        const userRef = doc(collection(db, 'users'), user.uid);
        await setDoc(userRef, { username }, { merge: true });
        const usernameRef = doc(collection(db, 'usernames'), username);
        await setDoc(usernameRef, { uid: user.uid });
        navigate(`/${username}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center">
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Choose a username"
          className="mb-2 p-2 text-black"
        />
        <p className={`text-${error.includes('taken') ? 'red' : 'green'}-500`}>{error}</p>
        <button
          onClick={handleSave}
          className={`bg-white text-black rounded-full w-fit px-4 py-2 flex items-center ${error.includes('taken') ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={error.includes('taken')}
        >
          Save Username
        </button>
      </div>
    </div>
  );
};

export default SelectUsername;
