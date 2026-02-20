import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios"; 
import { CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // NEW: State to track which project is currently being viewed in the modal
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects for admin:", err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const handleApprove = async (projectId) => {
    try {
      const res = await axiosInstance.put(`/admin/projects/${projectId}/approve`, {
        note: "Approved by Admin"
      });
      if (res.data.success) {
        toast.success("Project approved and owner notified!");
        fetchAllProjects();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve project");
    }
  };

  const handleReject = async (projectId) => {
    const note = prompt("Please provide a reason for rejection:");
    if (note === null) return; 

    try {
      const res = await axiosInstance.put(`/admin/projects/${projectId}/reject`, { note });
      if (res.data.success) {
        toast.success("Project rejected and owner notified.");
        fetchAllProjects();
      }
    } catch (err) {
      toast.error("Failed to reject project");
    }
  };

  return (
    <div className="p-6 bg-base-100 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-tighter">Project Approval Queue</h2>
        <button onClick={fetchAllProjects} className="btn btn-ghost btn-sm">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="overflow-x-auto border border-base-300 rounded-xl">
        <table className="table w-full bg-base-200">
          <thead>
            <tr className="bg-base-300">
              <th>Project Title</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-10">Loading projects...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10">No projects found.</td></tr>
            ) : (
              projects.map((proj) => (
                <tr key={proj._id} className="hover:bg-base-300/50">
                  <td>
                    <div className="font-bold">{proj.title}</div>
                    <div className="text-xs opacity-50">{proj.category}</div>
                  </td>
                  <td>
                    <div className="text-sm font-medium">{proj.ownerName}</div>
                    <div className="text-xs opacity-50">{proj.ownerEmail}</div>
                  </td>
                  <td>
                    <span className={`badge badge-sm font-mono uppercase ${
                      proj.status === 'approved' ? 'badge-success' : 
                      proj.status === 'rejected' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="flex gap-2">
                    {proj.status === "pending" && (
                      <>
                        <button 
                          onClick={() => handleApprove(proj._id)}
                          className="btn btn-success btn-xs"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(proj._id)}
                          className="btn btn-error btn-xs btn-outline"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                    {/* NEW: On click, set the selected project to open the modal */}
                    <button 
                      onClick={() => setSelectedProject(proj)} 
                      className="btn btn-ghost btn-xs"
                    >
                      <ExternalLink size={14} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* NEW: DaisyUI Modal for viewing project details */}
      {selectedProject && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl bg-base-100">
            <h3 className="font-bold text-2xl mb-2">{selectedProject.title}</h3>
            <div className="flex gap-2 mb-6">
              <span className="badge badge-primary badge-outline">{selectedProject.category}</span>
              <span className="badge badge-secondary badge-outline">{selectedProject.type}</span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-bold text-base-content/60 uppercase tracking-wider text-xs mb-1">Description</h4>
                <p className="p-3 bg-base-200 rounded-lg">{selectedProject.description || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-base-content/60 uppercase tracking-wider text-xs mb-1">Owner</h4>
                  <p className="font-medium">{selectedProject.ownerName}</p>
                  <p className="text-xs opacity-70">{selectedProject.ownerEmail}</p>
                </div>
                <div>
                  <h4 className="font-bold text-base-content/60 uppercase tracking-wider text-xs mb-1">Submission Date</h4>
                  <p>{new Date(selectedProject.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedProject.targetAmount > 0 && (
                <div>
                  <h4 className="font-bold text-base-content/60 uppercase tracking-wider text-xs mb-1">Target Funding</h4>
                  <p className="font-mono text-lg font-bold">NPR {selectedProject.targetAmount.toLocaleString()}</p>
                </div>
              )}

              {selectedProject.tech_stack && (
                <div>
                  <h4 className="font-bold text-base-content/60 uppercase tracking-wider text-xs mb-1">Tech Stack</h4>
                  <p className="font-mono bg-base-200 p-2 rounded-lg">{selectedProject.tech_stack}</p>
                </div>
              )}
            </div>

            <div className="modal-action mt-8">
              {selectedProject.status === "pending" && (
                <>
                  <button onClick={() => { handleApprove(selectedProject._id); setSelectedProject(null); }} className="btn btn-success">Approve</button>
                  <button onClick={() => { handleReject(selectedProject._id); setSelectedProject(null); }} className="btn btn-error btn-outline">Reject</button>
                </>
              )}
              {/* Close button clears the state, closing the modal */}
              <button onClick={() => setSelectedProject(null)} className="btn">Close</button>
            </div>
          </div>
          {/* Clicking the backdrop also closes the modal */}
          <div className="modal-backdrop bg-black/50" onClick={() => setSelectedProject(null)}></div>
        </dialog>
      )}
    </div>
  );
};

export default ProjectManager;