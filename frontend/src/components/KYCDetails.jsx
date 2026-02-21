import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-mono uppercase tracking-widest text-base-content/40">{label}</span>
    <span className="text-sm font-semibold text-base-content">{value || "—"}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: "badge-warning",
    verified: "badge-success",
    rejected: "badge-error",
  };
  return (
    <span className={`badge gap-1.5 ${map[status] || "badge-ghost"}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};

const ImageViewer = ({ src, label, tag }) => {
  const [zoomed, setZoomed] = useState(false);
  return (
    <>
      <div className="card bg-base-300 border border-base-300 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/10">
          <span className="text-base-content/40 text-xs font-mono uppercase tracking-widest">{tag}</span>
          <button
            onClick={() => setZoomed(true)}
            className="btn btn-xs btn-ghost gap-1 text-base-content/50 hover:text-base-content"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Expand
          </button>
        </div>
        <figure className="bg-base-200 cursor-zoom-in" onClick={() => setZoomed(true)}>
          <img src={src} alt={label} className="w-full object-cover max-h-52 hover:scale-105 transition-transform duration-300" />
        </figure>
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-base-content/60">{label}</p>
        </div>
      </div>

      {zoomed && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl p-2 bg-base-300">
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <p className="text-sm font-semibold">{label}</p>
              <button onClick={() => setZoomed(false)} className="btn btn-sm btn-ghost btn-circle">✕</button>
            </div>
            <img src={src} alt={label} className="w-full rounded-lg object-contain max-h-[70vh]" />
          </div>
          <div className="modal-backdrop bg-black/60" onClick={() => setZoomed(false)} />
        </dialog>
      )}
    </>
  );
};

const KYCDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchKycDetails = async () => {
      try {
        const res = await axiosInstance.get("/kyc/all");
        const found = res.data.find((item) => item._id === id);
        setKyc(found);
      } catch {
        toast.error("Error fetching details");
      } finally {
        setLoading(false);
      }
    };
    fetchKycDetails();
  }, [id]);

  const handleStatusUpdate = async (type) => {
    setActionLoading(type);
    try {
      const endpoint = type === "verify" ? `/kyc/${id}/verify` : `/kyc/${id}/reject`;
      await axiosInstance.put(endpoint, { reason: reason || "" });
      toast.success("User notified successfully");
      navigate("/admin/dashboard");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-sm font-mono text-base-content/40 uppercase tracking-widest">Loading record…</p>
        </div>
      </div>
    );
  }

  if (!kyc) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-bold text-xl mb-2">Record not found</p>
          <p className="text-base-content/40 text-sm mb-6">This KYC submission may have been removed.</p>
          <button onClick={() => navigate("/admin/dashboard")} className="btn btn-primary btn-sm">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPending = kyc.status === "pending";

  // ── submittedBy is now a populated object ──
  const submitter = kyc.submittedBy;
  const submitterName = submitter?.fullName || "—";
  const submitterEmail = submitter?.email || "—";
  const submitterId = submitter?._id || "—";
  const submitterPic = submitter?.profilePic || null;

  return (
    <div className="min-h-screen bg-base-100 pt-20 px-4 pb-16">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs font-mono text-base-content/40">
          <button onClick={() => navigate("/admin/dashboard")} className="hover:text-primary transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span>/</span>
          <span className="text-base-content/60">KYC Review</span>
          <span>/</span>
          <span className="text-base-content">{kyc.fullName}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1 font-mono">
              Identity Verification
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">{kyc.fullName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={kyc.status} />
            <span className="text-xs font-mono text-base-content/30">#{id.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Applicant Info */}
            <div className="card bg-base-200 border border-base-300 shadow-sm">
              <div className="card-body p-0">
                <div className="px-5 pt-5 pb-3 border-b border-base-300">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                    Applicant Details
                  </h3>
                </div>
                <div className="px-5 py-4 flex flex-col gap-5">

                  {/* Submitter profile row */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-base-300/50 border border-base-300">
                    <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-base-300 shrink-0">
                      {submitterPic ? (
                        <img src={submitterPic} alt={submitterName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{submitterName.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{submitterName}</p>
                      <p className="text-xs text-base-content/45 font-mono truncate">{submitterEmail}</p>
                    </div>
                  </div>

                  <InfoRow label="Full Name (on ID)" value={kyc.fullName} />
                  <InfoRow
                    label="Date of Birth"
                    value={new Date(kyc.dob).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  />
                  <InfoRow label="Address" value={kyc.address} />
                  <InfoRow label="User ID" value={submitterId} />
                  <InfoRow
                    label="Submitted"
                    value={new Date(kyc.submittedAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Already reviewed banner */}
            {!isPending && (
              <div className={`alert ${kyc.status === "verified" ? "alert-success" : "alert-error"} shadow`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {kyc.status === "verified"
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  }
                </svg>
                <div>
                  <p className="font-bold text-sm capitalize">Application {kyc.status}</p>
                  <p className="text-xs opacity-80">This submission has already been reviewed.</p>
                </div>
              </div>
            )}

            {/* Review Actions */}
            {isPending && (
              <div className="card bg-base-200 border border-base-300 shadow-sm">
                <div className="card-body p-0">
                  <div className="px-5 pt-5 pb-3 border-b border-base-300">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <span className="w-1 h-4 bg-warning rounded-full inline-block" />
                      Review Decision
                    </h3>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-4">
                    <div className="form-control gap-1.5">
                      <label className="text-xs font-mono uppercase tracking-widest text-base-content/40">
                        Note for applicant <span className="text-base-content/25">(optional)</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered w-full text-sm resize-none h-24 focus:textarea-primary"
                        placeholder="e.g. Please re-upload a clearer photo of your ID."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleStatusUpdate("verify")}
                        disabled={!!actionLoading}
                        className="btn btn-success gap-2"
                      >
                        {actionLoading === "verify"
                          ? <span className="loading loading-spinner loading-xs" />
                          : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        }
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate("reject")}
                        disabled={!!actionLoading}
                        className="btn btn-error gap-2"
                      >
                        {actionLoading === "reject"
                          ? <span className="loading loading-spinner loading-xs" />
                          : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        }
                        Reject
                      </button>
                    </div>
                    <p className="text-xs text-base-content/30 font-mono text-center">
                      The applicant will be notified via email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate("/admin/dashboard")}
              className="btn btn-ghost btn-sm gap-2 self-start text-base-content/40 hover:text-base-content"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* RIGHT: Documents */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="card bg-base-200 border border-base-300 shadow-sm">
              <div className="card-body p-0">
                <div className="px-5 pt-5 pb-3 border-b border-base-300">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <span className="w-1 h-4 bg-secondary rounded-full inline-block" />
                    Submitted Documents
                  </h3>
                  <p className="text-xs text-base-content/40 font-mono mt-1">Click any image to expand</p>
                </div>
                <div className="p-5 flex flex-col gap-5">
                  <ImageViewer src={kyc.idCardUrl} label="Government-Issued ID Card" tag="Document 01" />
                  <ImageViewer src={kyc.selfieUrl} label="Selfie Verification Photo" tag="Document 02" />
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="card bg-base-200 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-info rounded-full inline-block" />
                  Verification Checklist
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    "Full name matches ID document",
                    "ID document is valid and not expired",
                    "Face in selfie matches ID photo",
                    "Document is clearly legible",
                    "Address is complete and accurate",
                  ].map((item, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                      <span className="text-sm text-base-content/70 group-hover:text-base-content transition-colors">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCDetails;