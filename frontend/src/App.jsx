import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ChatHomePage from "./pages/ChatHomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

import Home from "./components/Home.jsx";
import IdeaAnalyzer from "./components/IdeaAnalyzer.jsx";
import About from "./components/About.jsx";
import Projectdetail from "./components/Projectdetail.jsx";
import Search from "./components/Search.jsx";
import Projects from "./components/Projects.jsx";
import PaymentResult from "./components/PaymentResult.jsx";
import LayOut from "./components/LayOut.jsx";
import Format from "./components/Format.jsx";
import PageLoader from "./components/PageLoader.jsx";

import useAuthUser from "./hooks/useAuthUser.js";
import { useThemeStore } from "./store/useThemeStore.js";

import { Toaster } from "react-hot-toast";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  const redirectAfterAuth = isOnboarded ? "/" : "/onboarding";
  const redirectForProtected = !isAuthenticated ? "/login" : "/onboarding";

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        {/* Public layout + marketing/product routes */}
        <Route path="/" element={<LayOut />}>
          <Route index element={<Home />} />
          <Route path="submit" element={<IdeaAnalyzer />} />
          <Route path="aboutus" element={<About />} />
          <Route path="search" element={<Search />} />
          <Route path="projects" element={<Projects />} />
          <Route path="payment-result" element={<PaymentResult />} />
          <Route path="project/:id" element={<Projectdetail />} />

          {/* Auth routes inside layout */}
          <Route
            path="signup"
            element={
              !isAuthenticated ? (
                <SignUpPage />
              ) : (
                <Navigate to={redirectAfterAuth} replace />
              )
            }
          />
          <Route
            path="login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to={redirectAfterAuth} replace />
              )
            }
          />
        </Route>

        

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Format showSidebar>
                <NotificationsPage />
              </Format>
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
        />
         <Route
          path="/chathome"
          element={
            isAuthenticated && isOnboarded ? (
              <Format showSidebar>
                <ChatHomePage />
              </Format>
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
        />
         
{/* Chat home in its own shell */}
        <Route
          path="/chatroom/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Format showSidebar>
                <ChatHomePage />
              </Format>
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
        />
        {/* Video call */}
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
        />

        {/* 1–1 chat */}
        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Format showSidebar={false}>
                <ChatPage />
              </Format>
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
        />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
