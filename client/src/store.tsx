import { configureStore } from "@reduxjs/toolkit";
import gravesReducer from "./features/gravesSlice";
import singleGraveReducer from "./features/singleGraveSlice";
import singleUserReducer from "./features/userSlice";

const store = configureStore({
  reducer: {
    graves: gravesReducer,
    singleGrave: singleGraveReducer,
    singleUser: singleUserReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
