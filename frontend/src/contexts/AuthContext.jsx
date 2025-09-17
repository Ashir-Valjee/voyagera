import { createContext, useContext, useState, useEffect } from "react";
import { login as authLogin, logout as authLogout } from "../services/auth";
import fetchMe from "../services/user";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Function to check if user is already logged in
    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('access');
            if (token) {
                // Token exists, try to get user info
                const userData = await fetchMe();
                setUser(userData);
            }
        } catch (error) {
            console.log('No valid session found');
            // Clear invalid token
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
        } finally {
            setLoading(false);
        }
    };

    // Add this new method to refresh user after signup
    const refreshUser = async () => {
        try {
            const userData = await fetchMe();
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            return null;
        }
    };

    // Enhanced login function
    const handleLogin = async (email, password) => {
        try {
            // Use the existing auth service
            const tokens = await authLogin(email, password);
            
            // Get user data after successful login
            const userData = await fetchMe();
            setUser(userData);
            
            return { success: true, user: userData };
        } catch (error) {
            throw error; // Let the component handle the error
        }
    };

    // Enhanced logout function
    const handleLogout = () => {
        authLogout(); // Clear tokens from localStorage
        setUser(null); // Clear user from state
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login: handleLogin,
        logout: handleLogout,
        loading,
        refreshUser  // Add this
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}