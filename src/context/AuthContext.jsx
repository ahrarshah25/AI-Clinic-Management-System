import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../Firebase/config";
import AuthContext from "./auth-context";
import { clearSelectedRole, setSelectedRole } from "../utils/roleStorage";
import { getUserProfile } from "../services/clinicFirestoreService";
import { normalizeRole, ROLES } from "../constants/roles";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateUserProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      return null;
    }

    try {
      const profileDoc = await getUserProfile(currentUser.uid);
      const normalizedRole = normalizeRole(profileDoc?.role);
      const normalizedProfile = profileDoc
        ? { ...profileDoc, role: normalizedRole || profileDoc.role }
        : null;

      if (
        normalizedProfile &&
        normalizedRole &&
        normalizedRole !== ROLES.PATIENT &&
        !normalizedProfile.isVerified
      ) {
        await signOut(auth);
        clearSelectedRole();
        setUser(null);
        setProfile(null);
        return null;
      }

      if (normalizedRole) {
        setSelectedRole(normalizedRole);
      }

      setUser(currentUser);
      setProfile(normalizedProfile);
      return normalizedProfile;
    } catch {
      setUser(currentUser);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        await hydrateUserProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await hydrateUserProfile(currentUser);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [hydrateUserProfile]);

  const refreshProfile = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      await hydrateUserProfile(null);
      return null;
    }
    return hydrateUserProfile(currentUser);
  }, [hydrateUserProfile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAuthenticated: Boolean(user),
      isLoading,
      refreshProfile,
    }),
    [isLoading, profile, refreshProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
