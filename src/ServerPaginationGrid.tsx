import React from "react";
import { DataGridPro, GridToolbarQuickFilter, GridToolbar, GridColDef } from "@mui/x-data-grid-pro";
import { useFieldArray, useFormContext } from "react-hook-form";
import { VehicleAttributes, Root } from "./App"; // Import the types

const CustomToolbar = () => (
  <>
    <GridToolbar />
    <GridToolbarQuickFilter />
  </>
);

const dataColumns: GridColDef[] = [
  {
    field: "type",
    headerName: "Model",
    flex: 1,
  },
  {
    field: "desc",
    headerName: "Make",
    flex: 1,
  },
];

interface ServerPaginationGridProps {
  datapath: string;
}

export const ServerPaginationGrid = ({ datapath }: ServerPaginationGridProps) => {
  const { control } = useFormContext<Root>();
  const { fields } = useFieldArray<Root, 'Root.0.Vehicles.0.Vehicle', '_internalId'>({
    control,
    name: datapath as 'Root.0.Vehicles.0.Vehicle',
    keyName: "_internalId",
  });

  console.log('fields: ', fields)

  const rows = fields.map((field, index) => ({
    ...field._attributes,
    id: index,
  }))

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGridPro<VehicleAttributes>
        rows={rows} 
        columns={dataColumns} 
        slots={{ toolbar: CustomToolbar }} 
        onRowClick={(params) => { const row: VehicleAttributes = params.row}}
      />
    </div>
  );
};
