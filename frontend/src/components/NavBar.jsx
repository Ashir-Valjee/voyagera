import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout } from "../services/auth";
import LoginForm from "./LoginForm";

const NavBar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
    const navigate = useNavigate();

    // Update login state when localStorage changes (login/logout)
    useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("access"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
    }, []);

    const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate("/");
    };

    const MenuItems = ({ isMobile = false }) => {
    if (!isLoggedIn) {
        return (
        <>
            <li>
            <button
                className="btn btn-ghost"
                onClick={() => document.getElementById("my_modal_5")?.showModal()}
            >
                Sign In
            </button>
            </li>
            <li>
            <Link to="/signup" className="btn btn-primary">
                Sign Up
            </Link>
            </li>
        </>
        );
    }

    return (
        <>
        <li>
            <Link to="/profile">
            <img
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                alt="Profile"
            />
            </Link>
        </li>
        <li>
            <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
            </button>
        </li>
        </>
    );
    };

    return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">
            Voyagera
        </Link>
        </div>

        <div className="navbar-end flex items-center gap-2">
        {/* Mobile dropdown */}
        <div className="lg:hidden dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            </label>
            <ul
                tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
            <MenuItems isMobile={true} />
            </ul>
        </div>

        {/* Desktop menu */}
        <ul className="hidden lg:flex gap-4 items-center">
            <MenuItems />
        </ul>
        </div>

      {/* Sign In Modal */}
        <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
            <LoginForm 
            onLogin={() => setIsLoggedIn(true)}
            />
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
