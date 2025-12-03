import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Accepts projectId, targetAmount, and APIURL as props
const PaymentProgress = ({ projectId, targetAmount, APIURL }) => {
    // State is initialized here
    const [fundingStatus, setFundingStatus] = useState({
        totalFunded: 0,
        targetAmount: targetAmount,
        progress: 0,
    });
    const [loading, setLoading] = useState(true);

    // Effect to fetch funding status when the component mounts or props change
    useEffect(() => {
        // Only fetch if we have the necessary data
        if (!projectId || !APIURL) return;

        const fetchStatus = async () => {
            setLoading(true);
            try {
                // ⚠️ Ensure this path matches your actual project routes in Express
                const statusRes = await axios.get(
                    `${APIURL}/api/v1/payments/${projectId}/funding-status`
                );
                
                const fetchedData = statusRes.data.data;
                setFundingStatus({
                    totalFunded: fetchedData.totalFunded,
                    targetAmount: fetchedData.targetAmount,
                    progress: fetchedData.progress,
                });
            } catch (sErr) {
                console.error("Failed to fetch funding status:", sErr);
                // Fallback to the target amount passed via props
                setFundingStatus(prev => ({ ...prev, targetAmount: targetAmount }));
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [projectId, APIURL, targetAmount]);
    
    // Do not render if the project is not a funding type or has no target
    if (targetAmount <= 0) return null;
    
    // Ensure progress is capped at 100%
    const progressPercent = Math.min(fundingStatus.progress, 100);

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
                Fundraising Progress
            </h3>
            
            {loading ? (
                 <p className="text-gray-400">Loading progress...</p>
            ) : (
                <>
                    {/* Goal Display */}
                    <p className="text-gray-400 text-sm mb-1">Funding Goal</p>
                    <p className="text-2xl font-bold text-green-400 mb-4">
                        NPR {parseInt(targetAmount).toLocaleString()}
                    </p>

                    {/* Progress Bar and Statistics */}
                    <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">
                            Raised: 
                            <span className="text-green-300 font-semibold ml-1">
                                NPR {fundingStatus.totalFunded.toLocaleString()}
                            </span>
                        </p>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                                className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                                // Accessibility attributes
                                aria-valuenow={fundingStatus.totalFunded}
                                aria-valuemin="0"
                                aria-valuemax={fundingStatus.targetAmount}
                                role="progressbar"
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {progressPercent.toFixed(1)}% Complete
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

export default PaymentProgress;