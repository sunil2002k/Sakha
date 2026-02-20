import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircleIcon, UserPlusIcon, CheckCircleIcon, XCircleIcon, FileTextIcon, MapPinIcon, BookOpenIcon } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { getOutgoingFriendReqs } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import PageLoader from "../components/PageLoader";

const MentorDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authUser } = useAuthUser();

    // Hooks must be stable and in the same order
    const [previewLoading, setPreviewLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    // Fetch mentor details
    const { data: mentor, isLoading: isMentorLoading, error: mentorError } = useQuery({
        queryKey: ["mentor", id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/users/${id}`);
            return response.data.data;
        },
        enabled: !!id,
    });

    // Fetch outgoing friend requests for the current user
    const { data: outgoingReqs } = useQuery({
        queryKey: ["outgoingFriendRequests"],
        queryFn: async () => {
            return await getOutgoingFriendReqs();
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
            toast.error(error?.response?.data?.message || "Failed to send friend request");
        },
    });

    if (isMentorLoading) return <PageLoader />;

    if (mentorError || !mentor) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl font-semibold mb-4">Mentor not found</p>
                    <button onClick={() => navigate(-1)} className="btn btn-primary">Go Back</button>
                </div>
            </div>
        );
    }

    const areFriends = authUser?.friends?.includes(mentor._id);
    const friendRequestSent = outgoingReqs?.some((req) => req.recipient?._id === mentor._id);
    const isOwnProfile = authUser?._id === mentor._id;

    const getSignedDownloadUrl = async (originalUrl, isDownload = false) => {
        try {
            if (!originalUrl) throw new Error("URL is required");

            // Non-Cloudinary URLs: return as-is with a fallback filename
            if (!originalUrl.includes("cloudinary.com")) {
                return { url: originalUrl, filename: `${mentor.fullName}_Resume.pdf` };
            }

            const res = await axiosInstance.get(`/cloudinary/download`, {
                params: { url: originalUrl, download: isDownload },
            });

            if (!res.data?.url) throw new Error("Failed to get signed URL");

            return {
                url: res.data.url,
                filename: res.data.filename || `${mentor.fullName}_Resume`,
            };
        } catch (err) {
            console.error("Error getting signed URL:", err);
            throw err;
        }
    };

    // Preview Resume - Opens in new tab
    const handlePreviewResume = async () => {
        if (!mentor.resume) {
            toast.error("Resume not available");
            return;
        }

        setPreviewLoading(true);
        try {
            const { url: signedUrl } = await getSignedDownloadUrl(mentor.resume, false);
            window.open(signedUrl, "_blank", "noopener,noreferrer");
            toast.success("Opening resume preview...");
        } catch (error) {
            console.error("Preview error:", error);
            toast.error("Failed to open preview");
        } finally {
            setPreviewLoading(false);
        }
    };

    // Download Resume - Fetches blob and triggers browser save dialog
    const handleDownloadResume = async () => {
        if (!mentor.resume) {
            toast.error("Resume not available");
            return;
        }

        setDownloadLoading(true);
        try {
            // Get a clean signed URL (no fl_attachment — not supported for raw/docs)
            const { url: signedUrl, filename } = await getSignedDownloadUrl(mentor.resume, true);

            // Fetch as blob so the browser shows a Save dialog instead of navigating
            const response = await fetch(signedUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename; // filename comes from backend, not URL parsing
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            toast.success("Resume downloaded successfully!");
        } catch (error) {
            console.error("Download error:", error);
            toast.error(error.message || "Failed to download resume");
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleSendFriendRequest = () => {
        if (!authUser) {
            toast.error("Please login first");
            navigate("/login");
            return;
        }
        sendFriendRequest();
    };

    return (
        <div className="min-h-screen bg-base-100">
            {/* HERO SECTION */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 md:p-12">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-6">← Back</button>

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
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{mentor.fullName}</h1>

                            <div className="badge badge-primary mb-4">
                                {mentor.role.charAt(0).toUpperCase() + mentor.role.slice(1)}
                            </div>

                            {mentor.location && (
                                <div className="flex items-center gap-2 text-base-content/70 mb-4">
                                    <MapPinIcon className="size-5" />
                                    <span>{mentor.location}</span>
                                </div>
                            )}

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

                            {!isOwnProfile && (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {areFriends ? (
                                        <button 
                                            className="btn btn-primary gap-2" 
                                            onClick={() => navigate(`/chat/${mentor._id}`)}
                                        >
                                            <MessageCircleIcon className="size-5" /> Message
                                        </button>
                                    ) : friendRequestSent ? (
                                        <button className="btn gap-2" disabled>
                                            <CheckCircleIcon className="size-5" /> Request Sent
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn btn-primary gap-2" 
                                            onClick={handleSendFriendRequest} 
                                            disabled={isSendingRequest}
                                        >
                                            <UserPlusIcon className="size-5" /> 
                                            {isSendingRequest ? "Sending..." : "Send Request"}
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
                    <div className="lg:col-span-2">
                        {mentor.bio && (
                            <div className="card bg-base-200 shadow-md mb-8">
                                <div className="card-body">
                                    <h2 className="card-title text-lg">About</h2>
                                    <p className="text-base-content/80 leading-relaxed">{mentor.bio}</p>
                                </div>
                            </div>
                        )}

                        {mentor.role === "mentor" && (
                            <div className="card bg-base-200 shadow-md">
                                <div className="card-body">
                                    <h2 className="card-title text-lg flex items-center gap-2">
                                        <FileTextIcon className="size-5" /> Resume/CV
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
                                            <div className="flex gap-2 mt-4">
                                                <button 
                                                    onClick={handlePreviewResume} 
                                                    className="btn btn-outline btn-secondary gap-2 flex-1" 
                                                    disabled={previewLoading || downloadLoading}
                                                >
                                                    {previewLoading ? "Loading..." : "Preview"}
                                                </button>
                                                <button 
                                                    onClick={handleDownloadResume} 
                                                    className="btn btn-outline btn-primary gap-2 flex-1" 
                                                    disabled={previewLoading || downloadLoading}
                                                >
                                                    <FileTextIcon className="size-5" />
                                                    {downloadLoading ? "Processing..." : "Download"}
                                                </button>
                                            </div>
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
                                            <p className="text-xs opacity-60 uppercase tracking-wider">Institution</p>
                                            <p className="font-semibold text-sm">{mentor.institution}</p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs opacity-60 uppercase tracking-wider">Member Since</p>
                                        <p className="font-semibold text-sm">
                                            {new Date(mentor.createdAt).toLocaleDateString("en-US", { 
                                                year: "numeric", 
                                                month: "short" 
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