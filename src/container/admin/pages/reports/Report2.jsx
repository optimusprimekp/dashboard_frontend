import React, { useState, useEffect } from "react";
import AgGridTable from "../../../../components/common/agGrid/AgGridTable";

const Report2 = () => {
  const [rowData, setRowData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterModel, setFilterModel] = useState({});
  const [sortModel, setSortModel] = useState([]);

  // Define your columns
  const columnDefs = [
    {
      field: "id",
      headerName: "ID",
      filter: "agNumberColumnFilter",
      sortable: true,
      resizable: true,
    },
    {
      field: "name",
      headerName: "Name",
      filter: "agTextColumnFilter",
      sortable: true,
      resizable: true,
    },
    {
      field: "email",
      headerName: "Email",
      filter: "agTextColumnFilter",
      sortable: true,
      resizable: true,
    },
    {
      field: "role",
      headerName: "Role",
      filter: "agTextColumnFilter",
      sortable: true,
      resizable: true,
    },
    {
      field: "status",
      headerName: "Status",
      filter: "agTextColumnFilter",
      sortable: true,
      resizable: true,
      cellRenderer: (params) => {
        const status = params.value;
        const color = status === "Active" ? "#04ab47" : "#e4004d";
        return <span style={{ color, fontWeight: "500" }}>{status}</span>;
      },
    },
  ];

  // Fetch data from server
  const fetchData = async () => {
    try {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate dummy data
      const dummyData = Array.from({ length: 100 }, (_, index) => ({
        id: index + 1,
        name: `Test User ${index + 1}`,
        email: `user${index + 1}@test.com`,
        role: index % 2 === 0 ? "Admin" : "User",
        status: index % 3 === 0 ? "Active" : "Inactive",
      }));

      // Calculate pagination
      const pageSize = 10;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      // Apply filters if any
      let filteredData = [...dummyData];
      Object.entries(filterModel).forEach(([field, filter]) => {
        if (filter.filter) {
          filteredData = filteredData.filter((row) =>
            String(row[field])
              .toLowerCase()
              .includes(filter.filter.toLowerCase())
          );
        }
      });

      // Apply sorting if any
      if (sortModel.length > 0) {
        const { colId, sort } = sortModel[0];
        filteredData.sort((a, b) => {
          return sort === "asc"
            ? String(a[colId]).localeCompare(String(b[colId]))
            : String(b[colId]).localeCompare(String(a[colId]));
        });
      }

      setTotalRows(filteredData.length);
      setRowData(filteredData.slice(startIndex, endIndex));
    } catch (error) {
      console.error("Error generating dummy data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filterModel, sortModel]);

  return (
    <AgGridTable
      columnDefs={columnDefs}
      rowData={rowData}
      totalRows={totalRows}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onFilterChanged={setFilterModel}
      onSortChanged={setSortModel}
      loading={loading}
    />
  );
};

export default Report2;
