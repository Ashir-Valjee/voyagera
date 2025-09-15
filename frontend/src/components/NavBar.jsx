import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';

const NavBar = () => {
    return (
        <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl">Voyagera</Link>
            </div>
            
            <div className="navbar-end">
                <button className="btn btn-ghost" onClick={()=>document.getElementById('my_modal_5').showModal()}>Sign In</button>
                <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <LoginForm />
                    <div className="modal-action">
                    <form method="dialog">
                        <button className="btn">Close</button>
                    </form>
                    </div>
                </div>
                </dialog>

                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
        </div>
    )
}

export default NavBar;