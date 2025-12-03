import React from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { LogOutIcon, PencilIcon, ShieldCheck } from "lucide-react";
import useLogout from "../hooks/useLogout";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const navigate = useNavigate();

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h2 className="text-lg font-semibold mb-3">You are not logged in</h2>
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 rounded-xl bg-purple-600 text-white shadow-lg hover:bg-purple-500"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-3xl bg-slate-950/70 border border-slate-800 p-8 shadow-[0_0_45px_rgba(0,0,0,0.7)] backdrop-blur-xl">

        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="h-24 w-24 rounded-full overflow-hidden ring-2 ring-purple-600 shadow-lg">
            {authUser.profilePic ? (
              <img src={authUser.profilePic} alt="User" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-4xl font-semibold">
                {authUser?.fullName?.[0] || "U"}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">{authUser.fullName}</h2>
            <p className="text-slate-400">{authUser.email}</p>
          </div>
        </div>

        {/* KYC Section */}
        <div className="rounded-2xl p-5 border border-purple-900/60 bg-purple-950/20 mb-10 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 font-semibold text-lg">KYC Verification</p>
              <p className="text-slate-400 text-sm">
                Secure your account with government ID verification.
              </p>
            </div>
            <button
              onClick={() => navigate("/kyc")}
              className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-full text-white font-semibold hover:bg-purple-500 transition-all"
            >
              <ShieldCheck className="h-5 w-5" />
              Verify Now
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-4">

          {[
            { label: "Full Name", value: authUser.fullName },
            { label: "Email", value: authUser.email },
            { label: "Bio", value: authUser.bio || "No bio added" },
            { label: "Location", value: authUser.location || "Not set" },
            { label: "Native Language", value: authUser.nativeLanguage },
            { label: "Learning Language", value: authUser.learningLanguage },
            { label: "Institution", value: authUser.institution || "Not provided" },
            { label: "Role", value: authUser.role },
            { label: "Friends", value: authUser.friends?.length || 0 },
            { label: "Account Created", value: new Date(authUser.createdAt).toLocaleDateString() },
            { label: "Last Updated", value: new Date(authUser.updatedAt).toLocaleDateString() },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-slate-800 p-4 bg-slate-900/40 hover:bg-slate-900/50 transition-all"
            >
              <div>
                <p className="text-slate-500 text-xs">{item.label}</p>
                <p className="text-slate-200 font-medium">{item.value}</p>
              </div>
              {item.label === "Full Name" && (
                <PencilIcon className="h-5 w-5 text-slate-400 cursor-pointer hover:text-purple-300" />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col gap-4">
          <button
            onClick={() => navigate("/settings")}
            className="w-full rounded-full bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all"
          >
            Edit Profile / Settings
          </button>

          <button
            onClick={() => logoutMutation()}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-all"
          >
            <LogOutIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
