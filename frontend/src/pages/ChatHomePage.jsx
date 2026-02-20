import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api.js";
import {
  CheckCircle,
  MapPin,
  UserPlus,
  Users,
  ArrowRight,
} from "lucide-react";

import { capitialize } from "../lib/utils";
import { getLanguageFlag } from "../components/FriendCard";

const ChatHomePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
    select: (data) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.users)) return data.users;
      return [];
    },
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs?.length > 0) {
      outgoingFriendReqs.forEach((req) => outgoingIds.add(req.recipient._id));
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Discover</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Meet New Learners</h2>
            <p className="text-base-content/55 text-base mt-1">
              Find perfect language exchange partners based on your profile.
            </p>
          </div>
          {friends.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-base-content/50 shrink-0">
              <Users className="w-4 h-4" />
              <span>{friends.length} friend{friends.length !== 1 ? "s" : ""} so far</span>
            </div>
          )}
        </div>

        {/* Loading */}
        {loadingUsers && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card bg-base-200 border border-base-300 animate-pulse">
                <div className="card-body p-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-base-300" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-base-300 rounded w-2/3" />
                      <div className="h-3 bg-base-300 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-base-300 rounded-full w-24" />
                    <div className="h-6 bg-base-300 rounded-full w-24" />
                  </div>
                  <div className="h-3 bg-base-300 rounded w-full" />
                  <div className="h-10 bg-base-300 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loadingUsers && recommendedUsers.length === 0 && (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body p-10 text-center gap-3">
              <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg">No recommendations yet</h3>
              <p className="text-base-content/55 text-sm max-w-xs mx-auto">
                Check back soon — we'll match you with new language partners based on your profile.
              </p>
            </div>
          </div>
        )}

        {/* User cards grid */}
        {!loadingUsers && recommendedUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedUsers.map((user) => {
              const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

              return (
                <div
                  key={user._id}
                  onClick={() => navigate(`/mentor/${user._id}`)}
                  className="group card bg-base-200 border border-base-300 hover:border-primary/25 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300"
                >
                  <div className="card-body p-6 gap-4">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-14 h-14 rounded-full ring-2 ring-base-300 group-hover:ring-primary/30 transition-all duration-300">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors duration-200 truncate">
                          {user.fullName}
                        </h3>
                        {user.location && (
                          <div className="flex items-center gap-1 text-xs text-base-content/50 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{user.location}</span>
                          </div>
                        )}
                      </div>
                      {/* Arrow hint */}
                      <ArrowRight className="w-4 h-4 text-base-content/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                    </div>

                    {/* Language badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="badge badge-secondary badge-sm font-medium gap-1">
                        {getLanguageFlag(user.nativeLanguage)}
                        Native: {capitialize(user.nativeLanguage)}
                      </span>
                      <span className="badge badge-outline badge-sm font-medium gap-1">
                        {getLanguageFlag(user.learningLanguage)}
                        Learning: {capitialize(user.learningLanguage)}
                      </span>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className="text-sm text-base-content/55 leading-relaxed line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    {/* Action button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasRequestBeenSent) sendRequestMutation(user._id);
                      }}
                      disabled={hasRequestBeenSent || isPending}
                      className={`btn btn-sm rounded-xl w-full gap-2 transition-all duration-200 mt-1 ${
                        hasRequestBeenSent
                          ? "btn-ghost text-base-content/40 cursor-default"
                          : "btn-primary hover:scale-[1.02] shadow-sm shadow-primary/20"
                      }`}
                    >
                      {hasRequestBeenSent ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Request Sent
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          Send Friend Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatHomePage;