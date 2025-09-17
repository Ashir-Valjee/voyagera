import React, { useEffect, useState } from "react";
import { fetchTopDestinations } from "../services/destinations";

export default function TopDestinations({ isOpen, onClose }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h2 className="text-2xl font-bold mb-4">Top 5 Destinations</h2>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
            <ul className="space-y-2">
                {destinations.map((dest, idx) => (
                <li key={idx} className="border-b pb-1 flex justify-between">
                    <span>{dest.name}</span>
                    <span className="font-semibold">{dest.count}</span>
                </li>
                ))}
            </ul>
            )}

            <button className="btn btn-secondary mt-4" onClick={onClose}>
            Close
            </button>
        </div>
        </div>
    );
    }
