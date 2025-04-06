// import React from "react";
import { Star } from "lucide-react"

function DisplayPoints(props: any) {
    return (
        <div className="fixed top-4 right-4 bg-indigo-600 px-4 py-2 rounded-full flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{props.point} Points</span>
        </div>
    )
};

export default DisplayPoints;