import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import LayOut from "./components/LayOut.jsx";
import Home from "./components/Home.jsx";
import IdeaAnalyzer from "./components/IdeaAnalyzer.jsx";
import About from "./components/About.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <LayOut />, // Layout now contains ScrollRestoration
    children: [
      { path: "", element: <Home /> },
      { path: "submit", element: <IdeaAnalyzer /> },
      { path: "aboutus", element: <About /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },

      
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);