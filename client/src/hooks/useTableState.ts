import { useState } from "react";
import type {
  MRT_ColumnSizingState,
  MRT_VisibilityState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";

interface TablePersistedState {
  pagination: MRT_PaginationState;
  columnVisibility: MRT_VisibilityState;
  columnSizing: MRT_ColumnSizingState;
  sorting: MRT_SortingState;
  density: MRT_DensityState;
}

function makeDefaults(columnVisibility: MRT_VisibilityState = { _id: false }): TablePersistedState {
  return {
    pagination: { pageIndex: 0, pageSize: 20 },
    columnVisibility,
    columnSizing: {},
    sorting: [],
    density: "comfortable",
  };
}

function load(key: string, defaults: TablePersistedState): TablePersistedState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function save(key: string, state: TablePersistedState) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // storage full or unavailable — ignore
  }
}

export function useTableState(storageKey: string, defaultColumnVisibility?: MRT_VisibilityState) {
  const defaults = makeDefaults(defaultColumnVisibility);
  const initial = load(storageKey, defaults);

  const [pagination, setPaginationState] = useState<MRT_PaginationState>(initial.pagination);
  const [columnVisibility, setColumnVisibilityState] = useState<MRT_VisibilityState>(initial.columnVisibility);
  const [columnSizing, setColumnSizingState] = useState<MRT_ColumnSizingState>(initial.columnSizing);
  const [sorting, setSortingState] = useState<MRT_SortingState>(initial.sorting);
  const [density, setDensityState] = useState<MRT_DensityState>(initial.density);

  function persist(patch: Partial<TablePersistedState>) {
    const next = { ...defaults, pagination, columnVisibility, columnSizing, sorting, density, ...patch };
    save(storageKey, next);
  }

  const setPagination = (updater: any) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    setPaginationState(next);
    persist({ pagination: next });
  };

  const setColumnVisibility = (updater: any) => {
    const next = typeof updater === "function" ? updater(columnVisibility) : updater;
    setColumnVisibilityState(next);
    persist({ columnVisibility: next });
  };

  const setColumnSizing = (updater: any) => {
    const next = typeof updater === "function" ? updater(columnSizing) : updater;
    setColumnSizingState(next);
    persist({ columnSizing: next });
  };

  const setSorting = (updater: any) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    setSortingState(next);
    persist({ sorting: next });
  };

  const setDensity = (updater: any) => {
    const next = typeof updater === "function" ? updater(density) : updater;
    setDensityState(next);
    persist({ density: next });
  };

  return {
    pagination, setPagination,
    columnVisibility, setColumnVisibility,
    columnSizing, setColumnSizing,
    sorting, setSorting,
    density, setDensity,
  };
}
