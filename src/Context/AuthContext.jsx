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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // true  → show the profile-completion modal
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);

  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Create base user document (no photoURL yet)
    await setDoc(doc(db, "users", newUser.uid), {
      email: newUser.email,
      uid: newUser.uid,
      name: name || "",
      photoURL: "",
      createdAt: serverTimestamp(),
    });

    // Always show the modal for brand-new signups
    setShowProfileCompletion(true);
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const googleUser = userCredential.user;

    // Create user document if it doesn't exist
    await setDoc(
      doc(db, "users", googleUser.uid),
      {
        email: googleUser.email,
        uid: googleUser.uid,
        name: googleUser.displayName || "",
        photoURL: googleUser.photoURL || "",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    // If Google already provided a photo we don't nag them
    if (!googleUser.photoURL) {
      setShowProfileCompletion(true);
    }

    return userCredential;
  };

  const logout = async () => {
    if (user) {
      await setDoc(doc(db, "status", user.uid), { state: "offline" }, { merge: true });
    }
    setShowProfileCompletion(false);
    return signOut(auth);
  };

  const setupPresenceTracking = async (currentUser) => {
    const userStatusRef = doc(db, "status", currentUser.uid);

    await setDoc(
      userStatusRef,
      { state: "online", email: currentUser.email },
      { merge: true }
    );

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

      if (currentUser) {
        setupPresenceTracking(currentUser);

        // Check whether this user already has a profile photo in Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Show modal if no photoURL is saved yet
            if (!data.photoURL) {
              setShowProfileCompletion(true);
            }
          } else {
            // No Firestore doc at all — definitely show the modal
            setShowProfileCompletion(true);
          }
        } catch (err) {
          console.error("Error checking user profile:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        signup,
        logout,
        showProfileCompletion,
        setShowProfileCompletion,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
