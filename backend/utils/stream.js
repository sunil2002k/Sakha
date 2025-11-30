import { StreamChat } from "stream-chat";
import { STREAM_API_KEY, STREAM_SECRET_KEY} from "../config/env.js";


if (!STREAM_SECRET_KEY || !STREAM_API_KEY) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_SECRET_KEY);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};