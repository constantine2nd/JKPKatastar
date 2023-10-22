import React, { useState, useEffect, useRef } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
// MUI Table
import { styled } from "@mui/material/styles";
import TableMUI from "@mui/material/Table";
import TableBodyMUI from "@mui/material/TableBody";
import TableCellMUI, { tableCellClasses } from "@mui/material/TableCell";
import TableContainerMUI from "@mui/material/TableContainer";
import TableHeadMUI from "@mui/material/TableHead";
import TableRowMUI from "@mui/material/TableRow";
import PaperMUI from "@mui/material/Paper";
import Loader from "../components/Loader";
import Message from "../components/Message";

import {
  selectAllUsers,
  getAllUsersError,
  getAllUsersStatus,
  getAllUsers,
} from "../features/allUsersSlice";

import { User } from "../interfaces/UserInterfaces";

const UsersTableScreen: React.FC = () => {
  const users: User[] | null = useSelector(selectAllUsers);
  const usersStatus = useSelector(getAllUsersStatus);
  const error = useSelector(getAllUsersError);
  const dispatch = useDispatch<any>();
  useEffect(() => {
    if (usersStatus === "idle") {
      console.log("UPAO");
      dispatch(getAllUsers());
    }
  }, [usersStatus, dispatch]);

  if (usersStatus === "loading") {
    return <Loader />;
  }

  if (usersStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }
  return (
    <>
      <h1>Users table screen</h1>
    </>
  );
};

export default UsersTableScreen;
