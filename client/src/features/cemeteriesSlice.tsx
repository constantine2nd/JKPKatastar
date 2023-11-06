import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Cemetery } from "../interfaces/CemeteryInterfaces";
import { RootState } from "../store";

export const fetchCemeteries = createAsyncThunk(
  "cemeteries/fetchCemeteries",
  async () => {
    const response = await axios.get(`/api/cemeteries`);
    return response.data;
  }
);

export const addCemetery = createAsyncThunk(
  "users/addCemetery",
  async (dataToSend: any) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(`/api/cemeteries/addcemetery`, dataToSend, config);
    return response.data;
  }
);

export const updateCemetery = createAsyncThunk(
  "users/updateCemetery",
  async (dataToSend: any, { dispatch, getState, rejectWithValue }) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.put(`/api/cemeteries/updatecemetery`, dataToSend, config);
    const {
      allCemeteries: { cemeteries },
    } = getState() as any;
    const newCemeteries= [...cemeteries]
    const index = newCemeteries.findIndex((cemetery: any) => cemetery._id === response.data._id)
    try {
      newCemeteries[index] = response.data;
    } catch (error) {
      console.log(error)
    }
    return newCemeteries;
  }
);

export const deleteCemetery= createAsyncThunk(
  "users/deleteCemetery",
  async (id: string) => {
    const response = await axios.delete(`/api/cemeteries/${id}`);
    return response.data;
  }
);

interface AllCemeteriesState {
  cemeteries: Cemetery[];
  status: string;
  error: any;
}
const initialState: AllCemeteriesState = {
  cemeteries: [],
  status: "idle",
  error: null,
};

const allCemeteriesSlice = createSlice({
  name: "allCemeteries",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCemeteries.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCemeteries.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cemeteries = action.payload;
      })
      .addCase(fetchCemeteries.rejected, (state, action) => {
        state.cemeteries = [];
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addCemetery.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addCemetery.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cemeteries.push(action.payload);
      })
      .addCase(addCemetery.rejected, (state, action) => {
        state.cemeteries = [];
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateCemetery.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCemetery.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cemeteries = action.payload;
      })
      .addCase(updateCemetery.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteCemetery.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteCemetery.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCemetery.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cemeteries = state.cemeteries.filter((cemeteries) => cemeteries._id !== action.payload.id)
      });
  },
});

export const selectAllCemeteries = (state: RootState) =>
  state.allCemeteries.cemeteries;
export const getAllCemeteriesStatus = (state: RootState) =>
  state.allCemeteries.status;
export const getAllCemeteriesError = (state: RootState) =>
  state.allCemeteries.error;

export default allCemeteriesSlice.reducer;
