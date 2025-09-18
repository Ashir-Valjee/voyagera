
const Footer = () => {
    return (
        <>
            <footer className="footer p-10 bg-neutral text-neutral-content">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="footer-title">Voyagera</h3>
                            <p className="text-neutral-content/80">
                                Your trusted partner for unforgettable travel experiences around the world.
                            </p>
                        </div>
                        <div>
                            <h4 className="footer-title">Services</h4>
                            <ul className="space-y-2">
                                <li><a className="link link-hover">Flight Booking</a></li>
                                <li><a className="link link-hover">Activity Booking</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="footer-title">Support</h4>
                            <ul className="space-y-2">
                                <li><a className="link link-hover">Customer Service</a></li>
                                <li><a className="link link-hover">Help Center</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="footer-title">Company</h4>
                            <ul className="space-y-2">
                                <li><a className="link link-hover">About Us</a></li>
                                <li><a className="link link-hover">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="divider"></div>
                    <div className="text-center">
                        <p>&copy; {new Date().getFullYear()} Voyagera. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer;