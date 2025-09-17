import { Link, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import { useAuth } from '../contexts/AuthContext';
import PlaceholderImage from "../assets/Portrait_Placeholder.png";

const NavBar = () => {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Menu items component for reuse in mobile and desktop
    const MenuItems = () => {
        if (!isAuthenticated) {
            return (
                <>
                    <li>
                        <button 
                            className="btn btn-ghost justify-start"
                            onClick={() => {
                                document.getElementById('login_modal').showModal();
                                // Close mobile dropdown if open
                                document.activeElement?.blur();
                            }}
                        >
                            Sign In
                        </button>
                    </li>
                    <li>
                        <Link to="/signup" className="btn btn-primary justify-start">
                            Sign Up
                        </Link>
                    </li>
                </>
            );
        }

        return (
            <>
                {/* Remove the welcome message from here - no longer in mobile menu */}
                <li>
                    <Link to="/profile" className="flex items-center gap-2">
                        <div className="avatar">
                            <div className="w-8 rounded-full">
                                <img
                                    src={user?.profilePic || PlaceholderImage}
                                    alt="Profile"
                                />
                            </div>
                        </div>
                        <span>Profile</span>
                    </Link>
                </li>
                <li>
                    <button onClick={handleLogout} className="btn btn-outline btn-sm lg:btn-md">
                        Logout
                    </button>
                </li>
            </>
        );
    };

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
                <div className="navbar-start">
                    <Link to="/" className="btn btn-ghost text-xl">Voyagera</Link>
                </div>
                <div className="navbar-end">
                    <span className="loading loading-spinner loading-sm"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl">Voyagera</Link>
            </div>
            
            <div className="navbar-end flex items-center gap-2">
                {/* Welcome message - always visible when authenticated */}
                {isAuthenticated && (
                    <span className="text-sm mr-2">
                        Welcome, {user?.email || user?.username}!
                    </span>
                )}

                {/* Mobile dropdown */}
                <div className="dropdown dropdown-end lg:hidden">
                    <label tabIndex={0} className="btn btn-ghost btn-circle">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </label>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow bg-base-100 rounded-box w-52">
                        <MenuItems />
                    </ul>
                </div>

                {/* Desktop menu */}
                <div className="hidden lg:flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile">
                                <div className="avatar">
                                    <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                        <img
                                            src={user?.profilePic || PlaceholderImage}
                                            alt="Profile"
                                        />
                                    </div>
                                </div>
                            </Link>
                            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className="btn btn-ghost"
                                onClick={() => document.getElementById('login_modal').showModal()}
                            >
                                Sign In
                            </button>
                            <Link to="/signup" className="btn btn-primary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Login Modal */}
            <dialog id="login_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <LoginForm />
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default NavBar;