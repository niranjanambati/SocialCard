import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Flex, Avatar, Text, Button, VStack, Input, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, SimpleGrid, useToast
} from "@chakra-ui/react";
import { PhoneIcon, EmailIcon, LinkIcon } from "@chakra-ui/icons";
import { FaShare,FaTwitter, FaLinkedin, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import Navbar from '../../../components/navbar/Navbar';
import { db, storage, auth } from '../../../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import VCard  from 'vcard-creator';
import { saveAs } from 'file-saver';

const ProfileData = ({ isEditMode }) => {
  const [u] = useAuthState(auth);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState({
    name: '', bio: '', mail: '', contact: '', address: '', resume: '',
    twitter: '', linkedin: '', facebook: '', instagram: '', whatsapp: '',
    avatarUrl: '', username: '',
  });
  const [popupField, setPopupField] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      let profileData;
      if (isEditMode && user) {
        const userDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (userDoc.exists()) {
          profileData = userDoc.data();
        }
      } else if (paramUsername) {
        const usernameQuery = query(collection(db, 'profiles'), where('username', '==', paramUsername));
        const usernameQuerySnapshot = await getDocs(usernameQuery);
        if (!usernameQuerySnapshot.empty) {
          profileData = usernameQuerySnapshot.docs[0].data();
        }
      }

      if (profileData) {
        setProfile({
          name: profileData.name || user?.displayName || '',
          bio: profileData.bio || '',
          mail: profileData.mail || '',
          contact: profileData.contact || '',
          address: profileData.address || '',
          resume: profileData.resume || '',
          twitter: profileData.twitter || '',
          linkedin: profileData.linkedin || '',
          facebook: profileData.facebook || '',
          instagram: profileData.instagram || '',
          whatsapp: profileData.whatsapp || '',
          avatarUrl: profileData.avatarUrl || '',
          username: profileData.username || '',
        });
      } else if (!isEditMode) {
        navigate('/404');
      } else if (user) {
        setProfile(prevProfile => ({
          ...prevProfile,
          name: user.displayName || '',
        }));
      }
    };

    if (!loading) {
      fetchProfile();
    }
  }, [user, paramUsername, isEditMode, loading, navigate]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (user) {
      const updatedProfile = {
        ...profile,
        name: profile.name || user.displayName || '',
      };
      await setDoc(doc(db, 'profiles', user.uid), updatedProfile);
      setProfile(updatedProfile); 
      onClose();
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };


  const handleShare = () => {
    const profileUrl = `${window.location.origin}/${profile.username}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out my profile: ${profileUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleProfilePicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `profilePics/${user.uid}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const updatedProfile = { ...profile, avatarUrl: downloadURL };
      setProfile(updatedProfile);
      await setDoc(doc(db, 'profiles', user.uid), updatedProfile);
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast({
        title: "Error",
        description: "There was an error uploading your profile picture. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const handleIconClick = (field) => {
    if (field === 'resume' && profile.resume) {
      window.open(profile.resume, '_blank');
    } else if (!isEditMode && profile[field]) {
      if (field === 'mail') {
        window.location.href = `mailto:${profile[field]}`;
      } else if (field === 'contact') {
        window.location.href = `tel:${profile[field]}`;
      } else if (field === 'address') {
        window.open(`https://maps.google.com/?q=${encodeURIComponent(profile[field])}`, '_blank');
      } else if (field === 'whatsapp') {
        window.open(`https://wa.me/${profile[field]}`, '_blank');
      } else {
        window.open(profile[field], '_blank');
      }
    } else if (isEditMode) {
      setPopupField(field);
      onOpen();
    }
  };

  const handleDownloadVCard = () => {
    const vCard = new VCard();
    
    vCard
      .addName(profile.name)
      .addEmail(profile.mail)
      .addPhoneNumber(profile.contact)
      .addAddress('', '', profile.address) 
      .addURL(profile.linkedin, 'LinkedIn')
      .addURL(profile.twitter, 'Twitter')
      .addURL(profile.facebook, 'Facebook')
      .addURL(profile.instagram, 'Instagram');
  
    const vCardData = vCard.toString();
    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
    saveAs(blob, `${profile.name}.vcf`);
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <>
      {isEditMode && <Navbar />}
      <Box maxWidth="800px" margin="auto" padding={4}>
        <Flex direction="column" align="center" bg="gray.800" p={6} borderRadius="md">
          <Avatar 
            size="2xl" 
            src={profile.avatarUrl || 'https://via.placeholder.com/150'} 
            mb={4}
            onClick={() => isEditMode && document.getElementById('profilePicInput').click()}
            cursor={isEditMode ? 'pointer' : 'default'}
          />
          {isEditMode && (
            <Input
              id="profilePicInput"
              type="file"
              accept="image/*"
              onChange={handleProfilePicUpload}
              display="none"
            />
          )}
          <Text 
            fontSize="3xl" 
            fontWeight="bold" 
            color="white"
            onClick={() => isEditMode && handleIconClick('name')}
            cursor={isEditMode ? 'pointer' : 'default'}
          >
            {profile.name || 'Add Name'}
          </Text>
          <Text color="gray.400" mb={4}>{profile.bio}</Text>
          <Flex>
            {(isEditMode || profile.resume) && (
              <Button colorScheme= {profile.resume ? "orange":"gray.400"} onClick={() => handleIconClick('resume')} mr={2}>
                Resume
              </Button>
            )}
            <Button colorScheme="teal" onClick={handleDownloadVCard}>
              Download Contact
            </Button>
          </Flex>
        </Flex>

        <VStack spacing={6} align="stretch" mt={6}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={2}>Contact Details</Text>
            <SimpleGrid columns={[2, null, 4]} spacing={4}>
              {(isEditMode||profile.contact) && <IconButton icon={<PhoneIcon />} label="Phone" field="contact" onClick={() => handleIconClick('contact')} isActive={!!profile.contact} />}
              {(isEditMode||profile.mail) && <IconButton icon={<EmailIcon />} label="Email" field="mail" onClick={() => handleIconClick('mail')} isActive={!!profile.mail} />}
              {(isEditMode||profile.address) && <IconButton icon={<LinkIcon />} label="Address" field="address" onClick={() => handleIconClick('address')} isActive={!!profile.address} />}
              {(isEditMode||profile.whatsapp) && <IconButton icon={<FaWhatsapp />} label="WhatsApp" field="whatsapp" onClick={() => handleIconClick('whatsapp')} isActive={!!profile.whatsapp} />}
            </SimpleGrid>
          </Box>

          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={2}>Social Media</Text>
            <SimpleGrid columns={[2, null, 4]} spacing={4}>
              {(isEditMode||profile.twitter) && <IconButton icon={<FaTwitter />} label="Twitter" field="twitter" onClick={() => handleIconClick('twitter')} isActive={!!profile.twitter} />}
              {(isEditMode||profile.linkedin) && <IconButton icon={<FaLinkedin />} label="LinkedIn" field="linkedin" onClick={() => handleIconClick('linkedin')} isActive={!!profile.linkedin} />}
              {(isEditMode||profile.facebook) && <IconButton icon={<FaFacebook />} label="Facebook" field="facebook" onClick={() => handleIconClick('facebook')} isActive={!!profile.facebook} />}
              {(isEditMode||profile.instagram) && <IconButton icon={<FaInstagram />} label="Instagram" field="instagram" onClick={() => handleIconClick('instagram')} isActive={!!profile.instagram} />}
            </SimpleGrid>
          </Box>
        </VStack>

        {isEditMode && user && (
          <Box mt={6}>
          <Text>You can share this URL:</Text>
          <Flex alignItems="center" mt={2} bg="gray.100" p={2} borderRadius="md" border="1px solid" borderColor="gray.300">
            <Input 
              value={`${window.location.origin}/${profile.username}`} 
              isReadOnly 
              variant="unstyled" 
              mr={2}
              bg="white"
            />
            <Button leftIcon={<FaShare />} onClick={handleShare} colorScheme="green" size="sm" p={2}>
              Share
            </Button>
          </Flex>
        </Box>
        )}

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update {popupField === 'name' ? 'Name' : popupField}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                name={popupField}
                value={profile[popupField]}
                onChange={handleChange}
                placeholder={`Enter your ${popupField === 'name' ? 'name' : popupField}`}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSave}>
                Save
              </Button>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

const IconButton = ({ icon, label, field, onClick, isActive }) => (
  <Button
    leftIcon={icon}
    onClick={onClick}
    variant={isActive ? "solid" : "outline"}
    colorScheme={isActive ? "blue" : "gray"}
  >
    {label}
  </Button>
);

export default ProfileData;