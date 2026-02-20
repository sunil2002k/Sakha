import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import { MessageSquare, WifiOff } from "lucide-react";

// Stream base styles — layout + theme overrides are in index.css
import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError(true);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent!");
    }
  };

  if (loading || (!chatClient && !error)) return <ChatLoader />;

  if (error || !chatClient || !channel) {
    return (
      <div className="h-[93vh] flex items-center justify-center bg-base-100 px-4">
        <div className="card bg-base-200 border border-base-300 w-full max-w-sm">
          <div className="card-body p-8 text-center gap-5">
            <div className="p-4 rounded-2xl bg-error/10 w-fit mx-auto">
              <WifiOff className="w-8 h-8 text-error" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg">Connection Failed</h3>
              <p className="text-base-content/55 text-sm">
                Could not connect to chat. Check your connection and try again.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary rounded-xl"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

return (
  <div className="h-[93vh] flex flex-col overflow-hidden bg-base-100">

    <div className="flex-1 min-h-0 overflow-hidden">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="flex h-full w-full overflow-hidden">
            
            <Window>
              
              {/* Custom Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-base-300 bg-base-100">
                
                {/* Channel Name */}
                <ChannelHeader />

                {/* Video Call Icon - Right Most */}
                <CallButton handleVideoCall={handleVideoCall} />
                
              </div>

              <MessageList />
              <MessageInput focus />
            </Window>

            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>

  </div>
);
};

export default ChatPage;