// src/components/admin/DataTable.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, MoreVertical, Loader2 } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  searchable?: boolean;
  onSearch?: (value: string) => void;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    onPageChange: (page: number) => void;
  };
  actions?: (row: any) => React.ReactNode;
  emptyMessage?: React.ReactNode; // Changed from string to ReactNode
  selection?: {
    enable: boolean;
    render: (row: any) => React.ReactNode;
    onSelectAll: () => void;
    selectedCount: number;
    totalCount: number;
  };
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  onRowClick,
  searchable = true,
  onSearch,
  pagination,
  actions,
  emptyMessage = 'No data available',
  selection,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortColumn, setSortColumn] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const renderEmptyState = () => {
    if (typeof emptyMessage === 'string') {
      return (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mb-3 text-gray-300 mx-auto" />
          <p className="text-lg text-gray-500">{emptyMessage}</p>
          {searchTerm && (
            <p className="text-sm mt-1 text-gray-400">Try adjusting your search</p>
          )}
        </div>
      );
    }
    
    return emptyMessage;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      {(searchable || pagination) && (
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}
          
          {pagination && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} entries
              </span>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className={`p-1.5 rounded-lg ${
                    pagination.hasPrev
                      ? 'hover:bg-gray-100 text-gray-600'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="px-3 py-1 bg-gray-100 rounded-lg font-medium">
                  {pagination.page}
                </span>
                
                <button
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className={`p-1.5 rounded-lg ${
                    pagination.hasNext
                      ? 'hover:bg-gray-100 text-gray-600'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selection header */}
      {selection?.enable && selection.selectedCount > 0 && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium text-blue-800">
                {selection.selectedCount} item(s) selected
              </span>
            </div>
            <button
              onClick={selection.onSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selection.selectedCount === selection.totalCount ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Selection column */}
              {selection?.enable && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selection.selectedCount === selection.totalCount && selection.totalCount > 0}
                    onChange={selection.onSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={{ width: column.width }}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && (
                      <span className="ml-1">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? '↑' : '↓'
                        ) : (
                          <span className="text-gray-300">↕</span>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0) + (selection?.enable ? 1 : 0)} 
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                    <p className="text-gray-600">Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0) + (selection?.enable ? 1 : 0)} 
                  className="px-6 py-12 text-center"
                >
                  {renderEmptyState()}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {/* Selection checkbox */}
                  {selection?.enable && (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {selection.render(row)}
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      <div className="text-sm text-gray-900">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </div>
                    </td>
                  ))}
                  
                  {actions && (
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;