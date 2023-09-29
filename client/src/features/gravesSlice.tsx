import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { GraveData } from "../interfaces/GraveIntefaces";
import { RootState } from "../store";

//const GRAVE_URL = 'https://api.spacexdata.com/v3/rockets';

export const fetchGraves = createAsyncThunk("graves/fetchGraves", async () => {
  const response = await axios.get("/api/graves");
  return response.data;
});

export const deleteSingleGrave: any = createAsyncThunk(
  "graves/deleteSingleGrave",
  async (id: string) => {
    const response = await axios.delete(`/api/graves/${id}`);
    console.log(response);
    return response.data.id;
  }
);

export const addSingleGrave = createAsyncThunk(
  "graves/addSingleGrave",
  async (dataToSend: any) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(`/api/graves`, dataToSend, config);
    // console.log(response.data);
    return response.data;
  }
);

interface GravesState {
  graves: GraveData[];
  status: string;
  error: any;
}

const initialState: GravesState = {
  graves: [],
  status: "idle",
  error: null,
};

const gravesSlice = createSlice({
  name: "graves",
  initialState,
  reducers: {
    updateGraves: (state, action) => {
      const index = state.graves.findIndex(
        (item) => item._id === action.payload.grave
      );
      if (index !== -1) {
        // Ako je objekat pronađen, ažurirajte ga
        state.graves[index].numberOfDeceaseds = (
          Number(state.graves[index].numberOfDeceaseds) + 1
        ).toString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGraves.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGraves.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.graves = action.payload;
      })
      .addCase(fetchGraves.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteSingleGrave.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteSingleGrave.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.graves = state.graves.filter(
          (grave) => grave._id !== action.payload
        );
      })
      .addCase(deleteSingleGrave.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addSingleGrave.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addSingleGrave.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.graves.push(action.payload);
      })
      .addCase(addSingleGrave.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectAllGraves = (state: RootState) => state.graves.graves;
export const getGravesStatus = (state: RootState) => state.graves.status;
export const getGravesError = (state: RootState) => state.graves.error;
export const { updateGraves } = gravesSlice.actions;

export default gravesSlice.reducer;
