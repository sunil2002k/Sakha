import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const ChatHomePage = lazy(() => import("./pages/ChatHomePage.jsx"));
const SignUpPage = lazy(() => import("./pages/SignUpPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage.jsx"));
const CallPage = lazy(() => import("./pages/CallPage.jsx"));
const ChatPage = lazy(() => import("./pages/ChatPage.jsx"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const ProjectdetailPage = lazy(() => import("./pages/ProjectdetailPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const KYCFormPage = lazy(() => import("./pages/KYCFormPage.jsx"));
const FriendsPage = lazy(() => import("./pages/FriendsPage.jsx"));
const MentorDetailPage = lazy(() => import("./pages/MentorDetailPage.jsx"));
const MyProjectPage = lazy(() => import("./pages/MyProjectPage.jsx"));
const ProjectSubmitPage = lazy(() => import("./pages/ProjectSubmitPage.jsx"));

const Home = lazy(() => import("./components/Home.jsx"));
const About = lazy(() => import("./components/About.jsx"));
const Search = lazy(() => import("./components/Search.jsx"));
const Projects = lazy(() => import("./components/Projects.jsx"));
const PaymentResult = lazy(() => import("./components/PaymentResult.jsx"));
import LayOut from "./components/LayOut.jsx";
import Format from "./components/Format.jsx";
import PageLoader from "./components/PageLoader.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
const KYCDetails = lazy(() => import("./components/KYCDetails.jsx"));

import useAuthUser from "./hooks/useAuthUser.js";
import { useThemeStore } from "./store/useThemeStore.js";

import { Toaster } from "react-hot-toast";
const AdminAnalytics = lazy(() => import("./components/Adminanalytics.jsx"));
const AdminUserMgmt = lazy(() => import("./components/AdminUserMgmt.jsx"));
const AdminTrxn = lazy(() => import("./components/Admintrxn.jsx"));



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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>

      <Toaster />
    </div>
  );
};

export default App;