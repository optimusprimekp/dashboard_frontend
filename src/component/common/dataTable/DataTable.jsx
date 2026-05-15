import Index from "../../Index";
import PagesIndex from "../../PagesIndex";

export default function DataTable(props) {
  const {
    headerData,
    subHeaderData,
    filterData,
    children,
    currentPage,
    setCurrentPage,
    pageSize,
  } = props;

  return (
    <>
      <Index.Box className={`admin-userlist-table-main page-table-main`}>
        <Index.TableContainer
          component={Index.Paper}
          className="table-container"
        >
          <Index.Table aria-label="simple table" className="table">
            <Index.TableHead className="table-head">
              <Index.TableRow className="table-row">
                {headerData?.map((data) => {
                  return (
                    <Index.TableCell
                      component="th"
                      variant="th"
                      className="table-th"
                      // width="10%"
                      align={data?.align ?? "left"}
                      key={data?.field}
                      colSpan={data?.colSpan || ""}
                    >
                      {data?.field}
                    </Index.TableCell>
                  );
                })}
              </Index.TableRow>
              {subHeaderData?.length && (
                <Index.TableRow className="table-row">
                  {subHeaderData?.map((data, i) => {
                    return (
                      <Index.TableCell
                        component="th"
                        variant="th"
                        className="table-th"
                        // width="10%"
                        align={data?.align ?? "left"}
                        key={i}
                      >
                        {data?.field}
                      </Index.TableCell>
                    );
                  })}
                </Index.TableRow>
              )}
            </Index.TableHead>
            <Index.TableBody className="table-body">
              {filterData ? <>{children}</> : <PagesIndex.DataNotFound />}
            </Index.TableBody>
          </Index.Table>
        </Index.TableContainer>
      </Index.Box>
      <Index.Box className="admin-pagination-main">
        <Index.Pagination
          page={currentPage}
          count={Math.ceil(filterData / (pageSize ? pageSize : 10))}
          onChange={(event, newPage) => setCurrentPage(newPage)}
          variant="outlined"
          shape="rounded"
          className="admin-pagination"
        />
      </Index.Box>
    </>
  );
}
