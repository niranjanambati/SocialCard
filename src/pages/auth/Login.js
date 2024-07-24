import React from "react";
import { toast } from 'react-toastify';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { EvervaultCard, Icon } from "../../components/ui/evervault-card";

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
      <div className="min-h-screen flex items-center justify-center bg-black text-white" style={{backgroundImage: "repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5) 0.5px, transparent 0px, transparent 25px),repeating-linear-gradient(-90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5) 0.5px, transparent 0px, transparent 25px)"}} >
      <div className="border border-white/[0.2] dark:border-black/[0.2] flex flex-col items-center max-w-sm mx-auto p-4 relative h-[30rem] before:absolute before:top-0 before:left-0 before:w-full before:h-full bg-lines bg-black"> 
       <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white" />
        <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white" />
        <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white" />
        <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

        <EvervaultCard
          text="Joinz"
          className="bg-gradient text-white rounded-3xl p-4 flex items-center justify-center"
        />

        <button
          onClick={signInWithGoogle}
          className="mt-4 bg-white text-black rounded-full w-fit px-4 py-2 flex items-center"
        >
          <svg className="inline h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M24 9.5c3.27 0 6.21 1.17 8.53 3.1l6.36-6.36C34.34 2.79 29.49 1 24 1 14.65 1 6.7 6.88 3.42 15.44l7.44 5.78C12.7 15.49 17.92 9.5 24 9.5z"></path>
            <path fill="#34A853" d="M46.97 24.56c0-1.53-.12-3.01-.34-4.44H24v8.45h13.01c-.57 2.99-2.23 5.52-4.71 7.23l7.44 5.78C43.92 37.31 46.97 31.32 46.97 24.56z"></path>
            <path fill="#FBBC05" d="M10.86 28.02c-1.24-1.24-2.26-2.67-2.94-4.28l-7.44 5.78C2.7 34.65 8.15 41.05 15.88 43.92L23.32 38.15C19.11 36.37 15.86 32.65 14.66 28.02H10.86z"></path>
            <path fill="#EA4335" d="M24 46c6.49 0 11.99-2.15 15.99-5.67l-7.44-5.78c-2.08 1.48-4.68 2.37-7.55 2.37-5.33 0-9.84-3.61-11.45-8.45H10.86v5.44C14.94 41.92 19.12 46 24 46z"></path>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
