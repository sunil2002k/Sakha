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
      { path: "project/:id", element: <Projectdetail /> },
      { path: "search", element: <Search /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
