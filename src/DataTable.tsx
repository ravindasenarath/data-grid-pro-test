import * as React from "react";
import {
  DataGridPro,
  GridToolbarQuickFilter,
  GridToolbar
} from "@mui/x-data-grid-pro";
import { createFakeServer } from "@mui/x-data-grid-generator";

const SERVER_OPTIONS = {
  useCursorPagination: false
};

const { useQuery, ...data } = createFakeServer(
  { rowLength: 1000 },
  SERVER_OPTIONS
);

const CustomToolbar = () => (
  <>
    <GridToolbar />
    <GridToolbarQuickFilter />
  </>
);

export const ServerPaginationGrid = () => {
  const [queryParams, setQueryParams] = React.useState({});
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10
  });
  const [filterModel, setFilterModel] = React.useState({
    items: [],
    quickFilterValues: []
  });
  const [sortModel, setSortModel] = React.useState([]);

  React.useEffect(() => {
    const newQueParams = {
      ...paginationModel,
      sortModel,
      filterModel
    };
    console.log(newQueParams);

    setQueryParams((prevQueryParams) => ({
      ...prevQueryParams,
      ...newQueParams
    }));
  }, [filterModel, sortModel, paginationModel]);

  const { isLoading, rows, pageInfo } = useQuery(queryParams);

  // Some API clients return undefined while loading
  // Following lines are here to prevent `rowCountState` from being undefined during the loading
  const [rowCountState, setRowCountState] = React.useState(
    pageInfo?.totalRowCount || 0
  );
  React.useEffect(() => {
    setRowCountState((prevRowCountState) => {
      if (pageInfo?.totalRowCount !== undefined) {
        return pageInfo.totalRowCount;
      }
      return prevRowCountState;
    });
  }, [pageInfo?.totalRowCount, setRowCountState]);

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGridPro
        rows={rows}
        {...data}
        rowCount={rowCountState}
        loading={isLoading}
        pageSizeOptions={[10, 20, 50, 100]}
        paginationModel={paginationModel}
        sortModel={sortModel}
        paginationMode="server"
        pagination
        sortingMode="server"
        filterMode="server"
        slots={{ toolbar: CustomToolbar }}
      />
    </div>
  );
}
