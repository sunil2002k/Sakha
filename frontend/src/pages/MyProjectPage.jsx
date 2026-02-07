import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { FaPlus, FaRocket, FaEdit, FaEye, FaBullhorn } from "react-icons/fa";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const MyProjectPage = () => {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the Update Modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch projects belonging to the current user
  const fetchMyProjects = async () => {
    try {
      const res = await axiosInstance.get("/projects/my-projects");
      setMyProjects(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching my projects:", err);
      toast.error("Failed to load your projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleOpenUpdateModal = (project) => {
    setSelectedProject(project);
    setUpdateMessage("");
    document.getElementById("update_modal").showModal();
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!updateMessage.trim()) return toast.error("Update content cannot be empty");

    setIsSubmitting(true);
    try {
      // Endpoint to post an update to a specific project
      await axiosInstance.post(`/projects/${selectedProject._id}/updates`, {
        content: updateMessage,
        title: "Project Update", // You can add a title field if needed
      });
      
      toast.success("Update posted successfully!");
      document.getElementById("update_modal").close();
      setUpdateMessage("");
    } catch (error) {
      console.error("Error posting update:", error);
      toast.error(error.response?.data?.message || "Failed to post update");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <PageLoader/>
  );

  return (
    <div className="bg-base-100 min-h-screen pt-24 pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">My Projects</h1>
            <p className="opacity-60 font-medium text-lg">Manage your innovations and keep your backers informed.</p>
          </div>
          <Link to="/create-project" className="btn btn-primary rounded-2xl px-8 shadow-lg h-12 font-bold">
            <FaPlus className="mr-2" /> Create New
          </Link>
        </div>

        {/* Content Section */}
        {myProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-base-200/50 rounded-[3rem] border-2 border-dashed border-base-300">
            <div className="bg-base-200 p-6 rounded-full mb-4">
              <FaRocket className="text-4xl opacity-20" />
            </div>
            <h3 className="text-xl font-bold mb-1">No projects yet</h3>
            <p className="opacity-50 mb-6">Start your journey by launching your first idea.</p>
            <Link to="/create-project" className="btn btn-outline rounded-xl btn-sm font-black">
              Launch Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {myProjects.map((project) => (
              <div 
                key={project._id} 
                className="card lg:card-side bg-base-200 shadow-xl border border-base-300 overflow-hidden rounded-[2.5rem] transition-all hover:shadow-2xl"
              >
                <figure className="lg:w-1/3 relative group h-64 lg:h-auto">
                  <img 
                    src={project.images?.[0] || "https://via.placeholder.com/400"} 
                    alt={project.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                </figure>
                
                <div className="card-body lg:w-2/3 p-8 lg:p-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="badge badge-primary badge-outline font-black uppercase tracking-widest text-[10px] mb-2">
                        {project.category || "Technology"}
                      </div>
                      <h2 className="text-3xl font-black leading-tight mb-2">{project.title}</h2>
                    </div>
                    <div className="badge badge-lg bg-base-100 border-base-300 font-bold p-4">
                      {project.status || "Active"}
                    </div>
                  </div>

                  <p className="opacity-70 font-medium line-clamp-2 mb-6">
                    {project.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-base-100 rounded-2xl border border-base-300 mb-6">
                    <div>
                      <div className="text-[10px] opacity-50 font-black uppercase tracking-widest">Raised</div>
                      <div className="font-black text-lg">NPR {project.currentAmount || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] opacity-50 font-black uppercase tracking-widest">Target</div>
                      <div className="font-black text-lg">NPR {project.targetAmount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] opacity-50 font-black uppercase tracking-widest">Backers</div>
                      <div className="font-black text-lg">{project.backers?.length || 0}</div>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-auto gap-3">
                    <Link 
                      to={`/project/${project._id}`} 
                      className="btn btn-ghost rounded-xl font-bold border border-base-300 hover:border-base-content/20"
                    >
                      <FaEye className="mr-1" /> View Public
                    </Link>
                    <Link 
                      to={`/edit-project/${project._id}`} 
                      className="btn btn-ghost rounded-xl font-bold border border-base-300 hover:border-base-content/20"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </Link>
                    <button 
                      onClick={() => handleOpenUpdateModal(project)}
                      className="btn btn-primary rounded-xl font-black shadow-lg"
                    >
                      <FaBullhorn className="mr-1" /> Post Update
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      <dialog id="update_modal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
        <div className="modal-box bg-base-200 rounded-[2rem] border border-base-300 p-8">
          <h3 className="font-black text-2xl mb-2">Post an Update</h3>
          <p className="opacity-60 text-sm mb-6">
            Share progress with the backers of <span className="text-primary">{selectedProject?.title}</span>.
          </p>
          
          <form onSubmit={handlePostUpdate}>
            <textarea
              className="textarea textarea-bordered w-full h-40 rounded-2xl text-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary bg-base-100"
              placeholder="What's the latest news? (e.g., 'We just finalized the prototype!')"
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
            ></textarea>
            
            <div className="modal-action mt-6 flex gap-3">
              <button 
                type="button" 
                className="btn btn-ghost rounded-xl flex-1 font-bold"
                onClick={() => document.getElementById("update_modal").close()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary rounded-xl flex-1 font-black shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Publish Update"}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

export default MyProjectPage;