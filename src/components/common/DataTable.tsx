import { type FC } from 'react';
import '../../styles/components/data-table.css';

interface DataTableProps {
  columns: {
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode;
  }[];
  data: any[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

const DataTable: FC<DataTableProps> = ({
  columns,
  data,
  onSort,
  sortKey,
  sortDirection,
}) => {
  return (
    <div className="modern-table-wrapper w-full">
      <table className="modern-table w-full border-collapse">
        <thead>
          <tr className="bg-[var(--bg-tertiary)]">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-secondary)] border-b border-[var(--border)]"
                onClick={() => onSort?.(column.key)}
                style={{ cursor: onSort ? 'pointer' : 'default' }}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {sortKey === column.key && (
                    <span className="text-[var(--text-primary)]">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-[var(--bg-hover)] transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 text-sm text-[var(--text-primary)] border-b border-[var(--border)]"
                >
                  {column.render ? column.render(row[column.key]) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;