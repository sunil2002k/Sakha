import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LayOut from "./components/LayOut.jsx";
import Home from "./components/Home.jsx";
import IdeaAnalyzer from "./components/IdeaAnalyzer.jsx";
import About from "./components/About.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Projectdetail from "./components/Projectdetail.jsx";
import Search from "./components/Search.jsx";
import Projects from "./components/Projects.jsx";
import VideoChat from "./components/VideoChat.jsx";
import PaymentResult from "./components/PaymentResult.jsx";

import { SocketProvider } from "./contexts/SocketProvider.jsx";
import GlobalNotification from "./components/GlobalNotification.jsx";
import Chatroom from "./components/Chatroom.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayOut />,
    children: [
      { path: "", element: <Home /> },
      { path: "submit", element: <IdeaAnalyzer /> },
      { path: "aboutus", element: <About /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "search", element: <Search /> },
      { path: "projects", element: <Projects /> },
      { path: "payment-result", element: <PaymentResult /> },
      { path: "project/:id", element: <Projectdetail /> },
      { path: "/video-chat/:projectId", element: <VideoChat /> },
      { path: "/chatroom/:projectId", element: <Chatroom /> },

    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
    <SocketProvider>
      <GlobalNotification />
      <RouterProvider router={router} />
    </SocketProvider>
    </AuthProvider>
  </StrictMode>
);