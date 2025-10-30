import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [serverData, setServerData] = useState(null); // response from backend (preferred)
  const [decodedPayload, setDecodedPayload] = useState(null); // decoded "data" query param
  const [error, setError] = useState(null);
  const APIURL = import.meta.env.VITE_APP_URL;

  const dataParam = searchParams.get("data");

  // safe base64 -> unicode decode
  const b64DecodeUnicode = (str) => {
    try {
      // decode base64 to raw bytes then percent-encode to handle UTF-8
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(str), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } catch {
      try {
        return atob(str);
      } catch {
        return null;
      }
    }
  };

  useEffect(() => {
    const fetchServer = async () => {
      setLoading(true);
      setError(null);

      // If there is a data param, attempt to decode it locally for immediate display
      if (dataParam) {
        const decoded = b64DecodeUnicode(dataParam);
        if (decoded) {
          try {
            const parsed = JSON.parse(decoded);
            setDecodedPayload(parsed);
          } catch {
            setDecodedPayload({ raw: decoded });
          }
        }
      }

      // Try to verify/get the stored payment result from backend (preferred)
      try {
        // call backend endpoint that handles/returns final payment record
        const res = await axios.get(
          `${APIURL}/api/v1/payments/complete-payment?data=${encodeURIComponent(
            dataParam || ""
          )}`
        );
        setServerData(res.data);
      } catch (err) {
        // backend call failed — show decoded payload if present
        setError(err.response?.data?.message || err.message || "Could not fetch server result");
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataParam]);

  const payment = serverData?.paymentData || decodedPayload || null;
  const success = serverData?.success ?? (decodedPayload ? decodedPayload.status === "COMPLETE" : null);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900 text-white">
      <div className="w-full max-w-3xl bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4 text-purple-300">Payment Result</h1>

        {loading ? (
          <div className="py-8 text-center text-gray-300">Loading result...</div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-800/30 border border-red-700 text-red-200 rounded">
                Error: {error}
              </div>
            )}

            <div className={`mb-4 p-4 rounded ${success ? "bg-green-800/30 border-green-600" : "bg-yellow-800/20 border-yellow-600"} border`}>
              <p className="font-medium">
                Status:{" "}
                <span className={success ? "text-green-300" : "text-yellow-300"}>
                  {serverData?.success ? "Success" : decodedPayload?.status || "Unknown"}
                </span>
              </p>
              <p className="text-sm text-gray-300 mt-2">
                Message: {serverData?.message ?? "No message from server"}
              </p>
            </div>

            {payment ? (
              <div className="mb-4 grid grid-cols-1 gap-3">
                <div className="text-sm text-gray-300">
                  <strong>Transaction ID:</strong> {payment.transactionId ?? payment.response?.ref_id ?? payment.transaction_code ?? "—"}
                </div>
                <div className="text-sm text-gray-300">
                  <strong>Project ID:</strong> {payment.projectId ?? payment.product_code ?? "—"}
                </div>
                <div className="text-sm text-gray-300">
                  <strong>Amount:</strong> {payment.amount ?? payment.total_amount ?? payment.total_amount?.toString() ?? "—"}
                </div>
                <div className="text-sm text-gray-300">
                  <strong>Gateway:</strong> {payment.paymentGateway ?? "esewa"}
                </div>

                <div className="mt-3 bg-white/5 p-3 rounded border border-white/10">
                  <h3 className="text-sm font-medium text-gray-100 mb-2">Verification Response (decoded)</h3>
                  <pre className="text-xs text-gray-200 max-h-48 overflow-auto">
                    {JSON.stringify(serverData ?? decodedPayload ?? payment, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mb-4 text-gray-300">No payment details available.</div>
            )}

            <div className="flex gap-3 mt-4">
              {payment?.projectId && (
                <button
                  onClick={() => navigate(`/project/${payment.projectId}`)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
                >
                  View Project
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
              >
                Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;   