import React from "react";
const SkeletonCard = () => (
  <div className="card bg-base-200 h-full border border-base-300/50 overflow-hidden">
    {/* Shimmering Image Area */}
    <div className="w-full h-48 bg-base-300 animate-pulse" />
    
    <div className="card-body p-5 space-y-4">
      {/* Title Shimmer */}
      <div className="h-6 bg-base-300 rounded-lg w-3/4 animate-pulse" />
      
      {/* Description Shimmer */}
      <div className="space-y-2">
        <div className="h-4 bg-base-300 rounded-lg w-full animate-pulse" />
        <div className="h-4 bg-base-300 rounded-lg w-5/6 animate-pulse" />
      </div>
      
      {/* Button Shimmer */}
      <div className="card-actions justify-end mt-4">
        <div className="h-8 bg-base-300 rounded-xl w-24 animate-pulse" />
      </div>
    </div>
  </div>
);
export default SkeletonCard;