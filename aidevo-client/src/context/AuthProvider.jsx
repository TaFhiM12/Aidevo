import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase.init';

const googleProvider = new GoogleAuthProvider(); 

const AuthProvider = ({children}) => {
    
    const [user , setUser] = useState(null);
    const [loading , setLoading] = useState(true);

    const createUser = (email , password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth,email,password);
    }

    const signInUser = (email , password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth , email , password);
    }

    const updateProfileUser = (profile) => {
        setLoading(true);
        return updateProfile(auth.currentUser, profile);
    }

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth , googleProvider);
    }

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }
    

    useEffect( () => {
        const unSubscribe = onAuthStateChanged(auth , currentUser => {
            setUser(currentUser);
            setLoading(false);
        })

        return () => {
            unSubscribe();
        }
    } , [])
    

    const userinfo = {
        user,
        loading,
        setLoading,
        setUser,
        createUser,
        signInUser,
        updateProfileUser,
        signInWithGoogle,
        logOut
    }
    return <AuthContext value={userinfo}>
        {children}
    </AuthContext>
};

export default AuthProvider;