import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        // Show a loading spinner while checking auth
        return <span className="loading loading-spinner text-primary"></span>;
    }

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/" replace />;
    }

    // User is authenticated, render the protected component
    return children;
}