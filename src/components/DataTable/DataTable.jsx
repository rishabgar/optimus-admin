import { useState } from "react";
import Portal from "../../utils/portal";
import styles from "./DataTable.module.css";

function DataTable({
  columns,
  data,
  getRowKey,
  isLoading = false,
  isError = false,
  loadingMessage = "Loading...",
  errorMessage = "Unable to load data.",
  emptyMessage = "No data found.",
  idleMessage,
  minWidth = 900,
  rowActions = [],
}) {
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const hasRowActions = rowActions.length > 0;
  const columnCount = columns.length + (hasRowActions ? 1 : 0);
  const shouldShowRows = !idleMessage && !isLoading && !isError;

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table} style={{ minWidth: `${minWidth}px` }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.headerClassName}>
                  {column.header}
                </th>
              ))}
              {hasRowActions ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {idleMessage ? (
              <tr>
                <td colSpan={columnCount} className={styles.statusCell}>
                  {idleMessage}
                </td>
              </tr>
            ) : null}

            {!idleMessage && isLoading ? (
              <tr>
                <td colSpan={columnCount} className={styles.statusCell}>
                  {loadingMessage}
                </td>
              </tr>
            ) : null}

            {!idleMessage && isError ? (
              <tr>
                <td colSpan={columnCount} className={styles.statusCell}>
                  {errorMessage}
                </td>
              </tr>
            ) : null}

            {shouldShowRows && data.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className={styles.statusCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}

            {shouldShowRows
              ? data.map((row, rowIndex) => {
                  const rowKey = getRowKey(row, rowIndex);

                  return (
                    <tr key={rowKey}>
                      {columns.map((column) => (
                        <td key={column.key} className={column.cellClassName}>
                          {column.render
                            ? column.render(row, rowIndex)
                            : row[column.key] ?? "-"}
                        </td>
                      ))}
                      {hasRowActions ? (
                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.actionButton}
                              aria-label={`Open actions for row ${rowIndex + 1}`}
                              aria-expanded={openActionMenu?.rowKey === rowKey}
                              onClick={(event) => {
                                const buttonRect =
                                  event.currentTarget.getBoundingClientRect();

                                setOpenActionMenu((currentMenu) =>
                                  currentMenu?.rowKey === rowKey
                                    ? null
                                    : {
                                        row,
                                        rowIndex,
                                        rowKey,
                                        left: Math.max(
                                          buttonRect.right - 148,
                                          16,
                                        ),
                                        top: buttonRect.bottom + 8,
                                      },
                                );
                              }}
                            >
                              <span aria-hidden="true">...</span>
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      {openActionMenu ? (
        <Portal>
          <button
            type="button"
            className={styles.actionMenuBackdrop}
            aria-label="Close row actions"
            onClick={() => setOpenActionMenu(null)}
          />
          <div
            className={styles.actionMenu}
            style={{
              left: `${openActionMenu.left}px`,
              top: `${openActionMenu.top}px`,
            }}
          >
            {rowActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  action.onClick(openActionMenu.row, openActionMenu.rowIndex);
                  setOpenActionMenu(null);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </Portal>
      ) : null}
    </>
  );
}

export default DataTable;
