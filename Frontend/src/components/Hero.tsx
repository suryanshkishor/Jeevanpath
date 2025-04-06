// import React from "react";

interface HeroProps {
    setIsChatbotActive: React.Dispatch<React.SetStateAction<boolean>>;
}

function Hero(props: HeroProps) {
    return (
        <header className="container mx-auto px-4 py-16 text-center">
            <div className="animate-float">
                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
                    JeevanPath
                </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
                Your AI-Powered Journey to Lifelong Learning
            </p>
            <button
                onClick={() => props.setIsChatbotActive(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 hover:shadow-lg"
            >
                Start Learning Journey
            </button>
        </header>
    )
};

export default Hero;