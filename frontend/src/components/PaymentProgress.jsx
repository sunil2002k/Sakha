import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentProgress = ({ projectId, targetAmount, APIURL }) => {
    const [fundingStatus, setFundingStatus] = useState({
        totalFunded: 0,
        targetAmount: targetAmount,
        progress: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId || !APIURL) return;

        const fetchStatus = async () => {
            setLoading(true);
            try {
                const statusRes = await axios.get(
                    `${APIURL}/api/v1/payments/${projectId}/funding-status`
                );
                const fetchedData = statusRes.data.data || {};
                setFundingStatus({
                    totalFunded: fetchedData.totalFunded || 0,
                    targetAmount: fetchedData.targetAmount || targetAmount,
                    progress: typeof fetchedData.progress === 'number' ? fetchedData.progress : 0,
                });
            } catch (sErr) {
                console.error('Failed to fetch funding status:', sErr);
                setFundingStatus((prev) => ({ ...prev, targetAmount: targetAmount }));
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [projectId, APIURL, targetAmount]);

    if (!targetAmount || targetAmount <= 0) return null;

    // FIX: Decouple the display value from the CSS width
    const displayProgress = fundingStatus.progress || 0;
    const barWidth = Math.min(displayProgress, 100);

    return (
        <div className="bg-gradient-to-b from-white/5 to-white/2 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">Fundraising Progress</h3>
                {displayProgress > 100 && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/30">
                        Overfunded
                    </span>
                )}
            </div>

            {loading ? (
                <p className="text-sm text-gray-300">Loading progress...</p>
            ) : (
                <>
                    <p className="text-sm text-gray-300 mb-1">Funding Goal</p>
                    <p className="text-2xl font-extrabold text-white mb-4">
                        NPR {parseInt(targetAmount).toLocaleString()}
                    </p>

                    <div className="relative">
                        <div
                            className="w-full h-5 bg-white/6 rounded-full overflow-hidden shadow-inner relative"
                            role="progressbar"
                            aria-label={`Funding progress ${displayProgress.toFixed(1)} percent`}
                            aria-valuenow={fundingStatus.totalFunded}
                            aria-valuemin="0"
                            aria-valuemax={fundingStatus.targetAmount}
                        >
                            <div
                                className={`h-full rounded-full bg-gradient-to-r transition-all duration-800 ease-out ${
                                    displayProgress > 100 
                                    ? 'from-emerald-400 to-emerald-600' 
                                    : 'from-emerald-500 to-cyan-400'
                                }`}
                                style={{ width: `${barWidth}%` }}
                            />

                            {/* Show actual percentage inside bar if there is space */}
                            {displayProgress >= 15 && (
                                <span className="absolute left-3 top-0 h-full flex items-center text-sm font-semibold text-white">
                                    {displayProgress.toFixed(1)}%
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-3">
                            <div className="text-sm text-gray-300">
                                <span className="font-medium">Raised</span>
                                <span className="ml-1 font-semibold text-white">
                                    NPR {fundingStatus.totalFunded.toLocaleString()}
                                </span>
                            </div>
                            
                            {/* Show percentage outside if it's too small to fit inside the bar */}
                            {displayProgress < 15 && (
                                <div className="text-sm text-gray-300 font-bold">
                                    {displayProgress.toFixed(1)}%
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentProgress;