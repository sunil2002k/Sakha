import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// ─── Mini bar chart (CSS only) ───────────────────────────────────────────────
const BarChart = ({ data, color = "bg-primary" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-24 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex items-end justify-center" style={{ height: "72px" }}>
            <div
              className={`w-full rounded-t-sm ${color} opacity-80 group-hover:opacity-100 transition-all duration-300`}
              style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-base-content text-base-100 text-xs rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-10">
              {d.value}
            </div>
          </div>
          <span className="text-[10px] font-mono text-base-content/30 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Donut chart (CSS only via conic-gradient) ───────────────────────────────
const DonutChart = ({ segments }) => {
  let cumulative = 0;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const gradient = segments
    .map((seg) => {
      const start = (cumulative / total) * 360;
      cumulative += seg.value;
      const end = (cumulative / total) * 360;
      return `${seg.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <div
          className="w-full h-full rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-base-200 flex flex-col items-center justify-center">
            <span className="text-xs font-bold font-mono">{total}</span>
            <span className="text-[9px] text-base-content/40 font-mono">total</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: s.color }} />
            <span className="text-xs text-base-content/60 font-mono">{s.label} ({s.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Progress stat ────────────────────────────────────────────────────────────
const ProgressStat = ({ label, value, max, colorClass }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-base-content/60">{label}</span>
        <span className="text-xs font-mono font-bold">{value} <span className="text-base-content/30">/ {max}</span></span>
      </div>
      <progress className={`progress ${colorClass} w-full h-2`} value={pct} max={100} />
    </div>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, delta, loading }) => (
  <div className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
    <div className="card-body p-5">
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {delta !== undefined && (
          <span className={`badge badge-xs font-mono ${delta >= 0 ? "badge-success" : "badge-error"}`}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs uppercase tracking-widest font-mono text-base-content/40">{label}</p>
        <p className="text-3xl font-extrabold mt-1">
          {loading ? <span className="loading loading-dots loading-sm" /> : value}
        </p>
        {sub && <p className="text-xs text-base-content/40 mt-0.5 font-mono">{sub}</p>}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, kycRes, usersRes, projectsRes] = await Promise.all([
          axiosInstance.get("/admin/stats"),
          axiosInstance.get("/kyc/all"),
          axiosInstance.get("/admin/users"),
          axiosInstance.get("/admin/projects"),
        ]);

        const kyc = kycRes.data || [];
        const users = usersRes.data || [];
        const projects = projectsRes.data || [];

        // Monthly signups (last 6 months)
        const now = new Date();
        const monthlySignups = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const label = d.toLocaleString("default", { month: "short" });
          const value = users.filter((u) => {
            const c = new Date(u.createdAt);
            return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
          }).length;
          return { label, value };
        });

        // Monthly projects submitted (last 6 months)
        const monthlyProjects = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const label = d.toLocaleString("default", { month: "short" });
          const value = projects.filter((p) => {
            const c = new Date(p.createdAt);
            return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
          }).length;
          return { label, value };
        });

        setStats({
          userCount: statsRes.data?.userCount || users.length,
          projectCount: statsRes.data?.projectCount || projects.length,
          kycPending: kyc.filter((k) => k.status === "pending").length,
          kycVerified: kyc.filter((k) => k.status === "verified").length,
          kycRejected: kyc.filter((k) => k.status === "rejected").length,
          projectApproved: projects.filter((p) => p.status === "approved").length,
          projectPending: projects.filter((p) => p.status === "pending").length,
          projectRejected: projects.filter((p) => p.status === "rejected").length,
          monthlySignups,
          monthlyProjects,
          totalKyc: kyc.length,
          totalProjects: projects.length,
        });
      } catch {
        toast.error("Failed to load analytics");
        // fallback mock so UI still renders
        setStats({
          userCount: 0, projectCount: 0,
          kycPending: 0, kycVerified: 0, kycRejected: 0,
          projectApproved: 0, projectPending: 0, projectRejected: 0,
          monthlySignups: ["Jan","Feb","Mar","Apr","May","Jun"].map((l) => ({ label: l, value: 0 })),
          monthlyProjects: ["Jan","Feb","Mar","Apr","May","Jun"].map((l) => ({ label: l, value: 0 })),
          totalKyc: 0, totalProjects: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-base-100 pt-20 px-4 pb-16">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1 font-mono">Admin</p>
            <h1 className="text-4xl font-extrabold tracking-tight">Analytics</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/admin/dashboard")} className="btn btn-ghost btn-sm gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="👥" label="Total Users" value={stats?.userCount ?? "—"} sub="registered accounts" loading={loading} delta={12} />
          <StatCard icon="🗂️" label="Total Projects" value={stats?.projectCount ?? "—"} sub="submitted ideas" loading={loading} delta={8} />
          <StatCard icon="🪪" label="KYC Verified" value={stats?.kycVerified ?? "—"} sub="identity confirmed" loading={loading} />
          <StatCard icon="⏳" label="KYC Pending" value={stats?.kycPending ?? "—"} sub="awaiting review" loading={loading} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* User signups bar chart */}
          <div className="card bg-base-200 border border-base-300 shadow-sm lg:col-span-2">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-bold text-sm">User Signups</p>
                  <p className="text-xs font-mono text-base-content/40">Last 6 months</p>
                </div>
                <span className="badge badge-primary badge-outline badge-sm font-mono">Monthly</span>
              </div>
              {loading
                ? <div className="h-24 flex items-center justify-center"><span className="loading loading-spinner text-primary" /></div>
                : <BarChart data={stats?.monthlySignups || []} color="bg-primary" />
              }
            </div>
          </div>

          {/* KYC donut */}
          <div className="card bg-base-200 border border-base-300 shadow-sm">
            <div className="card-body p-5 items-center">
              <div className="w-full mb-4">
                <p className="font-bold text-sm">KYC Breakdown</p>
                <p className="text-xs font-mono text-base-content/40">All submissions</p>
              </div>
              {loading
                ? <div className="h-24 flex items-center justify-center"><span className="loading loading-spinner text-primary" /></div>
                : <DonutChart segments={[
                    { label: "Verified", value: stats?.kycVerified || 0, color: "oklch(var(--su))" },
                    { label: "Pending", value: stats?.kycPending || 0, color: "oklch(var(--wa))" },
                    { label: "Rejected", value: stats?.kycRejected || 0, color: "oklch(var(--er))" },
                  ]} />
              }
            </div>
          </div>
        </div>

        {/* Second charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Projects bar chart */}
          <div className="card bg-base-200 border border-base-300 shadow-sm lg:col-span-2">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-bold text-sm">Project Submissions</p>
                  <p className="text-xs font-mono text-base-content/40">Last 6 months</p>
                </div>
                <span className="badge badge-secondary badge-outline badge-sm font-mono">Monthly</span>
              </div>
              {loading
                ? <div className="h-24 flex items-center justify-center"><span className="loading loading-spinner text-secondary" /></div>
                : <BarChart data={stats?.monthlyProjects || []} color="bg-secondary" />
              }
            </div>
          </div>

          {/* Project donut */}
          <div className="card bg-base-200 border border-base-300 shadow-sm">
            <div className="card-body p-5 items-center">
              <div className="w-full mb-4">
                <p className="font-bold text-sm">Project Breakdown</p>
                <p className="text-xs font-mono text-base-content/40">All submissions</p>
              </div>
              {loading
                ? <div className="h-24 flex items-center justify-center"><span className="loading loading-spinner text-secondary" /></div>
                : <DonutChart segments={[
                    { label: "Approved", value: stats?.projectApproved || 0, color: "oklch(var(--su))" },
                    { label: "Pending", value: stats?.projectPending || 0, color: "oklch(var(--wa))" },
                    { label: "Rejected", value: stats?.projectRejected || 0, color: "oklch(var(--er))" },
                  ]} />
              }
            </div>
          </div>
        </div>

        {/* Progress overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-200 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <p className="font-bold text-sm mb-1">KYC Completion Rate</p>
              <p className="text-xs font-mono text-base-content/40 mb-5">How many users have completed identity verification</p>
              <div className="flex flex-col gap-4">
                <ProgressStat label="Verified" value={stats?.kycVerified || 0} max={stats?.totalKyc || 1} colorClass="progress-success" />
                <ProgressStat label="Pending" value={stats?.kycPending || 0} max={stats?.totalKyc || 1} colorClass="progress-warning" />
                <ProgressStat label="Rejected" value={stats?.kycRejected || 0} max={stats?.totalKyc || 1} colorClass="progress-error" />
              </div>
            </div>
          </div>

          <div className="card bg-base-200 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <p className="font-bold text-sm mb-1">Project Approval Rate</p>
              <p className="text-xs font-mono text-base-content/40 mb-5">Breakdown of project review decisions</p>
              <div className="flex flex-col gap-4">
                <ProgressStat label="Approved" value={stats?.projectApproved || 0} max={stats?.totalProjects || 1} colorClass="progress-success" />
                <ProgressStat label="Pending" value={stats?.projectPending || 0} max={stats?.totalProjects || 1} colorClass="progress-warning" />
                <ProgressStat label="Rejected" value={stats?.projectRejected || 0} max={stats?.totalProjects || 1} colorClass="progress-error" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;