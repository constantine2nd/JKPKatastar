import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Deceased } from "../interfaces/GraveIntefaces";
import { RootState } from "../store";

export const fetchDeceased = createAsyncThunk("allDeceased/get", async () => {
  const response = await axios.get(`/api/deceased`);
  return response.data;
});

interface AllDeceasedState {
  deceased: Deceased[];
  status: string;
  error: any;
}
const initialState: AllDeceasedState = {
  deceased: [],
  status: "idle",
  error: null,
};

const allDeceasedSlice = createSlice({
  name: "allDeceased",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeceased.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDeceased.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.deceased = action.payload;
      })
      .addCase(fetchDeceased.rejected, (state, action) => {
        state.deceased = [];
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectAllDeceased = (state: RootState) =>
  state.allDeceased.deceased;
export const getDeceasedStatus = (state: RootState) => state.allDeceased.status;
export const getDeceasedError = (state: RootState) => state.allDeceased.error;

export default allDeceasedSlice.reducer;
