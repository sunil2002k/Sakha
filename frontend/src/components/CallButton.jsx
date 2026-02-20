import React from "react";
import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="absolute top-3 right-4 z-10">
      <button
        onClick={handleVideoCall}
        className="btn btn-primary btn-sm rounded-xl gap-2 shadow-lg shadow-primary/20 hover:scale-[1.03] hover:shadow-primary/30 transition-all duration-200"
        title="Start video call"
      >
        <VideoIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default CallButton;