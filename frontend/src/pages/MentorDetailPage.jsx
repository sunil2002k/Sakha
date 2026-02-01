import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircleIcon, UserPlusIcon, CheckCircleIcon, XCircleIcon, FileTextIcon, MapPinIcon, BookOpenIcon } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import useAuthUser from "../hooks/useAuthUser";
import PageLoader from "../components/PageLoader";

const MentorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  // Fetch mentor details
  const { data: mentor, isLoading: isMentorLoading, error: mentorError } = useQuery({
    queryKey: ["mentor", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Fetch friend request status
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/users/friend-requests/all`);
      return response.data;
    },
    enabled: !!authUser,
  });

  // Send friend request mutation
  const { mutate: sendFriendRequest, isPending: isSendingRequest } = useMutation({
    mutationFn: async () => {
      return await axiosInstance.post(`/users/friend-request/${id}`);
    },
    onSuccess: () => {
      toast.success("Friend request sent!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    },
  });

  if (isMentorLoading) return <PageLoader />;

  if (mentorError || !mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4">Mentor not found</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if they are already friends
  const areFriends = authUser?.friends?.includes(mentor._id);

  // Check if friend request is already sent
  const friendRequestSent = friendRequests?.outgoingReqs?.some(
    (req) => req.recipient._id === mentor._id
  );

  // Check if current user is viewing their own profile
  const isOwnProfile = authUser?._id === mentor._id;

  const handleSendFriendRequest = () => {
    if (!authUser) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    sendFriendRequest();
  };

  const handleDownloadResume = () => {
    if (!mentor.resume) {
      toast.error("Resume not available");
      return;
    }

    // If resume is a data URL, download it
    if (mentor.resume.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = mentor.resume;
      link.download = `${mentor.fullName}-Resume`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (mentor.resume.startsWith("http")) {
      const url = mentor.resume.includes("?")
        ? mentor.resume + "&dl=1"
        : mentor.resume + "?dl=1";
      window.open(url, "_blank");
    } else {
      // Fallback: just open the URL
      window.open(mentor.resume, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm mb-6"
          >
            ← Back
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* PROFILE PICTURE */}
            <div className="flex-shrink-0">
              <img
                src={mentor.profilePic || "https://via.placeholder.com/150"}
                alt={mentor.fullName}
                className="size-48 rounded-full object-cover border-4 border-primary shadow-lg"
              />
            </div>

            {/* MENTOR INFO */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {mentor.fullName}
              </h1>

              <div className="badge badge-primary mb-4">
                {mentor.role.charAt(0).toUpperCase() + mentor.role.slice(1)}
              </div>

              {/* LOCATION */}
              {mentor.location && (
                <div className="flex items-center gap-2 text-base-content/70 mb-4">
                  <MapPinIcon className="size-5" />
                  <span>{mentor.location}</span>
                </div>
              )}

              {/* LANGUAGES */}
              <div className="flex gap-4 mb-6">
                {mentor.nativeLanguage && (
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="size-5 text-primary" />
                    <span className="font-semibold">{mentor.nativeLanguage}</span>
                    <span className="text-xs opacity-60">(Native)</span>
                  </div>
                )}
                {mentor.learningLanguage && (
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="size-5 text-secondary" />
                    <span className="font-semibold">{mentor.learningLanguage}</span>
                    <span className="text-xs opacity-60">(Learning)</span>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              {!isOwnProfile && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="btn btn-primary gap-2"
                    onClick={() => navigate(`/chat/${mentor._id}`)}
                  >
                    <MessageCircleIcon className="size-5" />
                    Message
                  </button>

                  {areFriends ? (
                    <button className="btn btn-success gap-2" disabled>
                      <CheckCircleIcon className="size-5" />
                      Friends
                    </button>
                  ) : friendRequestSent ? (
                    <button className="btn gap-2" disabled>
                      <CheckCircleIcon className="size-5" />
                      Request Sent
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline gap-2"
                      onClick={handleSendFriendRequest}
                      disabled={isSendingRequest}
                    >
                      <UserPlusIcon className="size-5" />
                      {isSendingRequest ? "Sending..." : "Add Friend"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - BIO & DETAILS */}
          <div className="lg:col-span-2">
            {/* BIO */}
            {mentor.bio && (
              <div className="card bg-base-200 shadow-md mb-8">
                <div className="card-body">
                  <h2 className="card-title text-lg">About</h2>
                  <p className="text-base-content/80 leading-relaxed">
                    {mentor.bio}
                  </p>
                </div>
              </div>
            )}

            {/* RESUME SECTION - FOR MENTORS */}
            {mentor.role === "mentor" && (
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <FileTextIcon className="size-5" />
                    Resume/CV
                  </h2>

                  {mentor.resume ? (
                    <div className="mt-4">
                      <div className="p-4 bg-success/10 rounded-lg border border-success/30 mb-4 flex items-center gap-3">
                        <CheckCircleIcon className="size-5 text-success" />
                        <div>
                          <p className="font-semibold text-sm">Resume Available</p>
                          <p className="text-xs opacity-70">
                            {mentor.fullName} has shared their professional resume
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadResume}
                        className="btn btn-outline btn-primary gap-2 w-full"
                      >
                        <FileTextIcon className="size-5" />
                        Download Resume
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-warning/10 rounded-lg border border-warning/30 flex items-center gap-3">
                      <XCircleIcon className="size-5 text-warning" />
                      <p className="text-sm">Resume not yet uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - QUICK INFO */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-md sticky top-24">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">Quick Info</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs opacity-60 uppercase tracking-wider">Email</p>
                    <p className="font-semibold break-all text-sm">{mentor.email}</p>
                  </div>

                  {mentor.institution && (
                    <div>
                      <p className="text-xs opacity-60 uppercase tracking-wider">
                        Institution
                      </p>
                      <p className="font-semibold text-sm">{mentor.institution}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs opacity-60 uppercase tracking-wider">
                      Member Since
                    </p>
                    <p className="font-semibold text-sm">
                      {new Date(mentor.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>

                  {mentor.isKYCverified && (
                    <div className="badge badge-success gap-2 w-full justify-start">
                      <CheckCircleIcon className="size-4" />
                      KYC Verified
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDetailPage;
