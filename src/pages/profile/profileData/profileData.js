import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Flex, Avatar,IconButton, Text, Button, VStack, Input, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, SimpleGrid, useToast,
  Textarea, Menu, MenuButton,InputLeftAddon,InputGroup
} from "@chakra-ui/react";
import { PhoneIcon, EmailIcon, LinkIcon, CopyIcon } from "@chakra-ui/icons";
import { FaShare,FaTwitter, FaLinkedin, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import Navbar from '../../../components/navbar/Navbar';
import { db, storage, auth } from '../../../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import VCard  from 'vcard-creator';
import { saveAs } from 'file-saver';
import { FaLocationDot } from "react-icons/fa6";

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
  const [resumeTimeout, setResumeTimeout] = useState(null);

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
    const { name, value } = e.target;
  
    setProfile(prev => ({ ...prev, [name]: value }));
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
  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      toast({
        title: "Link copied",
        description: "Profile link copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    });
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/${profile.username}`;
    const shareData = {
      title: 'Check out my profile',
      text: 'Here is my profile on this awesome platform!',
      url: profileUrl
    };
  
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Your profile link has been shared.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Share failed",
          description: `There was an error sharing your profile: ${error.message}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Share not supported",
        description: "The Web Share API is not supported on your device.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
    if (!isEditMode && profile[field]) {
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

  const getNote = (field) => {
    switch (field) {
      case 'instagram':
        return 'Note: sample input is https://www.instagram.com/username/';
      case 'linkedin':
        return 'Note: sample input is https://www.linkedin.com/in/username/';
      case 'facebook':
        return 'Note: sample input is https://www.facebook.com/username/';
      case 'twitter':
        return 'Note: sample input is https://twitter.com/username/';
      case 'whatsapp':
        return 'Note: sample input is +1234567890';
      case 'mail':
        return 'Note: sample input is example@mail.com';
      case 'contact':
        return 'Note: sample input is 1234567890';
      default:
        return '';
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <>
      {isEditMode && <Navbar />}
      <Box maxWidth="800px" margin="auto" padding={4}>
        <Flex direction="column" align="center" bg="gray.800" p={6} borderRadius="md" boxShadow="lg">
          <Avatar
            size={{ base: "xl", md: "2xl" }}
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
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="white"
            onClick={() => isEditMode && handleIconClick('name')}
            cursor={isEditMode ? 'pointer' : 'default'}
          >
            {profile.name || 'Add Name'}
          </Text>
          <Flex direction={{ base: 'column', md: 'row' }} align="center" mt={4}>
            {(isEditMode || profile.resume) && (
              <Button colorScheme={profile.resume ? "orange" : "gray"} onClick={() => handleIconClick('resume')} mr={{ base: 0, md: 2 }} mb={{ base: 2, md: 0 }}>
                Resume
              </Button>
            )}
            <Button colorScheme="teal" onClick={handleDownloadVCard} ml={{ base: 0, md: 2 }}>
              Download Contact
            </Button>
          </Flex>
        </Flex>

        <VStack spacing={6} align="stretch" mt={6}>
          <Box>
            {(isEditMode || (profile.contact||profile.mail||profile.address||profile.whatsapp))&&<Text fontSize="xl" fontWeight="bold" mb={2}>Contact Details</Text>}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              {(isEditMode || profile.contact) && <IconButton icon={<PhoneIcon />} aria-label="Phone" onClick={() => handleIconClick('contact')} bg={profile.contact ? "linear-gradient(to right, #25D366, #128C7E)" : "gray.400"} color="white" _hover={{bg: profile.contact ?  "linear-gradient(to right, #25D366, #128C7E)" : "gray.400", }} />}
              {(isEditMode || profile.mail) && <IconButton icon={<EmailIcon />} aria-label="Email" onClick={() => handleIconClick('mail')} bg={profile.mail ? "linear-gradient(to right, #DB4437, #D62D20)" : "gray.400"} color="white" _hover={{bg: profile.mail ?  "linear-gradient(to right, #DB4437, #D62D20)": "gray.400", }} />}
              {(isEditMode || profile.address) && <IconButton icon={<FaLocationDot />} aria-label="Address" onClick={() => handleIconClick('address')} bg={profile.address ? "linear-gradient(to right, #4285F4, #34A853)" : "gray.400"} color="white" _hover={{bg: profile.address ?  "linear-gradient(to right, #4285F4, #34A853)": "gray.400", }} />}
              {(isEditMode || profile.whatsapp) && <IconButton icon={<FaWhatsapp />} aria-label="WhatsApp" onClick={() => handleIconClick('whatsapp')} bg={profile.whatsapp ? "linear-gradient(to right, #25D366, #128C7E)" : "gray.400"} color="white" _hover={{bg: profile.whatsapp ?  "linear-gradient(to right, #25D366, #128C7E)": "gray.400", }} />}
            </SimpleGrid>
          </Box>

          <Box>
          {(isEditMode || (profile.twitter||profile.linkedin||profile.facebook||profile.instagram))&&<Text fontSize="xl" fontWeight="bold" mb={2}>Social Media</Text>}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              {(isEditMode || profile.twitter) && <IconButton icon={<FaTwitter />} aria-label="Twitter" onClick={() => handleIconClick('twitter')} bg={profile.twitter ? "linear-gradient(135deg, #1DA1F2 0%, #14171A 100%)" : "gray.400"} color="white" _hover={{bg: profile.twitter ?  "linear-gradient(135deg, #1DA1F2 0%, #14171A 100%)": "gray.400", }}  />}
              {(isEditMode || profile.linkedin) && <IconButton icon={<FaLinkedin />} aria-label="LinkedIn" onClick={() => handleIconClick('linkedin')} bg={profile.linkedin ? "linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)" : "gray.400"} color="white"  _hover={{bg: profile.linkedin ?  "linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)": "gray.400", }} />}
              {(isEditMode || profile.facebook) && <IconButton icon={<FaFacebook />} aria-label="Facebook" onClick={() => handleIconClick('facebook')} bg={profile.facebook ? "linear-gradient(135deg, #3B5998 0%, #4C69BA 100%)" : "gray.400"} color="white" _hover={{bg: profile.facebook ?  "linear-gradient(135deg, #3B5998 0%, #4C69BA 100%)" : "gray.400", }}  />}
              {(isEditMode || profile.instagram) && <IconButton icon={<FaInstagram />} aria-label="Instagram" onClick={() => handleIconClick('instagram')} bg={profile.instagram ? "linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)" : "gray.400"} color="white" _hover={{bg: profile.instagram ?  "linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)" : "gray.400", }}  />}
            </SimpleGrid>
          </Box>
        </VStack>

        {isEditMode && user && (
          <Box mt={6}>
            <Flex justify="space-between" align="center">
              <Text>You can share this URL:</Text>
              <Flex align="center" ml={4}>
                <IconButton
                  icon={<CopyIcon />}
                  onClick={handleCopyLink}
                  aria-label="Copy link"
                  mr={2}
                />
                <Menu>
                  <MenuButton as={Button} leftIcon={<FaShare />} onClick={handleShare} colorScheme="green" size="sm">
                    Share
                  </MenuButton>
                </Menu>
              </Flex>
            </Flex>
            <Flex alignItems="center" mt={2} bg="gray.100" p={2} borderRadius="md" border="1px solid" borderColor="gray.300">
              <Input
                value={`${window.location.origin}/${profile.username}`}
                isReadOnly
                variant="unstyled"
                mr={2}
                bg="white"
              />
            </Flex>
          </Box>
        )}

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update {popupField === 'name' ? 'Name' : popupField}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
  {popupField === 'twitter' && (
    <InputGroup>
      <InputLeftAddon children="https://twitter.com/" />
      <Input
        name={popupField}
        value={profile[popupField].replace('https://twitter.com/', '')}
        onChange={handleChange}
        placeholder="Enter your Twitter username"
      />
    </InputGroup>
  )}
  {popupField === 'linkedin' && (
    <InputGroup>
      <InputLeftAddon children="https://www.linkedin.com/in/" />
      <Input
        name={popupField}
        value={profile[popupField].replace('https://www.linkedin.com/in/', '')}
        onChange={handleChange}
        placeholder="Enter your LinkedIn username"
      />
    </InputGroup>
  )}
  {popupField === 'facebook' && (
    <InputGroup>
      <InputLeftAddon children="https://www.facebook.com/" />
      <Input
        name={popupField}
        value={profile[popupField].replace('https://www.facebook.com/', '')}
        onChange={handleChange}
        placeholder="Enter your Facebook username"
      />
    </InputGroup>
  )}
  {popupField === 'instagram' && (
    <InputGroup>
      <InputLeftAddon children="https://www.instagram.com/" />
      <Input
        name={popupField}
        value={profile[popupField].replace('https://www.instagram.com/', '')}
        onChange={handleChange}
        placeholder="Enter your Instagram username"
      />
    </InputGroup>
  )}
  {popupField === 'whatsapp' && (
    <Input
      name={popupField}
      value={profile[popupField]}
      onChange={handleChange}
      placeholder="Enter your WhatsApp number"
    />
  )}
  {popupField === 'mail' && (
    <Input
      name={popupField}
      value={profile[popupField]}
      onChange={handleChange}
      placeholder="Enter your email"
    />
  )}
  {popupField === 'contact' && (
    <Input
      name={popupField}
      value={profile[popupField]}
      onChange={handleChange}
      placeholder="Enter your contact number"
    />
  )}
  <Text mt={2} color="gray.500" fontSize="sm">
    {getNote(popupField)}
  </Text>
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

export default ProfileData;