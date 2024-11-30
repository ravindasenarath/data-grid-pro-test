import * as React from "react";
import {
  DataGridPro,
  GridToolbarQuickFilter,
  GridToolbar,
  GridColDef
} from "@mui/x-data-grid-pro";
import { createFakeServer } from "@mui/x-data-grid-generator";
import { useFieldArray, useFormContext } from "react-hook-form";

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

const dataColumns: GridColDef[] = [
    {
        field: 'type',
        headerName: 'Model',
        flex: 1 
    },
    {
        field: 'desc',
        headerName: 'Make',
        flex: 1 
    }
]

interface ServerPaginationGridProps {
    datapath: string
}

export const ServerPaginationGrid = ({ datapath }: ServerPaginationGridProps) => {

    const { control } = useFormContext()
    const { fields } = useFieldArray({
        control,
        name: datapath,
        keyName: '_internalId'
    })

    const rows = fields.map((field: any, index) => ({
        ...field['_attributes'],
        id: index
    }))

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGridPro
        rows={rows}
        columns={dataColumns}
        slots={{ toolbar: CustomToolbar }}
      />
    </div>
  );
}
