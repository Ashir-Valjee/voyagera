import React, { useEffect, useState, useRef } from "react";
import { fetchTopDestinations } from "../services/destinations";

export default function TopDestinations({ isOpen, onClose }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);

    // Example mapping of emojis for each city
    const cityEmojis = {
        Vilnius: "🏰",
        Abuja: "🌴",
        Manila: "🌊",
        Melbourne: "🎡",
        Lyon: "🍷",
    };

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchTopDestinations()
                .then((data) => {
                    setDestinations(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to fetch top destinations:", err);
                    setError("Could not load destinations");
                    setLoading(false);
                });
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute mt-2 left-0 bg-white/60 backdrop-blur-md rounded-lg w-64 p-4 z-50"
        >
            {/* Teal heading */}
            <h2 className="text-md font-semibold mb-3 text-teal-500 italic">
                ✈️ Popular destinations this month!
            </h2>

            {loading && <p className="text-sm">Loading...</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {!loading && !error && (
                <ul className="space-y-2">
                    {destinations.map((dest, idx) => (
                        <li key={idx} className="flex items-center gap-2 font-bold">
                            <span>{cityEmojis[dest.name] || "✈️"}</span>
                            <span>{dest.name}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Close button top-right */}
            <button
                className="absolute top-2 right-2 font-bold text-lg"
                onClick={onClose}
            >
                ✕
            </button>
        </div>
    );
}
