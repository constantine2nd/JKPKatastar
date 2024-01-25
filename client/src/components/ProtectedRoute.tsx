import type { FC } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";

type TProps = {
  isAuthenticated?: boolean;
  redirectPath?: string;
};

export const ProtectedRoute: FC<TProps> = ({
  redirectPath = "/user-login",
}) => {
  const user = useSelector(selectUser);

  return user ? <Outlet /> : <Navigate to={redirectPath} />;
};
