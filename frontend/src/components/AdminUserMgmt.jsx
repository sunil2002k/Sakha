import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const RoleBadge = ({ role }) => {
  const map = {
    admin: "badge-primary",
    mentor: "badge-secondary",
    student: "badge-ghost",
  };
  return (
    <span className={`badge badge-sm font-mono uppercase tracking-tighter ${map[role] || "badge-ghost"}`}>
      {role}
    </span>
  );
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // UPDATED: Handles upgrading/downgrading between Student, Mentor, and Admin
  const handleRoleChange = async (user, newRole) => {
    if (user.role === newRole) return;

    // Safety Prompt if changing TO or FROM Admin
    if (user.role === "admin" || newRole === "admin") {
      const isUpgrade = newRole === "admin";
      const message = isUpgrade 
        ? `Grant Admin privileges to ${user.fullName}?` 
        : `Remove Admin privileges from ${user.fullName}?`;
      
      if (!window.confirm(message)) return;
    }

    setActionLoadingId(user._id);
    try {
      await axiosInstance.put(`/admin/users/${user._id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, role: newRole } : u)
      );
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
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
      list = list.filter(u => 
        u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") list = list.filter(u => u.role === roleFilter);
    if (kycFilter !== "all") list = list.filter(u => u.kycStatus === kycFilter);
    
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

  return (
    <div className="min-h-screen bg-base-100 pt-20 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">System Control</p>
            <h1 className="text-4xl font-black tracking-tighter uppercase">User Directory</h1>
          </div>
          <button onClick={() => navigate("/admin/dashboard")} className="btn btn-ghost btn-sm">Dashboard</button>
        </div>

        <div className="card bg-base-200 border border-base-300 shadow-xl overflow-hidden">
          {/* Filters */}
          <div className="p-4 bg-base-300/30 flex flex-wrap gap-3 border-b border-base-300">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="input input-sm input-bordered flex-1 min-w-[200px]" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select select-sm select-bordered" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><span className="loading loading-spinner loading-lg" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="text-xs uppercase opacity-50 font-mono bg-base-300/50">
                    <th>#</th>
                    <th className="cursor-pointer" onClick={() => toggleSort("fullName")}>User <SortIcon field="fullName" /></th>
                    <th>Current Role</th>
                    <th>KYC</th>
                    <th>Status</th>
                    <th>Manage Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u._id} className={`hover:bg-base-300/20 ${u.isBanned ? "opacity-60" : ""}`}>
                      <td className="text-xs font-mono">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder ring-1 ring-base-300 rounded-full">
                            <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
                              <span className="text-xs font-bold">{u.fullName?.charAt(0)}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold leading-none">{u.fullName}</div>
                            <div className="text-[10px] opacity-50 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><RoleBadge role={u.role} /></td>
                      <td><KycBadge status={u.kycStatus} /></td>
                      <td>
                        {u.isBanned ? <span className="badge badge-error badge-xs">Banned</span> : <span className="badge badge-success badge-xs">Active</span>}
                      </td>
                      <td>
                        <select
                          className="select select-xs select-bordered font-mono h-8"
                          value={u.role}
                          disabled={actionLoadingId === u._id}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="flex gap-2">
                        <button
                          className={`btn btn-xs ${u.isBanned ? "btn-success" : "btn-error btn-outline"}`}
                          onClick={() => handleToggleBan(u)}
                          disabled={actionLoadingId === u._id}
                        >
                          {u.isBanned ? "Unban" : "Ban"}
                        </button>
                        <button className="btn btn-xs btn-ghost" onClick={() => setSelectedUser(u)}>Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Profile Detail Modal remains the same but with updated role badge logic */}
      {selectedUser && (
        <dialog className="modal modal-open">
          <div className="modal-box">
             <h3 className="font-bold text-lg mb-4">User Details</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="avatar placeholder"><div className="bg-neutral w-12 h-12 rounded-full"><span className="text-xl">{selectedUser.fullName[0]}</span></div></div>
                   <div>
                      <p className="font-bold">{selectedUser.fullName}</p>
                      <p className="text-sm opacity-60">{selectedUser.email}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div className="p-2 bg-base-200 rounded">
                      <p className="text-[10px] uppercase opacity-50 font-bold">Role</p>
                      <RoleBadge role={selectedUser.role} />
                   </div>
                   <div className="p-2 bg-base-200 rounded">
                      <p className="text-[10px] uppercase opacity-50 font-bold">KYC Status</p>
                      <KycBadge status={selectedUser.kycStatus} />
                   </div>
                </div>
             </div>
             <div className="modal-action">
                <button className="btn btn-sm" onClick={() => setSelectedUser(null)}>Close</button>
             </div>
          </div>
          <div className="modal-backdrop bg-black/40" onClick={() => setSelectedUser(null)}></div>
        </dialog>
      )}
    </div>
  );
};

export default AdminUserMgmt;