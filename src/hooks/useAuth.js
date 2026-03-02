import { useAuth as useAuthContext } from "../context/useAuth";

export const useAuth = () => {
  const { user, profile, isLoading, isAuthenticated, refreshProfile } = useAuthContext();

  return {
    user,
    userData: profile,
    loading: isLoading,
    isAuthenticated,
    refreshProfile,
  };
};
