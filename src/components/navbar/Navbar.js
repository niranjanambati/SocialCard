import React from 'react'
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/config';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [user] = useAuthState(auth);
  return (
    <nav>
        <div>
            {
                user ? (
                    <>
                    <span>{user.displayName}</span>
                    <button onClick={()=>signOut(auth)}>Logout</button>
                    </>
                ) :(
                    <Link to="/login">Login</Link>
                )
            }
        </div>
    </nav>
  )
}

export default Navbar