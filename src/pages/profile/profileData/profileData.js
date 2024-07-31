import { getFirestore } from '../../../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { faTwitter, faLinkedin, faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import './profileData.css';
import Navbar from '../../../components/navbar/Navbar';
import { useParams } from 'react-router-dom';
import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'

const ProfileData = ({ isEditMode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const db = getFirestore();
  const { userId: paramUserId } = useParams();
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
  const [showPopup, setShowPopup] = useState(false);
  const [popupField, setPopupField] = useState('');
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(paramUserId || '');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        const profilesCollection = collection(db, 'profiles');
        const docRef = doc(profilesCollection, userId);
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

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (userId) {
      const profilesCollection = collection(db, 'profiles');
      const docRef = doc(profilesCollection, userId);
      await setDoc(docRef, profile);
      setShowPopup(false);
    }
  };

  const handleIconClick = (field) => {
    const url = profile[field];
    if (!isEditMode) {
      if (field === 'mail' && url) {
        window.location.href = `mailto:${url}`;
      } else if (field === 'contact' && url) {
        navigator.clipboard.writeText(url);
        alert('Phone number copied to clipboard!');
      } else if (field === 'address' && url) {
        navigator.clipboard.writeText(url);
        alert('Address copied to clipboard!');
      } else if (field === 'whatsapp' && url) {
        window.open(`https://wa.me/${url}`, '_blank');
      } else if (url) {
        window.open(url, '_blank');
      }
    } else {
      setPopupField(field);
      setShowPopup(true);
    }
  };

  return (
    <>
      {isEditMode && <Navbar />}
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-info">
            <h1>{profile.name}</h1>
          </div>
        </div>
        <div className="contact-actions">
          <a className={profile.resume ? 'resume' : 'gray-link'} onClick={() => handleIconClick('resume')}>Resume</a>
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
            {(isEditMode || profile.facebook) && (
              <div className="icon-item">
                <FontAwesomeIcon icon={faFacebook} className={`icon ${profile.facebook ? 'facebook' : 'icon-gray'}`} onClick={() => handleIconClick('facebook')} />
              </div>
            )}
            <div className="icon-item">
              <FontAwesomeIcon icon={faInstagram} className={`icon ${profile.instagram ? 'instagram' : 'icon-gray'}`} onClick={() => handleIconClick('instagram')} />
            </div>
          </div>
        </div>
        {isEditMode && showPopup && (
          <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update {popupField}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <input
                type="text"
                name={popupField}
                value={profile[popupField]}
                onChange={handleChange}
                placeholder={`Enter your ${popupField}`}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={handleSave}>
                Save
              </Button>
              <Button variant='ghost' onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        )}
        {isEditMode && user && (
          <div className="share-url">
            <div>
              <p>You can share this URL:</p>
            </div>
            <div>
              <input type="text" value={`${window.location.origin}/${user.uid}`} readOnly />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileData;
