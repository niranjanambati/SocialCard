import { getFirestore} from '../../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth,onAuthStateChanged } from "firebase/auth";

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
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

    if (isEditMode && user) {
      fetchProfile();
    }
  }, [isEditMode, user]);

  const handleChange = (e) => {
    setProfile({...profile, [e.target.name]: e.target.value });
  };

  const handleEditField = (field) => {
    setEditingField(field);
  };

  const handleSave = async () => {
    if (user) {
      const profilesCollection = collection(db, 'profiles');
      const docRef = doc(profilesCollection, user.uid);
      await setDoc(docRef, profile);
    }
  };

  const getColorClass = (field) => (profile[field]? 'icon-colored' : 'icon-colorless');

  return (
    <div>
      <h1>{isEditMode? 'Edit Profile' : 'Create Profile'}</h1>
      {editingField === 'name'? (
        <input name="name" value={profile.name} onChange={handleChange} placeholder="Name" onBlur={() => setEditingField('')} />
      ) : (
        <span onClick={() => handleEditField('name')}>{profile.name}</span>
      )}
      {editingField === 'bio'? (
        <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Bio" onBlur={() => setEditingField('')} />
      ) : (
        <span onClick={() => handleEditField('bio')}>{profile.bio}</span>
      )}
      <div>
        <FontAwesomeIcon icon={faUser} className={getColorClass('name')} onClick={() => handleEditField('name')} />
        <FontAwesomeIcon icon={faEnvelope} className={getColorClass('mail')} onClick={() => handleEditField('mail')} />
        <FontAwesomeIcon icon={faPhone} className={getColorClass('contact')} onClick={() => handleEditField('contact')} />
        <FontAwesomeIcon icon={faMapMarkerAlt} className={getColorClass('address')} onClick={() => handleEditField('address')} />
        <FontAwesomeIcon icon={faFileAlt} className={getColorClass('resume')} onClick={() => handleEditField('resume')} />
      </div>
      {editingField === 'ail'? (
        <input name="mail" value={profile.mail} onChange={handleChange} placeholder="Email" onBlur={() => setEditingField('')} />
      ) : (
        <span onClick={() => handleEditField('mail')}>{profile.mail}</span>
      )}
      {editingField === 'contact'? (
        <input name="contact" value={profile.contact} onChange={handleChange} placeholder="Contact" onBlur={() => setEditingField('')} />
      ) : (
        <span onClick={() => handleEditField('contact')}>{profile.contact}</span>
      )}
      {editingField === 'address'? (
        <input name="address" value={profile.address} onChange={handleChange} placeholder="Address" onBlur={() => setEditingField('')} />
      ) : (
        <span onClick={() => handleEditField('address')}>{profile.address}</span>
      )}
      {editingField === 'esume'? (
        <input name="resume" value={profile.resume} onChange={handleChange} placeholder="Resume URL" onBlur={() => setEditingField('')} />
      ) : (
        <span onClick={() => handleEditField('resume')}>{profile.resume}</span>
      )}
           {editingField === 'esume'? (
        <input name="resume" value={profile.resume} onChange={handleChange} placeholder="Resume URL" onBlur={() => setEditingField('')} />
      ) : (
        <span onClick={() => handleEditField('resume')}>{profile.resume}</span>
      )}
      {isEditMode && (
        <button onClick={handleSave}>Save Changes</button>
      )}
    </div>
  );
};

export default ProfileData;