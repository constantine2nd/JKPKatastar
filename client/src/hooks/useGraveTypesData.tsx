import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraveType } from "../interfaces/GraveTypeInterfaces";
import axios from "axios";


const graveTypeQueryKey = "grave-types-all";

// CREATE hook (post a new row to api)
export const useCreateRow = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (row: GraveType) => {
        //send api update request here
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const response = await axios.post(
          `/api/grave-types/addgravetype`,
          { ...row },
          config
        );
        return response.data;
      },
      //client side optimistic update
      onSuccess: (newRowInfo: GraveType) => {
        queryClient.setQueryData(
          [graveTypeQueryKey],
          (prevRows: any) => [...prevRows, { ...newRowInfo }] as GraveType[]
        );
      },
      // onSettled: () => queryClient.invalidateQueries({ queryKey: [graveTypeQueryKey] }), //refetch users after mutation, disabled for demo
    });
  }
  
  // READ hook (get rows from api)
 export const useGetRows = () => {
    return useQuery<GraveType[]>({
      queryKey: [graveTypeQueryKey],
      queryFn: async () => {
        // send api request here
        const response = await axios.get(`/api/grave-types/all`);
        return response.data;
      },
      refetchOnWindowFocus: true,
    });
  }

// UPDATE hook (put a row in api)
export const useUpdateRow = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (row: GraveType) => {
        //send api update request here
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const dataToSend = {
          id: row._id,
          name: row.name,
          description: row.description,
          capacity: row.capacity,
        };
        const response = await axios.put(
          `/api/grave-types/updategravetype`,
          dataToSend,
          config
        );
        return response.data;
      },
      //client side optimistic update
      onMutate: (newGraveTypeInfo: GraveType) => {
        queryClient.setQueryData([graveTypeQueryKey], (prevRows: any) =>
          prevRows?.map((row: GraveType) =>
            row._id === newGraveTypeInfo._id ? newGraveTypeInfo : row
          )
        );
      },
      // onSettled: () => queryClient.refetchQueries({ queryKey: [graveTypeQueryKey] }), //refetch users after mutation, disabled for demo
    });
  }

  // DELETE hook (delete a row in api)
export const useDeleteRow = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        //send api update request here
        const response = await axios.delete(`/api/grave-types/${id}`);
        return response.data;
      },
      // client side optimistic update
      onMutate: (id: string) => {
        queryClient.setQueryData([graveTypeQueryKey], (prevRows: any) =>
          prevRows?.filter((row: GraveType) => row._id !== id)
        );
      },
      // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
    });
  }