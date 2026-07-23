import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  Eye,
  Filter,
  Mail,
  MailCheck,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  UsersRound,
} from 'lucide-react';
import { adminService, User } from '../../services/adminServiceMethods';
import { toast } from 'react-hot-toast';

type RoleFilter = 'all' | 'user' | 'admin';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10, hasNext: false, hasPrev: false });

  const fetchUsers = async (page = 1, overrides?: { search?: string; role?: RoleFilter; limit?: number }) => {
    try {
      setLoading(true);
      const activeSearch = overrides?.search ?? searchTerm;
      const activeRole = overrides?.role ?? roleFilter;
      const activeLimit = overrides?.limit ?? pagination.limit;
      const params: { page: number; limit: number; search?: string; role?: string } = { page, limit: activeLimit };
      if (activeSearch.trim()) params.search = activeSearch.trim();
      if (activeRole !== 'all') params.role = activeRole;
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
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [roleFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchUsers(1, { search: value }), 400);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages || page === pagination.page) return;
    setMenuOpenId(null);
    fetchUsers(page);
  };

  const handleLimitChange = (limit: number) => {
    setPagination((current) => ({ ...current, limit }));
    fetchUsers(1, { limit });
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await adminService.updateUser(userId, updates);
      toast.success('User updated successfully');
      setMenuOpenId(null);
      fetchUsers(pagination.page);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      setMenuOpenId(null);
      fetchUsers(pagination.page);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to delete user';
      toast.error(msg, { duration: 5000 });
    }
  };

  const handleToggleActive = (row: User) => {
    const action = row.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${row.name}?`)) return;
    handleUpdateUser(row._id, { isActive: !row.isActive });
  };

  const handleExport = () => {
    if (!users.length) {
      toast.error('There are no users to export');
      return;
    }
    const headers = ['Name', 'Email', 'Role', 'Status', 'Email verified', 'Registered'];
    const rows = users.map((user) => [
      user.name,
      user.email,
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      user.emailVerified ? 'Yes' : 'No',
      formatDate(user.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blackcart-users.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Users exported');
  };

  const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatRelative = (value: string) => {
    const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  };

  const stats = [
    { label: 'Total Users', value: pagination.total, helper: 'All registered users', icon: UsersRound, tone: 'blue' },
    { label: 'Active Users', value: users.filter((user) => user.isActive).length, helper: 'Currently active users', icon: UserCheck, tone: 'green' },
    { label: 'Admins', value: users.filter((user) => user.role === 'admin').length, helper: 'Administrator accounts', icon: ShieldCheck, tone: 'purple' },
    { label: 'Verified Emails', value: users.filter((user) => user.emailVerified).length, helper: 'Email verified users', icon: MailCheck, tone: 'indigo' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Store management</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">User Management</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">Manage all users and their roles &amp; permissions</p>
          </div>
          <button
            onClick={() => fetchUsers(pagination.page)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" aria-label="User filters">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search users by name or email</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search users by name or email…"
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <div className="relative lg:w-44">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Customers</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <button onClick={handleExport} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" aria-label="User statistics">
          {stats.map(({ label, value, helper, icon: Icon, tone }) => {
            const toneStyles = {
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-emerald-50 text-emerald-600',
              purple: 'bg-purple-50 text-purple-600',
              indigo: 'bg-indigo-50 text-indigo-600',
            }[tone];
            const valueStyles = { blue: 'text-slate-900', green: 'text-emerald-600', purple: 'text-purple-600', indigo: 'text-blue-600' }[tone];
            return (
              <article key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
                    <p className={`mt-2 text-2xl font-bold ${valueStyles}`}>{loading ? '—' : value}</p>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">{helper}</p>
                  </div>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneStyles}`}><Icon className="h-5 w-5" /></span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-slate-900">{pagination.total}</span> entries
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Show
              <select value={pagination.limit} onChange={(event) => handleLimitChange(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 outline-none focus:border-blue-400">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              entries
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[880px] w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50/80">
                <tr>
                  {['USER', 'ROLE', 'STATUS', 'REGISTERED', 'ACTIONS'].map((heading) => <th key={heading} className={`px-4 py-3 text-[11px] font-bold tracking-wide text-slate-500 sm:px-6 ${heading === 'ACTIONS' ? 'text-right' : ''}`}>{heading}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td colSpan={5} className="px-4 py-5 sm:px-6"><div className="h-12 animate-pulse rounded-lg bg-slate-100" /></td>
                  </tr>
                )) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400"><Search className="h-5 w-5" /></div><p className="mt-3 text-sm font-semibold text-slate-700">No users found</p><p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters.</p></td></tr>
                ) : users.map((row) => (
                  <tr key={row._id} onClick={() => navigate(`/admin/users/${row._id}`)} className="group transition hover:bg-blue-50/30">
                    <td className="px-4 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">{row.name?.charAt(0).toUpperCase() || 'U'}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{row.name}</p><p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500"><Mail className="h-3.5 w-3.5 shrink-0" />{row.email}</p></div></div></td>
                    <td className="px-4 py-4 sm:px-6"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.role === 'admin' ? 'bg-purple-50 text-purple-700' : row.role === 'moderator' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{row.role === 'user' ? 'Customer' : row.role.charAt(0).toUpperCase() + row.role.slice(1)}</span></td>
                    <td className="px-4 py-4 sm:px-6"><div className="space-y-1"><span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${row.isActive ? 'text-emerald-600' : 'text-rose-600'}`}><span className={`h-2 w-2 rounded-full ${row.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />{row.isActive ? 'Active' : 'Inactive'}</span><span className={`flex items-center gap-1.5 text-xs ${row.emailVerified ? 'text-slate-500' : 'text-slate-400'}`}><MailCheck className="h-3.5 w-3.5" />{row.emailVerified ? 'Verified' : 'Not verified'}</span></div></td>
                    <td className="px-4 py-4 sm:px-6"><div className="flex items-start gap-2 text-sm text-slate-600"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><p>{formatDate(row.createdAt)}</p><p className="mt-0.5 text-xs text-slate-400">({formatRelative(row.createdAt)})</p></div></div></td>
                    <td className="px-4 py-4 text-right sm:px-6" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-end gap-2"><button onClick={() => navigate(`/admin/users/${row._id}?tab=edit`)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"><Edit2 className="h-3.5 w-3.5" />Edit</button><button onClick={() => navigate(`/admin/users/${row._id}`)} className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 sm:inline-flex"><Eye className="h-3.5 w-3.5" />View</button><div className="relative"><button aria-label={`More actions for ${row.name}`} onClick={() => setMenuOpenId(menuOpenId === row._id ? null : row._id)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><MoreHorizontal className="h-4 w-4" /></button>{menuOpenId === row._id && <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1.5 text-left shadow-xl"><button onClick={() => navigate(`/admin/users/${row._id}`)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:hidden"><Eye className="h-3.5 w-3.5" />View details</button><button onClick={() => handleToggleActive(row)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">{row.isActive ? <UserX className="h-3.5 w-3.5 text-amber-600" /> : <UserCheck className="h-3.5 w-3.5 text-emerald-600" />}{row.isActive ? 'Deactivate' : 'Activate'}</button><button onClick={() => handleDeleteUser(row._id)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" />Delete</button></div>}</div></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-sm text-slate-500">Showing {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries</p><div className="flex items-center justify-end gap-1"><button onClick={() => handlePageChange(pagination.page - 1)} disabled={!pagination.hasPrev} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="grid h-9 min-w-9 place-items-center rounded-lg bg-blue-600 px-2 text-sm font-semibold text-white">{pagination.page}</span><button onClick={() => handlePageChange(pagination.page + 1)} disabled={!pagination.hasNext} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
        </section>
      </div>
    </div>
  );
};

export default AdminUsers;


