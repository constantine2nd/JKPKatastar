import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { User } from "../interfaces/UserInterfaces";
import { RootState } from "../store";
import { composeErrorMessage } from "../components/CommonFuntions";

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

export const addUserVisitor = createAsyncThunk(
  "users/addUserVisitor",
  async (dataToSend: any, { rejectWithValue }) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await axios.post(
        `/api/users/adduservisitor`,
        dataToSend,
        config
      );
      return response.data;
    } catch (error: any) {
      console.log(composeErrorMessage(error));
      return rejectWithValue(composeErrorMessage(error));
    }
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
      console.log(composeErrorMessage(error));
      return rejectWithValue(composeErrorMessage(error));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "users/resetPassword",
  async (dataToSend: any, { rejectWithValue }) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await axios.put(`/api/users/reset-password`, dataToSend, config);
      return response.data;
    } catch (error) {
      console.log(composeErrorMessage(error));
      return rejectWithValue(composeErrorMessage(error));
    }
  }
);

export const resetPasswordInitiation = createAsyncThunk(
  "users/resetPasswordInitiation",
  async (dataToSend: any, { rejectWithValue }) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await axios.post(`/api/users/reset-password-initiation`, dataToSend, config);
      return response.data;
    } catch (error) {
      console.log(composeErrorMessage(error));
      return rejectWithValue(composeErrorMessage(error));
    }
  }
);

interface UserState {
  user: User | null;
  status: string;
  error: any;
}
let userInfoFromStorage = null;
if (sessionStorage.getItem("userInfo") !== null) {
  userInfoFromStorage = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
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
      sessionStorage.removeItem("userInfo");
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
        sessionStorage.setItem("userInfo", JSON.stringify(action.payload));
        state.user = action.payload;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.user = null;
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addUserVisitor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addUserVisitor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(addUserVisitor.rejected, (state, action) => {
        state.user = null;
        state.status = "failed";
        state.error = action.payload || null;
      })
      .addCase(resetPasswordInitiation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetPasswordInitiation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(resetPasswordInitiation.rejected, (state, action) => {
        state.user = null;
        state.status = "failed";
        state.error = action.payload || null;
      })
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.user = null;
        state.status = "failed";
        state.error = action.payload || null;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        sessionStorage.setItem("userInfo", JSON.stringify(action.payload));
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
