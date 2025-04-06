// import React from "react";

function FeatureCard(props: any) {
    return (
        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 hover:-translate-y-1 backdrop-blur-lg border border-gray-700">
            <div className="mb-4 relative">
                {props.icon}
                <div className="absolute -top-2 -right-2 bg-purple-500 text-xs px-2 py-1 rounded-full">
                    +{props.points} pts
                </div>
            </div>
            <h3 className="text-xl font-semibold text-purple-300 mb-2">{props.title}</h3>
            <p className="text-gray-400">{props.description}</p>
        </div>
    )
};

export default FeatureCard;