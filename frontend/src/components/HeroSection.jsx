import HeroBackground from "../assets/landscapes.jpg"
import './HeroSection.css';
import FlightSearch from "../components/FlightSearch";


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
                <FlightSearch />
            </div>
        </div>
        </div>
    );
};

export default HeroSection;