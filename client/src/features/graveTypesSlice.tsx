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


export const addGraveType = createAsyncThunk(
  "allGraveTypes/addGraveType",
  async (dataToSend: any) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(`/api/grave-types/addgravetype`, dataToSend, config);
    return response.data;
  }
);


export const updateGraveType = createAsyncThunk(
  "allGraveTypes/updateGraveType",
  async (dataToSend: any, { dispatch, getState, rejectWithValue }) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.put(`/api/grave-types/updategravetype`, dataToSend, config);
    const {
      allGraveTypes: { graveTypes },
    } = getState() as any;
    const newgraveTypes= [...graveTypes]
    const index = newgraveTypes.findIndex((graveType: any) => graveType._id === response.data._id)
    try {
      newgraveTypes[index] = response.data;
    } catch (error) {
      console.log(error)
    }
    return newgraveTypes;
  }
);

export const deleteGraveType= createAsyncThunk(
  "users/deleteGraveType",
  async (id: string) => {
    const response = await axios.delete(`/api/grave-types/${id}`);
    return response.data;
  }
);


interface GraveTypesState {
  graveTypes: GraveType[];
  status: string;
  error: any;
}
const initialState: GraveTypesState = {
  graveTypes: [],
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
        state.graveTypes = [];
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addGraveType.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addGraveType.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.graveTypes.push(action.payload);
        localStorage.setItem("all-grave-types", JSON.stringify(state.graveTypes));
      })
      .addCase(addGraveType.rejected, (state, action) => {
        state.graveTypes = [];
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateGraveType.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateGraveType.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.graveTypes = action.payload;
        localStorage.setItem("all-grave-types", JSON.stringify(state.graveTypes));
      })
      .addCase(updateGraveType.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteGraveType.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteGraveType.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteGraveType.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.graveTypes = state.graveTypes.filter((graveTypes) => graveTypes._id !== action.payload.id)
        localStorage.setItem("all-grave-types", JSON.stringify(state.graveTypes));
      })
      ;
  },
});

export const selectAllGraveTypes = (state: RootState) =>
  state.allGraveTypes.graveTypes;
export const getAllGraveTypesStatus = (state: RootState) =>
  state.allGraveTypes.status;
export const getAllGraveTypesError = (state: RootState) =>
  state.allGraveTypes.error;

export default allGraveTypesSlice.reducer;
