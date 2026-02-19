import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { formatNPR } from "../constants";
// ─── Helpers ──────────────────────────────────────────────────────────────────


const formatNPRDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const StatusBadge = ({ status }) => {
  const map = {
    completed: "badge-success",
    pending: "badge-warning",
    failed: "badge-error",
    refunded: "badge-info",
  };
  return (
    <span className={`badge badge-sm gap-1 ${map[status] || "badge-ghost"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 inline-block" />
      {status}
    </span>
  );
};

// Mini horizontal bar for funding progress
const FundingBar = ({ raised, goal }) => {
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs font-mono text-base-content/40">
        <span>{formatNPR(raised)}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="w-full bg-base-300 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${pct >= 100 ? "bg-success" : pct >= 50 ? "bg-primary" : "bg-warning"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] font-mono text-base-content/30">Goal: {formatNPR(goal)}</p>
    </div>
  );
};


const AdminTrxn = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("transactions");
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, projRes] = await Promise.all([
          axiosInstance.get("/admin/transactions"),
          axiosInstance.get("/admin/projects"),
        ]);
        setTransactions(txRes.data || []);
        setProjects(projRes.data || []);
      } catch {
        toast.error("Failed to load transaction data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRaised = transactions.filter((t) => t.status === "completed").reduce((s, t) => s + (t.amount || 0), 0);
  const totalPending = transactions.filter((t) => t.status === "pending").reduce((s, t) => s + (t.amount || 0), 0);
  const totalRefunded = transactions.filter((t) => t.status === "refunded").reduce((s, t) => s + (t.amount || 0), 0);
  const avgTx = transactions.length > 0 ? totalRaised / transactions.filter((t) => t.status === "completed").length : 0;

  const filteredTx = useMemo(() => {
    let list = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.projectTitle?.toLowerCase().includes(q) ||
          t.userEmail?.toLowerCase().includes(q) ||
          t._id?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [transactions, search, statusFilter]);

  const filteredProjects = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) => p.title?.toLowerCase().includes(q) || p.ownerEmail?.toLowerCase().includes(q)
    );
  }, [projects, search]);

  return (
    <div className="min-h-screen bg-base-100 pt-20 px-4 pb-16">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1 font-mono">Admin</p>
            <h1 className="text-4xl font-extrabold tracking-tight">Transactions & Funding</h1>
          </div>
          <button onClick={() => navigate("/admin/dashboard")} className="btn btn-ghost btn-sm gap-1 self-start sm:self-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Raised", value: formatNPR(totalRaised), icon: "💰", color: "text-success" },
            { label: "Pending Funds", value: formatNPR(totalPending), icon: "⏳", color: "text-warning" },
            { label: "Total Refunded", value: formatNPR(totalRefunded), icon: "↩️", color: "text-info" },
            { label: "Avg. Contribution", value: formatNPR(avgTx), icon: "📊", color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body p-5">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-widest font-mono text-base-content/40">{s.label}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${s.color}`}>
                    {loading ? <span className="loading loading-dots loading-sm" /> : s.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 border border-base-300 p-1 mb-6 w-fit">
          {[
            { key: "transactions", label: "Transactions", count: transactions.length },
            { key: "funding", label: "Project Funding", count: projects.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`tab gap-2 font-semibold text-sm transition-all ${activeTab === key ? "tab-active" : "text-base-content/50"}`}
            >
              {label}
              <span className={`badge badge-xs font-mono ${activeTab === key ? "badge-primary" : "badge-ghost"}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Main card */}
        <div className="card bg-base-200 border border-base-300 shadow-md">
          <div className="card-body p-0">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 px-6 pt-6 pb-4 border-b border-base-300">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={activeTab === "transactions" ? "Search by project, email, or ID…" : "Search by project or owner…"}
                  className="input input-bordered input-sm w-full pl-9 font-mono text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {activeTab === "transactions" && (
                <select
                  className="select select-bordered select-sm font-mono text-xs w-full sm:w-40"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              )}
            </div>

            {/* Transactions Table */}
            {activeTab === "transactions" && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <span className="loading loading-spinner loading-lg text-primary" />
                  </div>
                ) : filteredTx.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/30">
                    <span className="text-5xl">💳</span>
                    <p className="font-mono text-sm">No transactions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr className="bg-base-300 text-base-content/50 text-xs uppercase tracking-widest font-mono">
                          <th className="font-medium">Tx ID</th>
                          <th className="font-medium">Backer</th>
                          <th className="font-medium">Project</th>
                          <th className="font-medium">Amount</th>
                          <th className="font-medium">Date</th>
                          <th className="font-medium">Status</th>
                          <th className="font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTx.map((t) => (
                          <tr key={t._id} className="hover">
                            <td className="font-mono text-xs text-base-content/40">#{t._id?.slice(-8).toUpperCase()}</td>
                            <td>
                              <div>
                                <p className="font-semibold text-sm">{t.userName || "—"}</p>
                                <p className="text-xs font-mono text-base-content/40">{t.userEmail}</p>
                              </div>
                            </td>
                            <td>
                              <p className="text-sm font-medium max-w-[160px] truncate">{t.projectTitle || "—"}</p>
                            </td>
                            <td>
                              <span className="font-bold font-mono text-sm text-success">{formatNPR(t.amount)}</span>
                            </td>
                            <td className="font-mono text-xs text-base-content/50">{formatNPRDate(t.createdAt)}</td>
                            <td><StatusBadge status={t.status} /></td>
                            <td>
                              <button
                                className="btn btn-xs btn-ghost btn-square tooltip"
                                data-tip="View details"
                                onClick={() => setSelectedTx(t)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loading && filteredTx.length > 0 && (
                  <div className="px-6 py-4 border-t border-base-300 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-mono text-base-content/30">
                      Showing {filteredTx.length} of {transactions.length} transactions
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {["completed","pending","failed","refunded"].map((s) => (
                        <span key={s} className={`badge badge-xs font-mono badge-outline ${
                          s === "completed" ? "badge-success" :
                          s === "pending" ? "badge-warning" :
                          s === "failed" ? "badge-error" : "badge-info"
                        }`}>
                          {transactions.filter((t) => t.status === s).length} {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Project Funding Table */}
            {activeTab === "funding" && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <span className="loading loading-spinner loading-lg text-primary" />
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/30">
                    <span className="text-5xl">🗂️</span>
                    <p className="font-mono text-sm">No projects found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr className="bg-base-300 text-base-content/50 text-xs uppercase tracking-widest font-mono">
                          <th className="font-medium">#</th>
                          <th className="font-medium">Project</th>
                          <th className="font-medium">Owner</th>
                          <th className="font-medium">Backers</th>
                          <th className="font-medium">Funding Progress</th>
                          <th className="font-medium">Status</th>
                          <th className="font-medium">Deadline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((p, i) => (
                          <tr key={p._id} className="hover">
                            <td className="text-base-content/30 font-mono text-xs">{String(i + 1).padStart(2, "0")}</td>
                            <td>
                              <div>
                                <p className="font-semibold text-sm max-w-[180px] truncate">{p.title}</p>
                                <p className="text-xs font-mono text-base-content/30">#{p._id?.slice(-6).toUpperCase()}</p>
                              </div>
                            </td>
                            <td>
                              <div>
                                <p className="text-sm">{p.ownerName || "—"}</p>
                                <p className="text-xs font-mono text-base-content/40">{p.ownerEmail}</p>
                              </div>
                            </td>
                            <td>
                              <span className="font-bold font-mono text-sm">{p.backerCount || 0}</span>
                              <span className="text-xs text-base-content/30 font-mono"> backers</span>
                            </td>
                            <td className="min-w-[180px]">
                              <FundingBar raised={p.raised || 0} goal={p.goal || 0} />
                            </td>
                            <td>
                              <span className={`badge badge-sm ${
                                p.status === "approved" ? "badge-success" :
                                p.status === "pending" ? "badge-warning" :
                                p.status === "rejected" ? "badge-error" : "badge-ghost"
                              }`}>{p.status}</span>
                            </td>
                            <td className="font-mono text-xs text-base-content/50">
                              {p.deadline ? formatNPRDate(p.deadline) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loading && filteredProjects.length > 0 && (
                  <div className="px-6 py-4 border-t border-base-300">
                    <p className="text-xs font-mono text-base-content/30">
                      Showing {filteredProjects.length} of {projects.length} projects
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* Transaction detail modal */}
      {selectedTx && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Transaction Details</h3>
              <button className="btn btn-sm btn-ghost btn-circle" onClick={() => setSelectedTx(null)}>✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-base-300 rounded-xl">
                <span className="text-sm text-base-content/60">Amount</span>
                <span className="text-2xl font-extrabold text-success">{formatNPR(selectedTx.amount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Transaction ID", value: `#${selectedTx._id?.slice(-10).toUpperCase()}` },
                  { label: "Status", value: selectedTx.status },
                  { label: "Backer", value: selectedTx.userName || "—" },
                  { label: "Email", value: selectedTx.userEmail || "—" },
                  { label: "Project", value: selectedTx.projectTitle || "—" },
                  { label: "Date", value: formatNPRDate(selectedTx.createdAt) },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-xs font-mono uppercase tracking-widest text-base-content/40">{row.label}</p>
                    <p className="text-sm font-semibold mt-0.5 truncate">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-action mt-6">
              <button className="btn btn-sm btn-ghost" onClick={() => setSelectedTx(null)}>Close</button>
              {selectedTx.status === "completed" && (
                <button className="btn btn-sm btn-warning btn-outline">Issue Refund</button>
              )}
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setSelectedTx(null)} />
        </dialog>
      )}
    </div>
  );
};

export default AdminTrxn;