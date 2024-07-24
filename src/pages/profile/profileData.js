import { getFirestore, auth, setDoc, getDoc } from '../../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React,{ useState, useEffect } from 'react';
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { collection, doc } from 'firebase/firestore';

const ProfileData = ({ isEditMode }) => {
  const db = getFirestore();
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    mail: '',
    contact: '',
    address: '',
    resume: '',
  });
  const [editingField, setEditingField] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const profilesCollection = collection(db, 'profiles');
        const docRef = doc(profilesCollection, user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setProfile({
                name: docSnap.data().name,
                bio: docSnap.data().bio,
                mail: docSnap.data().mail,
                contact: docSnap.data().contact,
                address: docSnap.data().address,
                resume: docSnap.data().resume,
              });
        }
      }
    };

    if (isEditMode) {
      fetchProfile();
    }
  }, [isEditMode]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const renderFieldInput = (field) => {
    if (editingField === field) {
      return (
        <input
          name={field}
          value={profile[field]}
          onChange={handleChange}
          onBlur={() => setEditingField('')}
          autoFocus
        />
      );
    }
    return null;
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      const profilesCollection = collection(db, 'profiles');
      const docRef = doc(profilesCollection, user.uid);
      await setDoc(docRef, profile);
    }
  };

  const getColorClass = (field) => (profile[field] ? 'icon-colored' : 'icon-colorless');

  return (
    <div>
      <h1>{isEditMode ? 'Edit Profile' : 'Create Profile'}</h1>
      <input name="name" value={profile.name} onChange={handleChange} placeholder="Name" />
      <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Bio" />
      {renderFieldInput(editingField)}
      <div>
        <FontAwesomeIcon icon={faUser} className={getColorClass('name')} onClick={() => setEditingField('name')} />
        <FontAwesomeIcon icon={faEnvelope} className={getColorClass('mail')} onClick={() => setEditingField('mail')} />
        <FontAwesomeIcon icon={faPhone} className={getColorClass('contact')} onClick={() => setEditingField('contact')} />
        <FontAwesomeIcon icon={faMapMarkerAlt} className={getColorClass('address')} onClick={() => setEditingField('address')} />
        <FontAwesomeIcon icon={faFileAlt} className={getColorClass('resume')} onClick={() => setEditingField('resume')} />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default ProfileData;