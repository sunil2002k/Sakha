import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const RoleBadge = ({ role }) => {
  const map = {
    admin: "badge-primary",
    user: "badge-ghost",
    moderator: "badge-secondary",
  };
  return <span className={`badge badge-sm ${map[role] || "badge-ghost"}`}>{role}</span>;
};

const KycBadge = ({ status }) => {
  if (!status) return <span className="badge badge-sm badge-ghost">none</span>;
  const map = {
    verified: "badge-success",
    pending: "badge-warning",
    rejected: "badge-error",
  };
  return (
    <span className={`badge badge-sm gap-1 ${map[status] || "badge-ghost"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 inline-block" />
      {status}
    </span>
  );
};

const AdminUserMgmt = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/admin/users");
        setUsers(res.data || []);
      } catch {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleBan = async (user) => {
    setActionLoadingId(user._id);
    try {
      await axiosInstance.put(`/admin/users/${user._id}/ban`, { banned: !user.isBanned });
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, isBanned: !u.isBanned } : u)
      );
      toast.success(`User ${user.isBanned ? "unbanned" : "banned"} successfully`);
    } catch {
      toast.error("Failed to update user");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    setActionLoadingId(user._id);
    try {
      await axiosInstance.put(`/admin/users/${user._id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, role: newRole } : u)
      );
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="opacity-20">↕</span>;
    return <span className="text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) => u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (kycFilter !== "all") list = list.filter((u) => u.kycStatus === kycFilter);
    list.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, search, roleFilter, kycFilter, sortBy, sortDir]);

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    user: users.filter((u) => u.role === "user").length,
    banned: users.filter((u) => u.isBanned).length,
  };

  return (
    <div className="min-h-screen bg-base-100 pt-20 px-4 pb-16">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1 font-mono">Admin</p>
            <h1 className="text-4xl font-extrabold tracking-tight">User Management</h1>
          </div>
          <button onClick={() => navigate("/admin/dashboard")} className="btn btn-ghost btn-sm gap-1 self-start sm:self-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* Summary badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: counts.all, color: "text-primary" },
            { label: "Admins", value: counts.admin, color: "text-secondary" },
            { label: "Regular Users", value: counts.user, color: "text-info" },
            { label: "Banned", value: counts.banned, color: "text-error" },
          ].map((s) => (
            <div key={s.label} className="card bg-base-200 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <p className="text-xs font-mono uppercase tracking-widest text-base-content/40">{s.label}</p>
                <p className={`text-3xl font-extrabold ${s.color}`}>
                  {loading ? <span className="loading loading-dots loading-sm" /> : s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
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
                  placeholder="Search by name or email…"
                  className="input input-bordered input-sm w-full pl-9 font-mono text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="select select-bordered select-sm font-mono text-xs w-full sm:w-36"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
              </select>
              <select
                className="select select-bordered select-sm font-mono text-xs w-full sm:w-36"
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
              >
                <option value="all">All KYC</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="">No KYC</option>
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/30">
                <span className="text-5xl">🔍</span>
                <p className="font-mono text-sm">No users match your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-300 text-base-content/50 text-xs uppercase tracking-widest font-mono">
                      <th className="font-medium">#</th>
                      <th className="font-medium cursor-pointer hover:text-base-content" onClick={() => toggleSort("fullName")}>
                        User <SortIcon field="fullName" />
                      </th>
                      <th className="font-medium">Role</th>
                      <th className="font-medium">KYC</th>
                      <th className="font-medium cursor-pointer hover:text-base-content" onClick={() => toggleSort("createdAt")}>
                        Joined <SortIcon field="createdAt" />
                      </th>
                      <th className="font-medium">Status</th>
                      <th className="font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, i) => (
                      <tr key={u._id} className={`hover ${u.isBanned ? "opacity-50" : ""}`}>
                        <td className="text-base-content/30 font-mono text-xs">{String(i + 1).padStart(2, "0")}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-9 h-9">
                                <span className="text-xs font-bold">{u.fullName?.charAt(0)?.toUpperCase() || "?"}</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm leading-tight">{u.fullName || "—"}</p>
                              <p className="text-base-content/40 text-xs font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><RoleBadge role={u.role} /></td>
                        <td><KycBadge status={u.kycStatus} /></td>
                        <td className="font-mono text-xs text-base-content/50">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                        <td>
                          {u.isBanned
                            ? <span className="badge badge-sm badge-error gap-1"><span className="w-1.5 h-1.5 rounded-full bg-current" />Banned</span>
                            : <span className="badge badge-sm badge-success gap-1"><span className="w-1.5 h-1.5 rounded-full bg-current" />Active</span>
                          }
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {/* Role dropdown */}
                            <select
                              className="select select-xs select-bordered font-mono"
                              value={u.role}
                              disabled={actionLoadingId === u._id}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                            >
                              <option value="user">User</option>
                              <option value="moderator">Mod</option>
                              <option value="admin">Admin</option>
                            </select>
                            {/* Ban toggle */}
                            <button
                              className={`btn btn-xs ${u.isBanned ? "btn-success btn-outline" : "btn-error btn-outline"}`}
                              disabled={actionLoadingId === u._id}
                              onClick={() => handleToggleBan(u)}
                            >
                              {actionLoadingId === u._id
                                ? <span className="loading loading-spinner loading-xs" />
                                : u.isBanned ? "Unban" : "Ban"
                              }
                            </button>
                            {/* View profile */}
                            <button
                              className="btn btn-xs btn-ghost btn-square tooltip"
                              data-tip="View profile"
                              onClick={() => setSelectedUser(u)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            {!loading && filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-base-300 flex items-center justify-between">
                <p className="text-xs font-mono text-base-content/30">
                  Showing {filtered.length} of {users.length} users
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">User Profile</h3>
              <button className="btn btn-sm btn-ghost btn-circle" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-20 h-20">
                  <span className="text-3xl font-bold">{selectedUser.fullName?.charAt(0)?.toUpperCase()}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{selectedUser.fullName}</p>
                <p className="text-xs font-mono text-base-content/40">{selectedUser.email}</p>
              </div>
              <div className="flex gap-2">
                <RoleBadge role={selectedUser.role} />
                <KycBadge status={selectedUser.kycStatus} />
                {selectedUser.isBanned && <span className="badge badge-sm badge-error">Banned</span>}
              </div>
            </div>
            <div className="divider my-2" />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "User ID", value: selectedUser._id?.slice(-10) },
                { label: "Joined", value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "—" },
                { label: "Role", value: selectedUser.role },
                { label: "KYC Status", value: selectedUser.kycStatus || "None" },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-xs font-mono uppercase tracking-widest text-base-content/40">{row.label}</p>
                  <p className="text-sm font-semibold mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="modal-action mt-6">
              <button className="btn btn-sm btn-ghost" onClick={() => setSelectedUser(null)}>Close</button>
              <button
                className={`btn btn-sm ${selectedUser.isBanned ? "btn-success" : "btn-error"}`}
                onClick={() => { handleToggleBan(selectedUser); setSelectedUser(null); }}
              >
                {selectedUser.isBanned ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setSelectedUser(null)} />
        </dialog>
      )}
    </div>
  );
};

export default AdminUserMgmt;