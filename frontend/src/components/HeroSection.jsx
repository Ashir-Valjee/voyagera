import HeroBackground from "../assets/landscape.jpg"
import './HeroSection.css';


const HeroSection = () => {
    return (
        <div className="hero min-h-[70vh] relative">
        <div className="hero-overlay bg-opacity-60">
            <img 
            src={HeroBackground} 
            alt="Beautiful tropical destination" 
            className="hero-background"
            />
        </div>

        <div className="hero-content text-center text-neutral-content">
            <div className="max-w-4xl">
                <h1 className="mb-5 text-5xl font-bold">
                    Your Next Adventure
                    <span className="block text-accent">Starts Here</span>
                </h1>
                <p className="mb-5 text-xl">
                    Discover amazing places at exclusive deals. Eat, Shop, Visit interesting places around the world.
                </p>
                
                {/* Search Card */}
                <div className="card bg-base-100 shadow-xl text-base-content">
                    <div className="card-body">
                        <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">📍 From</span>
                                </label>
                                <input type="text" placeholder="From" className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">📍 To</span>
                                </label>
                                <input type="text" placeholder="To" className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">📅 Date</span>
                                </label>
                                <input type="date" className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">📅 Return Date</span>
                                </label>
                                <input type="date" className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">👥 Passengers</span>
                                </label>
                                <input type="text" placeholder="1 Adult" className="input input-bordered" />
                            </div>
                        </div>
                            <button className="btn btn-primary btn-lg">
                                🔍 Search Flights
                            </button>
                        </div>      
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default HeroSection;