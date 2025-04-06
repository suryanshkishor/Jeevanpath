import { useState } from 'react';

import VoiceChatbot from './components/VoiceChatbot';
import DisplayPoints from './components/DisplayPoints';
import Hero from './components/Hero';
import Body from './components/Body';

function App() {
  const [isChatbotActive, setIsChatbotActive] = useState(false);
  const [points, setPoints] = useState(10);

  const earnPoints = (amount: number) => {
    setPoints(prev => prev + amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <DisplayPoints point={points} />
      <Hero setIsChatbotActive={setIsChatbotActive} />
      <Body />
      {isChatbotActive && (<VoiceChatbot onClose={() => setIsChatbotActive(false)} onEarnPoints={earnPoints} />)}

      {/* <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}
      </style> */}
    </div>
  );
}

export default App;