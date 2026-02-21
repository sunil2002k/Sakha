import React from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import {
  LogOut, ShieldCheck, ShieldAlert, User, MapPin,
  Calendar, Crown, Building, Users, Settings, ArrowUpRight, BookOpen,
} from "lucide-react";
import useLogout from "../hooks/useLogout";
import { LANGUAGE_TO_FLAG } from "../constants";
import { capitialize } from "../lib/utils";

// Helper — lives here so constants.jsx stays untouched
const LangIcon = ({ language, size = 16 }) => {
  if (!language) return null;
  const entry = LANGUAGE_TO_FLAG[language.toLowerCase()];
  if (!entry) return null;
  const Icon = entry.icon;
  return <Icon size={size} color={entry.color} style={{ display: "inline-block", flexShrink: 0 }} />;
};

const getLangColor = (language) => {
  if (!language) return null;
  return LANGUAGE_TO_FLAG[language.toLowerCase()]?.color ?? null;
};

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const navigate = useNavigate();

  if (!authUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
        <div className="card bg-base-200 border border-base-300 w-full max-w-sm">
          <div className="card-body p-8 text-center gap-5">
            <div className="p-4 rounded-2xl bg-base-300 w-fit mx-auto">
              <User className="w-8 h-8 text-base-content/30" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg">Not logged in</h3>
              <p className="text-base-content/55 text-sm">Sign in to view your profile.</p>
            </div>
            <button onClick={() => navigate("/login")} className="btn btn-primary rounded-xl">
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const joinDate = new Date(authUser.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const nativeColor = getLangColor(authUser.nativeLanguage);
  const learningColor = getLangColor(authUser.learningLanguage);
  const roleColor = authUser.role === "admin" ? "badge-error" : "badge-secondary";

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-5">

        {/* ── Hero card ── */}
        <div className="card bg-base-200 border border-base-300 overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          <div className="card-body p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-base-300">
                  {authUser.profilePic ? (
                    <img src={authUser.profilePic} alt={authUser.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">{authUser.fullName?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-base-200" />
              </div>

              {/* Name + meta */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{authUser.fullName}</h1>
                  <span className={`badge ${roleColor} badge-sm font-bold uppercase tracking-wider px-3`}>
                    <Crown className="w-3 h-3 mr-1" />{authUser.role || "Member"}
                  </span>
                </div>
                <p className="text-base-content/50 text-sm">{authUser.email}</p>
                {authUser.bio && (
                  <p className="text-base-content/70 text-sm leading-relaxed max-w-md">{authUser.bio}</p>
                )}
                <div className="pt-1">
                  {authUser.isKYCverified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/25 text-success text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Developer
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate("/kyc")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/25 text-warning text-xs font-bold hover:bg-warning/20 transition-colors duration-200"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Verify Identity
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Language cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Knows */}
          <div className="card bg-base-200 border border-base-300 hover:border-base-content/20 transition-colors duration-200">
            <div className="card-body p-6 gap-3">
              <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Knows</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: nativeColor ? `${nativeColor}1a` : "oklch(var(--b3))" }}
                >
                  <LangIcon language={authUser.nativeLanguage} size={28} />
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight" style={{ color: nativeColor ?? undefined }}>
                    {capitialize(authUser.nativeLanguage) || "—"}
                  </p>
                  <p className="text-xs text-base-content/45">Primary language</p>
                </div>
              </div>
            </div>
          </div>

          {/* Learning */}
          <div className="card bg-base-200 border border-base-300 hover:border-base-content/20 transition-colors duration-200">
            <div className="card-body p-6 gap-3">
              <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Learning</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: learningColor ? `${learningColor}1a` : "oklch(var(--b3))" }}
                >
                  <LangIcon language={authUser.learningLanguage} size={28} />
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight" style={{ color: learningColor ?? undefined }}>
                    {capitialize(authUser.learningLanguage) || "—"}
                  </p>
                  <p className="text-xs text-base-content/45">Currently studying</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Profile details ── */}
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-7 gap-0">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <User className="w-4 h-4 text-primary" />
              </div>
              <p className="font-bold text-sm">Profile Details</p>
            </div>
            <div className="divide-y divide-base-300">
              {[
                authUser.institution && { icon: Building, label: "Institution", value: authUser.institution },
                authUser.location && { icon: MapPin, label: "Location", value: authUser.location },
                { icon: Users, label: "Connections", value: `${authUser.friends?.length || 0} friends` },
                { icon: Calendar, label: "Member Since", value: joinDate },
              ].filter(Boolean).map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="flex items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3 text-base-content/50">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-right capitalize truncate max-w-[55%]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Resume ── */}
        {authUser.resume && (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body p-6 flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">Resume</p>
                  <p className="text-xs text-base-content/50">View your uploaded resume</p>
                </div>
              </div>
              <a href={authUser.resume} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary btn-sm rounded-xl gap-1.5 hover:scale-[1.02] transition-all duration-200">
                View <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/settings")}
            className="btn btn-outline rounded-xl flex-1 gap-2 hover:border-primary/40 hover:scale-[1.01] transition-all duration-200"
          >
            <Settings className="w-4 h-4" /> Settings & Security
          </button>
          <button
            onClick={() => logoutMutation()}
            className="btn btn-error btn-outline rounded-xl flex-1 gap-2 hover:scale-[1.01] transition-all duration-200"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;