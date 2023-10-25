import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { User } from "../interfaces/UserInterfaces";
import { RootState } from "../store";

export const getAllUsers = createAsyncThunk("allUsers/get", async () => {
  const response = await axios.get(`/api/users`);
  return response.data;
});

interface AllUsersState {
  users: User[];
  status: string;
  error: any;
}
const initialState: AllUsersState = {
  users: [],
  status: "idle",
  error: null,
};

const allUsersSlice = createSlice({
  name: "allUsers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.users = [];
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectAllUsers = (state: RootState) => state.allUsers.users;
export const getAllUsersStatus = (state: RootState) => state.allUsers.status;
export const getAllUsersError = (state: RootState) => state.allUsers.error;

export default allUsersSlice.reducer;
