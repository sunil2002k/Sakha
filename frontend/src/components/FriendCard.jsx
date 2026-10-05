import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { capitialize } from "../lib/utils";
import LanguageFlag from "./LanguageFlag";

const FriendCard = ({ friend }) => {
  const navigate = useNavigate();

  const handleMentordetail = () => {
    navigate(`/mentor/${friend._id}`);
  };

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4 cursor-pointer" onClick={handleMentordetail}>
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            <LanguageFlag language={friend.nativeLanguage} />
            Native: {capitialize(friend.nativeLanguage)}
          </span>
          <span className="badge badge-outline text-xs">
            <LanguageFlag language={friend.learningLanguage} />
            Learning: {capitialize(friend.learningLanguage)}
          </span>
        </div>

        <Link
          to={`/chat/${friend._id}`}
          className="btn btn-outline w-full"
          onClick={(e) => e.stopPropagation()}
        >
          Message
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;