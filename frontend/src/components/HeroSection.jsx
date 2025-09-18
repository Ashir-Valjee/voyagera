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
            <div className=" mb-2max-w-4xl">
                {/* <h1 className=" text-5xl font-bold text-shadow-lg ">
                    Your Next Adventure
                </h1> */}
                <h2 className="mb-2 text-5xl font-bold drop-shadow-[0_0_6px_rgba(135,206,250,0.6)]">
                    Your Next Adventure
                </h2>

                <h2 className="mb-5 text-5xl font-bold  drop-shadow-[0_0_6px_rgba(135,206,250,0.6)]">
                    Starts Here
                </h2>
                {/* <h1 className="mb-5 text-5xl font-bold">
                    Your Next Adventure
                    <span className="block ">Starts Here</span>
                </h1> */}


                <p className="mb-5 text-xl text-shadow-lg">
                    Experience the world like never before—exclusive deals, curated experiences, unforgettable moments.
                </p>
                <FlightSearch />
            </div>
        </div>
        </div>
    );
};

export default HeroSection;