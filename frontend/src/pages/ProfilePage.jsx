import React from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { LogOutIcon, PencilIcon, ShieldCheck, User } from "lucide-react";
import useLogout from "../hooks/useLogout";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const navigate = useNavigate();
  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content">
        <h2 className="text-xl font-bold mb-4">You are not logged in</h2>
        <button onClick={() => navigate("/login")} className="btn btn-primary">Login Now</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content px-4 py-24 transition-colors">
      <div className="max-w-3xl mx-auto rounded-3xl bg-base-200 border border-base-300 p-8 shadow-2xl">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-28 ring ring-primary ring-offset-base-100 ring-offset-2">
              <span className="text-4xl font-bold">{authUser.fullName?.charAt(0) || <User size={40}/>}</span>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black mb-1">{authUser.fullName}</h1>
            <p className="text-base-content/60 text-lg mb-3">{authUser.email}</p>
            {authUser.isKycVerified ? (
              <div className="badge badge-success gap-2 py-3 px-4">
                <ShieldCheck size={16} /> Verified Investor/Creator
              </div>
            ) : (
              <button 
                onClick={() => navigate("/kyc")} 
                className="btn btn-warning btn-sm btn-outline gap-2"
              >
                Verify Identity
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid gap-4">
          {[
            { label: "Account Status", value: authUser.isKycVerified ? "Verified" : "Pending" },
            { label: "Member Since", value: new Date(authUser.createdAt).toLocaleDateString() },
            { label: "Role", value: authUser.role  },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-xl border border-base-300 p-5 bg-base-100 shadow-sm">
              <div>
                <p className="text-xs opacity-50 uppercase font-black tracking-widest mb-1">{item.label}</p>
                <p className="font-bold text-lg">{item.value}</p>
              </div>
              <div className="p-2 rounded-lg bg-base-300/30">
                 <PencilIcon size={16} className="opacity-30" />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button className="btn btn-outline border-base-300 flex-1">Settings & Security</button>
          <button 
            onClick={() => logoutMutation()} 
            className="btn btn-error btn-outline flex-1 gap-2"
          >
            <LogOutIcon size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;