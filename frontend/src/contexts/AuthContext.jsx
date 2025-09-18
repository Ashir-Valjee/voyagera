/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as authLogin, logout as authLogout, signup } from "../services/auth";
import { fetchUserProfile } from "../services/profile"

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Function to check if user is already logged in
    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('access');
            if (token) {
                // Token exists, try to get user info
                const userData = await fetchUserProfile();
                setUser(userData);
            }
        } catch (error) {
            console.log(error, 'No valid session found');
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
            const userData = await fetchUserProfile();
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
        // Get tokens
        await authLogin(email, password);
        
        // Get user data with the new token
        const userData = await fetchUserProfile();

        // Update state
        setUser(userData);
        
        return { success: true, user: userData };
    } catch (error) {
        // If any step fails, perform a full logout to clean up tokens
        authLogout(); 
        setUser(null);
        throw error; 
    }
};

    // Enhanced logout function
    const handleLogout = () => {
        authLogout(); // Clear tokens from localStorage
        setUser(null); // Clear user from state
    };

    const signupAction = async (credentials) => {
        try {
            await signup(credentials.email, credentials.password);
            
            await refreshUser();

            navigate("/profile");
        } catch (err)
        {
            console.error(err);
            throw err; 
        }
    };

    const updateUser = (newUserData) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, ...newUserData };
        });
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login: handleLogin,
        logout: handleLogout,
        loading,
        refreshUser,
        signupAction,
        updateUser
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