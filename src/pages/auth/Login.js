import React from "react";
import { toast } from 'react-toastify';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { EvervaultCard, Icon } from "../../components/ui/evervault-card";
import { Button, Box, Flex, Text } from "@chakra-ui/react";

const Login = () => {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const signInWithGoogle = (e) => {
    e.preventDefault();
    signInWithPopup(auth, provider)
      .then((result) => {
        toast.success("Login Successful");
        navigate("/");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <Flex minHeight="100vh" alignItems="center" justifyContent="center" bg="black" color="white" backgroundImage="repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5) 0.5px, transparent 0px, transparent 25px),repeating-linear-gradient(-90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5) 0.5px, transparent 0px, transparent 25px)">
      <Box borderWidth="1px" borderColor="white.200" display="flex" flexDirection="column" alignItems="center" maxWidth="sm" mx="auto" p={4} position="relative" height="30rem" bg="black">
        <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white" />
        <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white" />
        <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white" />
        <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

        <EvervaultCard
          text="Joinz"
          className="bg-gradient text-white rounded-3xl p-4 flex items-center justify-center"
        />

        <Button
          onClick={signInWithGoogle}
          mt={4}
          bg="white"
          color="black"
          borderRadius="full"
          px={4}
          py={2}
          display="flex"
          alignItems="center"
          zIndex={10}
          leftIcon={
            <svg className="inline h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          }
        >
          Sign in with Google
        </Button>
      </Box>
    </Flex>
  );
}

export default Login;