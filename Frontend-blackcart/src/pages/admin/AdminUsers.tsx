// // src/pages/admin/AdminUsers.tsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Edit2, 
//   Trash2, 
//   UserCheck, 
//   UserX, 
//   Mail, 
//   Calendar,
//   RefreshCw,
//   Filter,
//   Download
// } from 'lucide-react';
// import DataTable from '../../components/admin/DataTable';
// import { adminService, User } from '../../services/adminServiceMethods';

// const AdminUsers: React.FC = () => {
//   const navigate = useNavigate();
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [pagination, setPagination] = useState({
//     page: 1,
//     pages: 1,
//     total: 0,
//     limit: 10,
//     hasNext: false,
//     hasPrev: false,
//   });

//   const fetchUsers = async (page = 1) => {
//     try {
//       setLoading(true);
//       const params: any = {
//         page,
//         limit: pagination.limit,
//       };
      
//       if (searchTerm) params.search = searchTerm;
//       if (roleFilter !== 'all') params.role = roleFilter;
      
//       const response = await adminService.getUsers(params);
//       setUsers(response.data.users);
//       setPagination({
//         page: response.data.pagination.page,
//         pages: response.data.pagination.pages,
//         total: response.data.pagination.total,
//         limit: response.data.pagination.limit,
//         hasNext: response.data.pagination.hasNext,
//         hasPrev: response.data.pagination.hasPrev,
//       });
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, [roleFilter]);

//   const handleSearch = (value: string) => {
//     setSearchTerm(value);
//     // Debounce search
//     const timeoutId = setTimeout(() => {
//       fetchUsers(1);
//     }, 500);
//     return () => clearTimeout(timeoutId);
//   };

//   const handlePageChange = (page: number) => {
//     fetchUsers(page);
//   };

//   const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
//     try {
//       await adminService.updateUser(userId, updates);
//       fetchUsers(pagination.page);
//     } catch (error) {
//       console.error('Error updating user:', error);
//     }
//   };

//   const handleDeleteUser = async (userId: string) => {
//     if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
//       try {
//         await adminService.deleteUser(userId);
//         fetchUsers(pagination.page);
//       } catch (error) {
//         console.error('Error deleting user:', error);
//       }
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const columns = [
//     {
//       key: 'name',
//       header: 'User',
//       render: (value: string, row: User) => (
//         <div className="flex items-center">
//           <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
//             <span className="text-sm font-semibold text-blue-600">
//               {value?.charAt(0).toUpperCase() || 'U'}
//             </span>
//           </div>
//           <div>
//             <div className="font-medium text-gray-900">{value}</div>
//             <div className="text-sm text-gray-500">{row.email}</div>
//           </div>
//         </div>
//       ),
//       sortable: true,
//     },
//     {
//       key: 'role',
//       header: 'Role',
//       render: (value: string) => (
//         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//           value === 'admin' 
//             ? 'bg-purple-100 text-purple-800'
//             : 'bg-gray-100 text-gray-800'
//         }`}>
//           {value.charAt(0).toUpperCase() + value.slice(1)}
//         </span>
//       ),
//       sortable: true,
//     },
//     {
//       key: 'status',
//       header: 'Status',
//       render: (value: string, row: User) => (
//         <div className="space-y-1">
//           <div className="flex items-center">
//             {row.isActive ? (
//               <UserCheck className="h-4 w-4 text-green-500 mr-1" />
//             ) : (
//               <UserX className="h-4 w-4 text-red-500 mr-1" />
//             )}
//             <span className={`text-sm font-medium ${
//               row.isActive ? 'text-green-600' : 'text-red-600'
//             }`}>
//               {row.isActive ? 'Active' : 'Inactive'}
//             </span>
//           </div>
//           {row.emailVerified && (
//             <div className="flex items-center text-xs text-gray-500">
//               <Mail className="h-3 w-3 mr-1" />
//               Verified
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: 'createdAt',
//       header: 'Registered',
//       render: (value: string) => (
//         <div className="flex items-center text-sm text-gray-600">
//           <Calendar className="h-4 w-4 mr-2" />
//           {formatDate(value)}
//         </div>
//       ),
//       sortable: true,
//     },
//     {
//       key: 'actions',
//       header: 'Actions',
//       render: (value: any, row: User) => (
//         <div className="space-y-2">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               handleUpdateUser(row._id, { isActive: !row.isActive });
//             }}
//             className={`w-full px-3 py-1.5 text-sm rounded-lg transition ${
//               row.isActive
//                 ? 'bg-red-50 text-red-700 hover:bg-red-100'
//                 : 'bg-green-50 text-green-700 hover:bg-green-100'
//             }`}
//           >
//             {row.isActive ? 'Deactivate' : 'Activate'}
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               navigate(`/admin/users/${row._id}`);
//             }}
//             className="w-full px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
//           >
//             View Details
//           </button>
//         </div>
//       ),
//     },
//   ];

//   const renderActions = (row: User) => (
//     <div className="flex items-center space-x-2">
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           navigate(`/admin/users/edit/${row._id}`);
//         }}
//         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
//         title="Edit User"
//       >
//         <Edit2 className="h-4 w-4" />
//       </button>
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           handleDeleteUser(row._id);
//         }}
//         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//         title="Delete User"
//       >
//         <Trash2 className="h-4 w-4" />
//       </button>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 md:mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-2">Manage all users and their permissions</p>
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={() => fetchUsers()}
//                 className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
//               >
//                 <RefreshCw className="h-4 w-4 mr-2" />
//                 Refresh
//               </button>
//             </div>
//           </div>

//           {/* Filters */}
//           <div className="mt-6 flex flex-col sm:flex-row gap-4">
//             <div className="flex-1 max-w-md">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search users by name or email..."
//                   className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   onChange={(e) => handleSearch(e.target.value)}
//                 />
//                 <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <select
//                 value={roleFilter}
//                 onChange={(e) => setRoleFilter(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//               >
//                 <option value="all">All Roles</option>
//                 <option value="user">Users</option>
//                 <option value="admin">Admins</option>
//               </select>
              
//               <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center">
//                 <Download className="h-4 w-4 mr-2" />
//                 Export
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-xl border border-gray-200">
//             <p className="text-sm text-gray-500">Total Users</p>
//             <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
//           </div>
//           <div className="bg-white p-4 rounded-xl border border-gray-200">
//             <p className="text-sm text-gray-500">Active Users</p>
//             <p className="text-2xl font-bold text-gray-900">
//               {users.filter(u => u.isActive).length}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-xl border border-gray-200">
//             <p className="text-sm text-gray-500">Admins</p>
//             <p className="text-2xl font-bold text-gray-900">
//               {users.filter(u => u.role === 'admin').length}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-xl border border-gray-200">
//             <p className="text-sm text-gray-500">Verified Emails</p>
//             <p className="text-2xl font-bold text-gray-900">
//               {users.filter(u => u.emailVerified).length}
//             </p>
//           </div>
//         </div>

//         {/* Data Table */}
//         <DataTable
//           columns={columns}
//           data={users}
//           loading={loading}
//           searchable={false}
//           pagination={{
//             ...pagination,
//             onPageChange: handlePageChange,
//           }}
//           actions={renderActions}
//           onRowClick={(row) => navigate(`/admin/users/${row._id}`)}
//           emptyMessage="No users found"
//         />
//       </div>
//     </div>
//   );
// };

// export default AdminUsers;

//fixing three issue of three action buttons edit,delete ,view detatails

// src/pages/admin/AdminUsers.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar,
  RefreshCw,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { adminService, User } from '../../services/adminServiceMethods';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const response = await adminService.getUsers(params);
      setUsers(response.data.users);
      setPagination({
        page: response.data.pagination.page,
        pages: response.data.pagination.pages,
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
        hasNext: response.data.pagination.hasNext,
        hasPrev: response.data.pagination.hasPrev,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const timeoutId = setTimeout(() => {
      fetchUsers(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await adminService.updateUser(userId, updates);
      fetchUsers(pagination.page);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        fetchUsers(pagination.page);
      } catch (error: any) {
        // Show the actual error message from backend (e.g. "Cannot delete user with existing orders")
        const message = error?.response?.data?.message || 'Error deleting user';
        alert(message);
        console.error('Error deleting user:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ✅ FIXED: columns no longer includes an 'actions' key
  // All actions are handled exclusively by renderActions below
  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (value: string, row: User) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-sm font-semibold text-blue-600">
              {value?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'role',
      header: 'Role',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'admin' 
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string, row: User) => (
        <div className="space-y-1">
          <div className="flex items-center">
            {row.isActive ? (
              <UserCheck className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <UserX className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              row.isActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {row.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {row.emailVerified && (
            <div className="flex items-center text-xs text-gray-500">
              <Mail className="h-3 w-3 mr-1" />
              Verified
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(value)}
        </div>
      ),
      sortable: true,
    },
  ];

  // ✅ FIXED: All 4 actions in one clean block — no overlap with columns
  const renderActions = (row: User) => (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      {/* Row 1: Icon buttons — Edit & Delete */}
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // ✅ FIXED: navigate to admin/users/:id with edit query param
            // Make sure this route exists in your React Router config
            navigate(`/admin/users/${row._id}?tab=edit`);
          }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
          title="Edit User"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteUser(row._id);
          }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
          title="Delete User"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      {/* Row 2: View Details */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/admin/users/${row._id}`);
        }}
        className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition"
      >
        <Eye className="h-3.5 w-3.5" />
        View Details
      </button>

      {/* Row 3: Activate / Deactivate */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleUpdateUser(row._id, { isActive: !row.isActive });
        }}
        className={`w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg transition ${
          row.isActive
            ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            : 'bg-green-50 text-green-700 hover:bg-green-100'
        }`}
      >
        {row.isActive ? (
          <><UserX className="h-3.5 w-3.5" /> Deactivate</>
        ) : (
          <><UserCheck className="h-3.5 w-3.5" /> Activate</>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage all users and their permissions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchUsers()}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Active Users</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Verified Emails</p>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.emailVerified).length}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          searchable={false}
          pagination={{
            ...pagination,
            onPageChange: handlePageChange,
          }}
          actions={renderActions}
          onRowClick={(row) => navigate(`/admin/users/${row._id}`)}
          emptyMessage="No users found"
        />
      </div>
    </div>
  );
};

export default AdminUsers;