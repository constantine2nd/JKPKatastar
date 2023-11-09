import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { GraveType } from "../interfaces/GraveTypeInterfaces";
import { RootState } from "../store";

export const getAllGraveTypes = createAsyncThunk(
  "allGraveTypes/get",
  async () => {
    const response = await axios.get(`/api/grave-types/all`);
    return response.data;
  }
);

interface GraveTypesState {
  graveTypes: GraveType[] | null;
  status: string;
  error: any;
}
const initialState: GraveTypesState = {
  graveTypes: null,
  status: "idle",
  error: null,
};

const allGraveTypesSlice = createSlice({
  name: "allGraveTypes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllGraveTypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllGraveTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.graveTypes = action.payload;
      })
      .addCase(getAllGraveTypes.rejected, (state, action) => {
        state.graveTypes = null;
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectAllGraveTypes = (state: RootState) =>
  state.allGraveTypes.graveTypes;
export const getAllGraveTypesStatus = (state: RootState) =>
  state.allGraveTypes.status;
export const getAllGraveTypesError = (state: RootState) =>
  state.allGraveTypes.error;

export default allGraveTypesSlice.reducer;
