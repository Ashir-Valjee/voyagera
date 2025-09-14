
const NavBar = () => {
    return (
        <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
            <div className="navbar-start">
                    <a className="btn btn-ghost text-xl">
                        <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center text-white text-lg">
                        </div>
                        Voyagera
                    </a>
            </div>
            
            <div className="navbar-end">
                <a className="btn btn-ghost">Sign In</a>
                <a className="btn btn-primary">Sign Up</a>
            </div>
        </div>
    )
}

export default NavBar;