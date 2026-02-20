import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      uid: user.uid,
      name: name || "",
      createdAt: serverTimestamp(),
    });
    
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Create user document in Firestore if it doesn't exist
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      uid: user.uid,
      name: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
    }, { merge: true });
    
    return userCredential;
  };

  const logout = async () => {
    if (user) {
      await setDoc(doc(db, "status", user.uid), { state: "offline" }, { merge: true });
    }
    return signOut(auth);
  };

  const setupPresenceTracking = async (currentUser) => {
    const userStatusRef = doc(db, "status", currentUser.uid);

    // Mark online immediately
    await setDoc(
      userStatusRef,
      { state: "online", email: currentUser.email },
      { merge: true }
    );

    // Handle when user closes tab or refreshes
    const handleUnload = async () => {
      await setDoc(userStatusRef, { state: "offline" }, { merge: true });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      let cleanup;

      if (currentUser) {
        cleanup = await setupPresenceTracking(currentUser);
      }

      return cleanup;
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
