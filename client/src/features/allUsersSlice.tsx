import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { User } from "../interfaces/UserInterfaces";
import { RootState } from "../store";

export const getAllUsers = createAsyncThunk("allUsers/get", async () => {
  const response = await axios.get(`/api/users`);
  return response.data;
});

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (dataToSend: any, { dispatch, getState, rejectWithValue }) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.put(`/api/users/updateuser`, dataToSend, config);
    const {
      allUsers: { users },
    } = getState() as any;
    const newUsers= [...users]
    const index = newUsers.findIndex((user: any) => user._id === response.data._id)
    try {
      newUsers[index] = response.data;
    } catch (error) {
      console.log(error)
    }
    return newUsers;
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string) => {
    const response = await axios.delete(`/api/users/${id}`);
    return response.data;
  }
);

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
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.users = [];
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = state.users.filter((user) => user._id !== action.payload.id)
      });
  },
});

export const selectAllUsers = (state: RootState) => state.allUsers.users;
export const getAllUsersStatus = (state: RootState) => state.allUsers.status;
export const getAllUsersError = (state: RootState) => state.allUsers.error;

export default allUsersSlice.reducer;
