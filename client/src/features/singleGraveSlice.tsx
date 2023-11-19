import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Grave } from "../interfaces/GraveIntefaces";
import { RootState } from "../store";
import { updateGravesInc } from "./gravesSlice";

export const addPayer = createAsyncThunk(
  "grave/addPayer",
  async ({ graveId, dataToSend }: any) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(
      `/api/payer/${graveId}`,
      dataToSend,
      config
    );
    return response.data;
  }
);

export const deletePayer = createAsyncThunk(
  "grave/deletePayer",
  async (payerId: any) => {
    console.log(payerId);
    try {
      const response = await axios.delete(`/api/payer/single/${payerId}`);
      return response.data;
    } catch (error: any) {
      console.log(error);
      error.message = error.response.data;
      throw error;
    }
  }
);

export const addDeacesed = createAsyncThunk(
  "grave/addDeacesed",
  async (
    { graveId, dataToSend }: any,
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const {
        singleUser: { user },
      } = getState() as any;
      const config = user?.token
        ? {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        : {
            headers: {},
          };
      const response = await axios.post(
        `/api/deacesed/${graveId}`,
        dataToSend,
        config
      );
      dispatch(updateGravesInc(response.data));
      return response.data;
    } catch (error: any) {
      console.log(error);
      error.message = error.response.data;
      throw error;
    }
  }
);

export const deleteDeceased = createAsyncThunk(
  "grave/deleteDeceased",
  async (deceasedId: any) => {
    console.log(deceasedId);
    try {
      const response = await axios.delete(`/api/deceased/single/${deceasedId}`);
      return response.data;
    } catch (error: any) {
      console.log(error);
      error.message = error.response.data;
      throw error;
    }
  }
);

export const fetchSingleGrave = createAsyncThunk(
  "grave/fetchSingleGrave",
  async (graveId: string) => {
    const response = await axios.get(`/api/graves/single/${graveId}`);
    return response.data;
  }
);

interface GraveState {
  grave: Grave | null;
  status: string;
  error: any;
}

const initialState: GraveState = {
  grave: null,
  status: "idle",
  error: null,
};

const singleGraveSlice = createSlice({
  name: "singleGrave",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSingleGrave.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSingleGrave.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.grave = action.payload;
      })
      .addCase(fetchSingleGrave.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addPayer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addPayer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.grave?.payers.forEach((item) => (item.active = false));
        state.grave?.payers.push(action.payload);
        // = action.payload;
      })
      .addCase(addPayer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deletePayer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePayer.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log(action.payload);
        const filteredPayers = state.grave?.payers.filter(
          (payer) => payer._id !== action.payload.id
        );
        if (filteredPayers && state.grave) {
          state.grave.payers = filteredPayers;
        }
      })
      .addCase(deletePayer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addDeacesed.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addDeacesed.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.grave?.deceased.push(action.payload);
        // = action.payload;
      })
      .addCase(addDeacesed.rejected, (state, action) => {
        console.log(action);
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteDeceased.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDeceased.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log(action.payload);
        const filteredDeceased = state.grave?.deceased.filter(
          (dec) => dec._id !== action.payload.id
        );
        if (filteredDeceased && state.grave) {
          state.grave.deceased = filteredDeceased;
        }
      })
      .addCase(deleteDeceased.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectSingleGrave = (state: RootState) => state.singleGrave.grave;
export const getGraveStatus = (state: RootState) => state.singleGrave.status;
export const getGraveError = (state: RootState) => state.singleGrave.error;
//export const addPayer = (state: RootState) => state.singleGrave.grave;

export default singleGraveSlice.reducer;
