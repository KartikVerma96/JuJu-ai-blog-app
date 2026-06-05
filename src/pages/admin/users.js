import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Shield, ShieldOff, Trash2, Search } from 'lucide-react';
import { withAdminLayout } from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import Select from '@/components/Select';
import Avatar from '@/components/Avatar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/format';
import { selectUser } from '@/store/slices/authSlice';
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from '@/store/services/api';

const columnHelper = createColumnHelper();

function AdminUsersPage() {
  // The currently logged-in admin (from the Redux auth slice) — used so an
  // admin can't delete or demote their own account.
  const me = useSelector(selectUser);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [role, setRole] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);
  const [target, setTarget] = useState(null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page when filters/sort change.
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debounced, role, sorting]);

  // Server-side query — the DB filters/sorts/paginates.
  const sort = sorting[0];
  const { data, isFetching } = useGetUsersQuery({
    q: debounced || undefined,
    role: role || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sort?.id,
    order: sort?.desc ? 'desc' : 'asc',
  });

  const users = data?.users || [];
  const pageCount = data?.pagination?.pages ?? 0;
  const total = data?.pagination?.total ?? 0;

  // Mutations: change a user's role, or delete them. After they succeed, RTK
  // Query auto-refetches the list because of the invalidatesTags: ['Users'].
  const [updateRole] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const toggleRole = async (u) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await updateRole({ id: u.id, role: newRole }).unwrap();
      toast.success(`${u.name} is now ${newRole === 'ADMIN' ? 'an admin' : 'a user'}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update role');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(target.id).unwrap();
      toast.success('User deleted');
      setTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete');
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'User',
        cell: (info) => {
          const u = info.row.original;
          const isSelf = u.id === me?.id;
          return (
            <div className="flex items-center gap-3">
              <Avatar name={u.name} src={u.avatar} size={36} />
              <div>
                <p className="font-medium text-white">
                  {u.name} {isSelf && <span className="text-xs text-green-500">(you)</span>}
                </p>
                <p className="text-xs text-dark-600">{u.email}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => (
          <span className={info.getValue() === 'ADMIN' ? 'badge-green' : 'badge-blue'}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'posts',
        header: 'Posts',
        enableSorting: false,
        cell: (info) => <span className="text-dark-700">{info.row.original._count?.posts ?? 0}</span>,
      }),
      columnHelper.display({
        id: 'comments',
        header: 'Comments',
        enableSorting: false,
        cell: (info) => <span className="text-dark-700">{info.row.original._count?.comments ?? 0}</span>,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Joined',
        cell: (info) => <span className="text-dark-700">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="block w-full text-right">Actions</span>,
        cell: (info) => {
          const u = info.row.original;
          const isSelf = u.id === me?.id;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => toggleRole(u)}
                disabled={isSelf}
                className="icon-btn hover:text-green-500 disabled:opacity-30"
                title={u.role === 'ADMIN' ? 'Demote to user' : 'Promote to admin'}
              >
                {u.role === 'ADMIN' ? <ShieldOff size={16} /> : <Shield size={16} />}
              </button>
              <button
                onClick={() => setTarget(u)}
                disabled={isSelf}
                className="icon-btn hover:text-red-500 disabled:opacity-30"
                title="Delete user"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      }),
    ],
    // Recreate columns if the logged-in user changes (for the "(you)" check).
    [me?.id]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-28-bold text-white">Users</h2>
        <p className="text-14-regular text-dark-600">Manage accounts and roles.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-dark-500 bg-dark-400 px-3 focus-within:border-green-500">
          <Search size={16} className="text-dark-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-dark-600"
          />
        </div>
        <Select
          value={role}
          onChange={setRole}
          className="w-full sm:w-40"
          options={[
            { value: '', label: 'All roles' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'USER', label: 'User' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        pageCount={pageCount}
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isFetching}
        emptyMessage="No users match your filters."
      />

      <ConfirmDialog
        open={!!target}
        title="Delete user?"
        message={target ? `${target.name}'s account, posts and comments will be permanently removed.` : ''}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}

AdminUsersPage.getLayout = withAdminLayout('Users');
export default AdminUsersPage;
