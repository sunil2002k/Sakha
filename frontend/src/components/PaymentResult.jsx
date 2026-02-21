import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Home,
  Receipt,
  Loader2,
  AlertCircle,
  Hash,
  Layers,
  CreditCard,
  Wallet,
} from "lucide-react";

const APIURL = import.meta.env.VITE_APP_URL;

const b64DecodeUnicode = (str) => {
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    try { return atob(str); } catch { return null; }
  }
};

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [serverData, setServerData] = useState(null);
  const [decodedPayload, setDecodedPayload] = useState(null);
  const [error, setError] = useState(null);

  const dataParam = searchParams.get("data");

  useEffect(() => {
    const fetchServer = async () => {
      setLoading(true);
      setError(null);

      if (dataParam) {
        const decoded = b64DecodeUnicode(dataParam);
        if (decoded) {
          try {
            setDecodedPayload(JSON.parse(decoded));
          } catch {
            setDecodedPayload({ raw: decoded });
          }
        }
      }

      try {
        const res = await axios.get(
          `${APIURL}/api/v1/payments/complete-payment?data=${encodeURIComponent(dataParam || "")}`
        );
        setServerData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Could not fetch payment result");
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [dataParam]);

  const payment = serverData?.paymentData || decodedPayload || null;
  const success = serverData?.success ?? (decodedPayload ? decodedPayload.status === "COMPLETE" : null);

  const txId = payment?.transactionId ?? payment?.response?.ref_id ?? payment?.transaction_code ?? null;
  const projectId = payment?.projectId ?? payment?.product_code ?? null;
  const amount = payment?.amount ?? payment?.total_amount ?? null;
  const gateway = payment?.paymentGateway ?? "eSewa";

  const detailRows = [
    { icon: Hash, label: "Transaction ID", value: txId },
    { icon: Layers, label: "Project ID", value: projectId },
    { icon: CreditCard, label: "Amount", value: amount ? `NPR ${amount}` : null },
    { icon: Wallet, label: "Payment Gateway", value: gateway },
  ].filter((r) => r.value);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-9 h-9 text-primary animate-spin" />
            </div>
            <span className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-lg">Verifying your payment…</p>
            <p className="text-base-content/50 text-sm">Please wait, this only takes a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-5">

        {/* ── Status card ── */}
        <div className={`card border ${
          success
            ? "bg-success/5 border-success/20"
            : success === false
            ? "bg-error/5 border-error/20"
            : "bg-warning/5 border-warning/20"
        }`}>
          <div className="card-body p-8 items-center text-center gap-4">
            {/* Icon */}
            <div className={`p-4 rounded-2xl ${
              success ? "bg-success/15" : success === false ? "bg-error/15" : "bg-warning/15"
            }`}>
              {success ? (
                <CheckCircle className="w-10 h-10 text-success" />
              ) : success === false ? (
                <XCircle className="w-10 h-10 text-error" />
              ) : (
                <AlertCircle className="w-10 h-10 text-warning" />
              )}
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight">
                {success ? "Payment Successful!" : success === false ? "Payment Failed" : "Payment Status Unknown"}
              </h1>
              <p className="text-base-content/55 text-sm">
                {serverData?.message
                  ?? (success
                    ? "Your transaction was completed successfully."
                    : success === false
                    ? "Something went wrong with your payment."
                    : "We couldn't confirm your payment status.")}
              </p>
            </div>

            {/* Status badge */}
            <span className={`badge badge-lg font-semibold px-4 ${
              success ? "badge-success" : success === false ? "badge-error" : "badge-warning"
            }`}>
              {serverData?.success ? "COMPLETE" : decodedPayload?.status ?? "UNKNOWN"}
            </span>
          </div>
        </div>

        {/* ── Error notice ── */}
        {error && (
          <div className="card bg-error/5 border border-error/20">
            <div className="card-body p-4 flex-row items-start gap-3">
              <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <p className="text-sm text-base-content/70">
                <span className="font-semibold text-error">Note: </span>{error}
              </p>
            </div>
          </div>
        )}

        {/* ── Payment details ── */}
        {detailRows.length > 0 && (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body p-6 gap-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Receipt className="w-4 h-4 text-primary" />
                </div>
                <p className="font-bold text-sm">Payment Details</p>
              </div>

              <div className="divide-y divide-base-300">
                {detailRows.map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-2.5 text-base-content/55">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-right truncate max-w-[55%] font-mono">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {projectId && (
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="btn btn-primary flex-1 rounded-xl gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-200"
            >
              View Project
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className={`btn rounded-xl gap-2 hover:scale-[1.02] transition-all duration-200 ${
              projectId ? "btn-outline flex-1" : "btn-primary w-full"
            }`}
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentResult;