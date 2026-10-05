import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callError, setCallError] = useState("");

  const { authUser, isLoading: authLoading } = useAuthUser();

  const {
    data: tokenData,
    isLoading: tokenLoading,
    error: tokenError,
  } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let isActive = true;
    let videoClient;
    let callInstance;
    setClient(null);
    setCall(null);

    if (authLoading || tokenLoading) {
      return () => {
        isActive = false;
      };
    }

    if (tokenError || !tokenData?.token || !authUser || !callId || !STREAM_API_KEY) {
      setCallError("Could not initialize the video call. Please sign in and try again.");
      setIsConnecting(false);
      return () => {
        isActive = false;
      };
    }

    setIsConnecting(true);
    setCallError("");

    const initCall = async () => {
      try {
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        if (!isActive) return;
        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        if (callInstance) {
          try {
            await callInstance.leave();
          } catch (leaveError) {
            console.warn("Could not leave failed video call:", leaveError);
          }
        }
        if (videoClient) {
          try {
            await videoClient.disconnectUser();
          } catch (disconnectError) {
            console.warn("Could not disconnect failed video client:", disconnectError);
          }
        }
        callInstance = null;
        videoClient = null;
        if (isActive) {
          setCallError("Could not join the call. Please try again.");
          toast.error("Could not join the call. Please try again.");
        }
      } finally {
        if (isActive) setIsConnecting(false);
      }
    };

    void initCall();

    return () => {
      isActive = false;
      void (async () => {
        if (callInstance) {
          try {
            await callInstance.leave();
          } catch (error) {
            console.warn("Could not leave video call cleanly:", error);
          }
        }
        if (videoClient) {
          try {
            await videoClient.disconnectUser();
          } catch (error) {
            console.warn("Could not disconnect video client cleanly:", error);
          }
        }
      })();
    };
  }, [
    authLoading,
    authUser,
    callId,
    tokenData?.token,
    tokenError,
    tokenLoading,
  ]);

  if (authLoading || tokenLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>{callError || "Could not initialize call. Please refresh or try again later."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) navigate("/");
  }, [callingState, navigate]);

  if (callingState === CallingState.LEFT) return null;

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;