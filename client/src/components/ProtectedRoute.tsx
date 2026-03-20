import type { FC } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";

type TProps = {
  roles?: string[];
  redirectPath?: string;
};

export const ProtectedRoute: FC<TProps> = ({
  roles,
  redirectPath = "/login-user",
}) => {
  const user = useSelector(selectUser);

  if (!user) return <Navigate to={redirectPath} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return <Outlet />;
};
