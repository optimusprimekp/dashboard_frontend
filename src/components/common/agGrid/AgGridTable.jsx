import { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeMaterial,
} from "ag-grid-community";
import Index from "../../../component/Index";

// Register the required modules
ModuleRegistry.registerModules([AllCommunityModule]);

export default function AgGridTable({
  columnDefs,
  rowData,
  totalRows,
  currentPage,
  setCurrentPage,
  onFilterChanged,
  onSortChanged,
  loading = false,
  pageSize = 10,
}) {
  // AG Grid default column properties
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressSizeToFit: false,
      flex: 1,
      minWidth: 130,
    }),
    []
  );

  // Grid container styling
  const containerStyle = {
    height: "calc(100vh - 200px)",
    width: "100%",
  };

  // Grid styling
  const gridStyle = {
    height: "100%",
    width: "100%",
  };

  const themeCustomised = themeMaterial.withParams({
    headerBackgroundColor: "rgb(17 24 39 / 10%)",
    headerTextColor: "var(--primary-color)",
    headerFontWeight: "500",
    headerFontSize: "12px",
    cellHorizontalPadding: 10,
    fontFamily: '"Poppins", sans-serif',
    fontSize: "12px",
    dataFontSize: "12px",
    // padding: "10px",
    borderBottom: "1px solid var(--main-border)",
  });

  // Handle server-side operations
  const onGridFilterChanged = useCallback(
    (event) => {
      const filterModel = event.api.getFilterModel();
      onFilterChanged?.(filterModel);
    },
    [onFilterChanged]
  );

  const onGridSortChanged = useCallback(
    (event) => {
      const sortModel = event.api.getSortModel();
      onSortChanged?.(sortModel);
    },
    [onSortChanged]
  );

  return (
    <>
      <Index.Box
        className="admin-userlist-table-main page-table-main ag-theme-alpine"
        style={containerStyle}
      >
        <div style={gridStyle}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={defaultColDef}
            animateRows={true}
            // rowSelection="multiple"
            // suppressRowClickSelection={true}
            onFilterChanged={onGridFilterChanged}
            onSortChanged={onGridSortChanged}
            enableCellTextSelection={true}
            suppressLoadingOverlay={!loading}
            // themeConfig={themeConfig}
            theme={themeCustomised}
            pagination={true}
            paginationPageSize={pageSize}
            paginationPageSizeSelector={[10, 25, 50]}
            onPaginationChanged={(event) => {
              const newPage = event.api.paginationGetCurrentPage() + 1;
              setCurrentPage(newPage);
            }}
            rowModelType="clientSide"
            domLayout="autoHeight"
            suppressAutoSize={false}
            onGridSizeChanged={(params) => {
              params.api.sizeColumnsToFit();
            }}
            onFirstDataRendered={(params) => {
              params.api.sizeColumnsToFit();
            }}
            headerHeight={40}
          />
        </div>
      </Index.Box>
      {/* <Index.Box className="admin-pagination-main">
        <Index.Pagination
          page={currentPage}
          count={Math.ceil(totalRows / pageSize)}
          onChange={(event, newPage) => setCurrentPage(newPage)}
          variant="outlined"
          shape="rounded"
          className="admin-pagination"
        />
      </Index.Box> */}
    </>
  );
}
