import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ChatHomePage from "./pages/ChatHomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProjectdetailPage from "./pages/ProjectdetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import KYCFormPage from "./pages/KYCFormPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import MentorDetailPage from "./pages/MentorDetailPage.jsx";
import MyProjectPage from "./pages/MyProjectPage.jsx";
import ProjectSubmitPage from "./pages/ProjectSubmitPage.jsx";

import Home from "./components/Home.jsx";
import About from "./components/About.jsx";
import Search from "./components/Search.jsx";
import Projects from "./components/Projects.jsx";
import PaymentResult from "./components/PaymentResult.jsx";
import LayOut from "./components/LayOut.jsx";
import Format from "./components/Format.jsx";
import PageLoader from "./components/PageLoader.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import KYCDetails from "./components/KYCDetails.jsx";

import useAuthUser from "./hooks/useAuthUser.js";
import { useThemeStore } from "./store/useThemeStore.js";

import { Toaster } from "react-hot-toast";
import AdminAnalytics from "./components/Adminanalytics.jsx";
import AdminUserMgmt from "./components/Adminusermgmt.jsx";
import AdminTrxn from "./components/Admintrxn.jsx";


const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  const isAdmin = authUser?.role === "admin";

  if (isLoading) return <PageLoader />;

  const redirectAfterAuth = isOnboarded ? "/" : "/onboarding";
  const redirectForProtected = !isAuthenticated ? "/login" : "/onboarding";

  return (
    <div data-theme={theme}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LayOut />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="search" element={<Search />} />
          <Route path="projects" element={<Projects />} />
          <Route path="payment-result" element={<PaymentResult />} />
          <Route path="project/:id" element={<ProjectdetailPage />} />
          <Route path="mentor/:id" element={<MentorDetailPage />} />
          <Route path="submit" element={
            isAuthenticated && isOnboarded ? (
              <ProjectSubmitPage />
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
          />
           <Route
          path="/profile"
          element={
            isAuthenticated && isOnboarded ? (
              <ProfilePage />
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
        />

        <Route
          path="/myprojects"
          element={
            isAuthenticated && isOnboarded ? (
              <MyProjectPage />
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
        />

          {/* Auth routes */}
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


        <Route
          path="/admin/dashboard"
          element={
            isAuthenticated && isAdmin ? (
              <Format showSidebar={true}>
                <AdminDashboard />
              </Format>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/analytics"
          element={
            isAuthenticated && isAdmin ? (
              <Format showSidebar={true}>
                <AdminAnalytics />
              </Format>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/users"
          element={
            isAuthenticated && isAdmin ? (
              <Format showSidebar={true}>
                <AdminUserMgmt />
              </Format>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/analytics"
          element={
            isAuthenticated && isAdmin ? (
              <Format showSidebar={true}>
                <AdminAnalytics />
              </Format>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        
        <Route
          path="/admin/transactions"
          element={
            isAuthenticated && isAdmin ? (
              <Format showSidebar={true}>
                <AdminTrxn />
              </Format>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/kyc/:id"
          element={
            isAuthenticated && isAdmin ? (
              <Format showSidebar={true}>
                <KYCDetails />
              </Format>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />


        <Route
          path="/kyc"
          element={
            isAuthenticated && isOnboarded ? (
              <Format showSidebar={false}>
                <KYCFormPage />
              </Format>
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
        />

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
          path="/chatroom"
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

        <Route
          path="/friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Format showSidebar>
                <FriendsPage />
              </Format>
            ) : (
              <Navigate to={redirectForProtected} replace />
            )
          }
        />

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