import { Navigate, Outlet } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";

const AdminRoute = () => {
  const { authUser, isLoading } = useAuthUser();

  if (isLoading) return <div>Loading...</div>; 

  if (!authUser || authUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;