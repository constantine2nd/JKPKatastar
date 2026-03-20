import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import _ from "lodash";
import { composeErrorMessageIntoPromise } from "../components/CommonFuntions";
import store from "../store";
import { logoutUser } from "../features/userSlice";

axios.interceptors.request.use(
  (config) => {
    let userInfoFromStorage = null;
    if (sessionStorage.getItem("userInfo") !== null) {
      userInfoFromStorage = JSON.parse(
        sessionStorage.getItem("userInfo") || "{}"
      );
    }
    config.headers["Authorization"] = `Bearer ${userInfoFromStorage?.token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logoutUser());
      window.location.href = "/login-user";
    }
    return Promise.reject(error);
  }
);

// CREATE hook (post a new row to api)
export const useCreateRow = (queryKey: string, path: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (row: any) => {
      //send api update request here
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await axios.post(path, { ...row }, config);
        return response.data;
      } catch (error: any) {
        return composeErrorMessageIntoPromise(error);
      }
    },
    //client side optimistic update
    onSuccess: (newRowInfo: any) => {
      queryClient.setQueryData(
        [queryKey],
        (prevRows: any) => [...prevRows, { ...newRowInfo }] as any[]
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: [graveTypeQueryKey] }), //refetch users after mutation, disabled for demo
  });
};

// READ hook (get rows from api)
export const useGetRows = (queryKey: string, path: string) => {
  return useQuery<any[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      // send api request here
      try {
        const response = await axios.get(path);
        return response.data;
      } catch (error: any) {
        return composeErrorMessageIntoPromise(error);
      }
    },
    refetchOnWindowFocus: true,
  });
};

// UPDATE hook (put a row in api)
export const useUpdateRow = (queryKey: string, path: string, onSettled?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (row: any) => {
      //send api update request here
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await axios.put(path, { ...row }, config);
        return response.data;
      } catch (error: any) {
        return composeErrorMessageIntoPromise(error);
      }
    },
    //client side optimistic update
    onMutate: onSettled ? undefined : (newRowInfo: any) => {
      queryClient.setQueryData([queryKey], (prevRows: any) =>
        prevRows?.map((row: any) => {
          if (row._id === newRowInfo._id) {
            for (const [key, value] of Object.entries(newRowInfo)) {
              _.set(row, key, value);
            }
          }
          return row;
        })
      );
    },
    onSettled: onSettled,
  });
};

// DELETE hook (delete a row in api)
export const useDeleteRow = (queryKey: string, path: string, onSettled?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      //send api update request here
      try {
        const response = await axios.delete(`${path}/${id}`);
        return response.data;
      } catch (error: any) {
        return composeErrorMessageIntoPromise(error);
      }
    },
    onMutate: onSettled ? undefined : (id: string) => {
      queryClient.setQueryData([queryKey], (prevRows: any) =>
        prevRows?.filter((row: any) => row._id !== id)
      );
    },
    onSettled: onSettled,
  });
};
