import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { User } from "../interfaces/UserInterfaces";
import { RootState } from "../store";

export const addUser = createAsyncThunk(
  "users/addUser",
  async (dataToSend: any) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(`/api/users/adduser`, dataToSend, config);
    return response.data;
  }
);



export const loginUser = createAsyncThunk(
  "users/userLogin",
  async (dataToSend: any, { rejectWithValue }) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await axios.post(`/api/users/login`, dataToSend, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        return rejectWithValue(error.response?.data);
      } else {
        throw error;
      }
    }
  }
);

interface UserState {
  user: User | null;
  status: string;
  error: any;
}
let userInfoFromStorage = null;
if (localStorage.getItem("userInfo") !== null) {
  userInfoFromStorage = JSON.parse(localStorage.getItem("userInfo") || "{}");
}

const initialState: UserState = {
  user: userInfoFromStorage,
  status: "idle",
  error: null,
};

const singleUserSlice = createSlice({
  name: "singleUser",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("userInfo");
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        state.user = action.payload;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.user = null;
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.status = "failed";
        state.error = action.payload || null;
      });
  },
});

export const selectUser = (state: RootState) => state.singleUser.user;
export const getUserStatus = (state: RootState) => state.singleUser.status;
export const getUserError = (state: RootState) => state.singleUser.error;
export const { logoutUser } = singleUserSlice.actions;

export default singleUserSlice.reducer;
