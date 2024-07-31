import React from 'react';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/config';
import { Link as RouterLink } from 'react-router-dom';
import { Flex, Box, Text, Button, Link } from "@chakra-ui/react";

const Navbar = () => {
  const [user] = useAuthState(auth);

  return (
    <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" bg="gray.800" color="white">
      <Box>
        <Text fontSize="lg" fontWeight="bold">
          Joinzz
        </Text>
      </Box>
      <Box>
        {user ? (
          <Flex align="center">
            <Text mr={4}>{user.displayName}</Text>
            <Button colorScheme="red" onClick={() => signOut(auth)}>Logout</Button>
          </Flex>
        ) : (
          <Link as={RouterLink} to="/login">Login</Link>
        )}
      </Box>
    </Flex>
  );
};

export default Navbar;
