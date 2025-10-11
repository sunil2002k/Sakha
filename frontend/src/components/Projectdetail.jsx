import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Projectdetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch project details
  const fetchProjectDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:5500/api/v1/projects/${id}`);
      setProject(res.data.project);
    } catch (err) {
      console.error("Error fetching project details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  // 🟩 eSewa payment handler
  const handlePayNow = async () => {
    try {
      const amount = project.targetAmount || 500; // default 500 if undefined
      const projectId  = project._id; // unique ID for transaction

      // 1️⃣ Request signature from backend
      const { data } = await axios.post("http://localhost:5500/api/v1/payments/initiate-payment", {
  amount,
  projectId,
});

      // 2️⃣ Create and submit eSewa payment form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      form.target = "_blank";

      const formData = {
        amount,
        tax_amount: 0,
        total_amount: amount,
        transaction_uuid: data.transaction_uuid,
        product_code: "EPAYTEST", // test product code
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: "http://localhost:5500/api/v1/payments/complete-payment",
        failure_url: "https://developer.esewa.com.np/failure",
        signed_field_names: data.signed_field_names,
        signature: data.signature,
      };

      for (let key in formData) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      form.remove();
    } catch (error) {
      console.error("Error initiating eSewa payment:", error);
      alert("Failed to start payment. Please try again.");
    }
  };

  // 🕓 Loading state
  if (loading) {
    return <p className="text-gray-300 text-center mt-10">Loading project details...</p>;
  }

  // ❌ Not found
  if (!project) {
    return <p className="text-gray-400 text-center mt-10">Project not found.</p>;
  }

  return (
    <div className="flex flex-col items-center min-h-[80vh] text-white px-6">
      <div className="max-w-3xl w-full bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg mt-12">
        <h1 className="text-4xl font-bold text-purple-400 mb-4">{project.title}</h1>
        <p className="text-gray-300 mb-2"><span className="font-semibold">Category:</span> {project.category}</p>
        <p className="text-gray-200 mb-4">{project.description}</p>
        <p className="text-gray-200 mb-4">{project.expected_outcomes}</p>
        <p className="text-gray-200 mb-4">Target Amount: Rs. {project.targetAmount}</p>
        <p className="text-gray-200 mb-4">{project.tech_stack}</p>
        <p className="text-gray-200 mb-4">{project.type}</p>
        <p className="text-gray-200 mb-4">Created by: {project.addedBy}</p>

        {project.createdAt && (
          <p className="text-sm text-gray-400">
            Posted on: {new Date(project.createdAt).toLocaleDateString()}
          </p>
        )}

        {/* 🟩 Pay Now Button */}
        <button
          onClick={handlePayNow}
          className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded-lg mt-6"
        >
          Pay with eSewa
        </button>

        <Link
          to="/"
          className="inline-block mt-6 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition ml-4"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Projectdetail;
