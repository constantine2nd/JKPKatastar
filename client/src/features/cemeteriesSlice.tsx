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

interface AllCemeteriesState {
  cemeteries: Cemetery[] | null;
  status: string;
  error: any;
}
const initialState: AllCemeteriesState = {
  cemeteries: null,
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
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        state.cemeteries = action.payload;
      })
      .addCase(fetchCemeteries.rejected, (state, action) => {
        state.cemeteries = null;
        state.status = "failed";
        state.error = action.error.message;
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
