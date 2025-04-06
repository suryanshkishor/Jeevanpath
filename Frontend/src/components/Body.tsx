// import React from "react";
import { Brain, Rocket, Target, BookOpen } from 'lucide-react';

import FeatureCard from "./FeatureCard";

function Body() {
    return (
        <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-purple-400" />}
            title="AI-Powered Learning"
            description="Personalized learning paths adapted to your unique needs and goals"
            points={100}
          />
          <FeatureCard
            icon={<Target className="w-8 h-8 text-purple-400" />}
            title="Skill Gap Analysis"
            description="Identify and bridge crucial skill gaps in your career journey"
            points={150}
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-purple-400" />}
            title="Digital Portfolio"
            description="Track and showcase your learning achievements and credentials"
            points={200}
          />
          <FeatureCard
            icon={<Rocket className="w-8 h-8 text-purple-400" />}
            title="Career Growth"
            description="Connect with opportunities aligned to your skills and aspirations"
            points={250}
          />
        </div>
      </section>
    )
};

export default Body;