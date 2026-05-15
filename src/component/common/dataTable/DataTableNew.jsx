import Index from "../../Index";
import PagesIndex from "../../PagesIndex";
import {
  TableSortLabel,
  TablePagination,
  Pagination,
  Box,
} from "@mui/material";

// Numbered actions with SMALL button boxes
function PaginationActions({ count, page, rowsPerPage, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(count / Math.max(rowsPerPage, 1)));

  const handleChange = (_evt, value) => {
    // <Pagination> is 1-based; TablePagination expects 0-based
    onPageChange(null, value - 1);
  };

  return (
    <Box sx={{ ml: 1 }}>
      <Pagination
        page={page + 1}
        count={totalPages}
        onChange={handleChange}
        shape="rounded"
        variant="outlined"
        size="small"
        siblingCount={1}
        boundaryCount={1}
        showFirstButton
        showLastButton
        sx={{
          "& .MuiPagination-ul": {
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
            gap: "2px", // tighter spacing
          },
          "& .MuiPaginationItem-root": {
            fontSize: "12px",
            minWidth: "24px", // smaller width
            height: "24px", // smaller height
            padding: "0 4px",
          },
        }}
      />
    </Box>
  );
}

export default function DataTableNew(props) {
  const {
    headerData,
    subHeaderData,
    filterData,
    children,
    currentPage, // 1-based
    setCurrentPage,
    pageSize,
    setPageSize,
    order, // "asc" | "desc"
    orderBy, // string id
    onRequestSort, // (id) => void
  } = props;

  const handleChangePage = (_evt, newPageZeroBased) => {
    setCurrentPage(newPageZeroBased + 1);
  };

  const handleChangeRowsPerPage = (e) => {
    const next = parseInt(e.target.value, 10);
    setPageSize(next);
    setCurrentPage(1);
  };

  const totalCount = Array.isArray(filterData)
    ? filterData.length
    : typeof filterData === "number"
    ? filterData
    : 0;

  return (
    <>
      <Index.Box className="admin-userlist-table-main page-table-main">
        <Index.TableContainer
          component={Index.Paper}
          className="table-container"
        >
          <Index.Table aria-label="data table" className="table">
            <Index.TableHead className="table-head">
              <Index.TableRow className="table-row">
                {headerData?.map((col) => {
                  const isActive =
                    !!col.id && orderBy === col.id && col.sortable;
                  return (
                    <Index.TableCell
                      component="th"
                      variant="th"
                      className="table-th"
                      align={col?.align ?? "left"}
                      key={`${col.field}-${col.id ?? "noid"}`}
                      colSpan={col?.colSpan || ""}
                    >
                      {col.sortable && col.id ? (
                        <TableSortLabel
                          active={isActive}
                          direction={isActive ? order ?? "asc" : "asc"}
                          onClick={() => onRequestSort && onRequestSort(col.id)}
                        >
                          {col.field}
                        </TableSortLabel>
                      ) : (
                        col.field
                      )}
                    </Index.TableCell>
                  );
                })}
              </Index.TableRow>

              {subHeaderData?.length ? (
                <Index.TableRow className="table-row">
                  {subHeaderData?.map((data, i) => (
                    <Index.TableCell
                      component="th"
                      variant="th"
                      className="table-th"
                      align={data?.align ?? "left"}
                      key={i}
                    >
                      {data?.field}
                    </Index.TableCell>
                  ))}
                </Index.TableRow>
              ) : null}
            </Index.TableHead>

            <Index.TableBody className="table-body">
              {filterData ? <>{children}</> : <PagesIndex.DataNotFound />}
            </Index.TableBody>
          </Index.Table>
        </Index.TableContainer>
      </Index.Box>

      {/* Footer: keep Rows-per-page design; swap page controls with compact numbered buttons */}
      <Index.Box className="admin-pagination-main">
        <TablePagination
          component="div"
          labelRowsPerPage="Rows per page:"
          rowsPerPageOptions={[10, 20, 50, 75, 100]}
          count={totalCount}
          page={Math.max(currentPage - 1, 0)} // convert to 0-based
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={PaginationActions}
          sx={{
            ".MuiTablePagination-toolbar": {
              flexWrap: "nowrap",
              gap: 1.5,
            },
            ".MuiTablePagination-actions": {
              ml: 1,
            },
          }}
        />
      </Index.Box>
    </>
  );
}
