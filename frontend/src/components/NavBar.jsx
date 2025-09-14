import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl">Voyagera</Link>
            </div>
            
            <div className="navbar-end">
                <a className="btn btn-ghost">Sign In</a>
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
        </div>
    )
}

export default NavBar;