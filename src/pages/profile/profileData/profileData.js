import { getFirestore } from '../../../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { faTwitter, faLinkedin, faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import './profileData.css'

const ProfileData = ({ isEditMode }) => {
  const db = getFirestore();
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    mail: '',
    contact: '',
    address: '',
    resume: '',
    twitter: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
  });
  const [editingField, setEditingField] = useState('');
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupField, setPopupField] = useState('');

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
          const data = docSnap.data();
          setProfile({
            name: data.name || '',
            bio: data.bio || '',
            mail: data.mail || '',
            contact: data.contact || '',
            address: data.address || '',
            resume: data.resume || '',
            twitter: data.twitter || '',
            linkedin: data.linkedin || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            whatsapp: data.whatsapp || '',
          });
        }
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (user) {
      const profilesCollection = collection(db, 'profiles');
      const docRef = doc(profilesCollection, user.uid);
      await setDoc(docRef, profile);
      setShowPopup(false);
    }
  };

  const handleIconClick = (field) => {
    if (isEditMode) {
      setPopupField(field);
      setShowPopup(true);
    } else {
      const url = profile[field];
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <h2>Senior Software Engineer</h2>
          <p>EY</p>
        </div>
      </div>
      <div className="contact-actions">
        <button className={`contact-btn ${profile.resume ? '' : 'gray-link'}`} onClick={() => handleIconClick('resume')}>Resume</button>
      </div>
      <div className="profile-section">
        <h3>Bio :</h3>
        <p>{profile.bio}</p>
      </div>
      <div className="profile-section">
        <h3>Contact Details</h3>
        <div className="icon-row">
          <div className="icon-item">
            <FontAwesomeIcon icon={faPhone} className={`icon ${profile.contact ? 'phone' : 'icon-gray'}`} onClick={() => handleIconClick('contact')} />
            
          </div>
          <div className="icon-item">
            <FontAwesomeIcon icon={faEnvelope} className={`icon ${profile.mail ? 'mail' : 'icon-gray'}`} onClick={() => handleIconClick('mail')} />
            
          </div>
          <div className="icon-item">
            <FontAwesomeIcon icon={faMapMarkerAlt} className={`icon ${profile.address ? 'google-maps-gradient' : 'icon-gray'}`} onClick={() => handleIconClick('address')} />
            
          </div>
          <div className="icon-item">
            <FontAwesomeIcon icon={faWhatsapp} className={`icon ${profile.whatsapp ? 'whatsapp' : 'icon-gray'}`} onClick={() => handleIconClick('whatsapp')} />
            
          </div>
        </div>
      </div>
      <div className="profile-section">
        <h3>Social Media</h3>
        <div className="icon-row">
          <div className="icon-item">
            <FontAwesomeIcon icon={faTwitter} className={`icon ${profile.twitter ? 'twitter' : 'icon-gray'}`} onClick={() => handleIconClick('twitter')} />
            
          </div>
          <div className="icon-item">
            <FontAwesomeIcon icon={faLinkedin} className={`icon ${profile.linkedin ? 'linkedin' : 'icon-gray'}`} onClick={() => handleIconClick('linkedin')} />
            
          </div>
          <div className="icon-item">
            <FontAwesomeIcon icon={faFacebook} className={`icon ${profile.facebook ? 'facebook' : 'icon-gray'}`} onClick={() => handleIconClick('facebook')} />
            
          </div>
          <div className="icon-item">
            <FontAwesomeIcon icon={faInstagram} className={`icon ${profile.instagram ? 'instagram' : 'icon-gray'}`} onClick={() => handleIconClick('instagram')} />
            
          </div>
        </div>
      </div>
      {isEditMode && showPopup && (
        <div className="popup-card">
          <h3>Update {popupField}</h3>
          <input
            type="text"
            name={popupField}
            value={profile[popupField]}
            onChange={handleChange}
            placeholder={`Enter your ${popupField}`}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      )}
      {isEditMode && user && (
        <div className="share-url">
          <div>
          <p>You can share this URL:</p>
          </div>
          <div>
          <input type="text" value={`${window.location.origin}/profile/${user.uid}`} readOnly />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileData;
