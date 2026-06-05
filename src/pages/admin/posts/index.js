import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Search, PlusCircle, Pencil, Trash2, Eye, ExternalLink } from 'lucide-react';
import { withAdminLayout } from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import Select from '@/components/Select';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/format';
import { useGetPostsQuery, useDeletePostMutation } from '@/store/services/api';

// `createColumnHelper` gives us type-friendly helpers to declare columns.
// `accessor('field', ...)` reads row.field; `display(...)` is for columns with
// no underlying field (like an Actions button column).
const columnHelper = createColumnHelper();

function AdminPostsPage() {
  // --- Local UI state (React `useState`) -----------------------------------
  // Search box text + a debounced copy (so we don't hit the API on each keystroke).
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');

  // TanStack pagination state. NOTE: pageIndex is ZERO-based (page 1 = index 0).
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  // TanStack sorting state: an array like [{ id: 'createdAt', desc: true }].
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);

  // The post the user is about to delete (drives the confirm dialog).
  const [target, setTarget] = useState(null);

  // Debounce the search input by 350ms.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t); // cleanup cancels the previous timer
  }, [search]);

  // Whenever the filters or sort change, jump back to the first page —
  // otherwise you could be stranded on "page 5" of a 2-page result.
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debounced, status, sorting]);

  // --- Server-side data (Redux Toolkit Query) -------------------------------
  // We translate our table state into API query params. The SERVER does the
  // filtering/sorting/paginating and returns just one page.
  const sort = sorting[0];
  const { data, isFetching } = useGetPostsQuery({
    all: 'true', // admin view: include drafts
    q: debounced || undefined,
    status: status || undefined,
    page: pagination.pageIndex + 1, // server is 1-based
    limit: pagination.pageSize,
    sortBy: sort?.id,
    order: sort?.desc ? 'desc' : 'asc',
  });

  const posts = data?.posts || [];
  const pageCount = data?.pagination?.pages ?? 0;
  const total = data?.pagination?.total ?? 0;

  // A mutation hook to delete a post (see ConfirmDialog below).
  const [deletePost, { isLoading: deleting }] = useDeletePostMutation();

  const confirmDelete = async () => {
    try {
      await deletePost(target.id).unwrap();
      toast.success('Post deleted');
      setTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete');
    }
  };

  // --- Column definitions ---------------------------------------------------
  // useMemo keeps the same columns array between renders (TanStack prefers a
  // stable reference). Each `cell` receives info.getValue() (the field value)
  // and info.row.original (the whole post object).
  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div className="max-w-xs">
            <p className="truncate font-medium text-white">{info.getValue()}</p>
            <p className="truncate text-xs text-dark-600">{info.row.original.excerpt}</p>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'category',
        header: 'Category',
        enableSorting: false, // can't sort by a joined relation here
        cell: (info) => <span className="text-dark-700">{info.row.original.category?.name || '—'}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <span className={info.getValue() === 'PUBLISHED' ? 'badge-green' : 'badge-yellow'}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('views', {
        header: 'Views',
        cell: (info) => (
          <span className="flex items-center gap-1 text-dark-700">
            <Eye size={14} /> {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: (info) => <span className="text-dark-700">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="block w-full text-right">Actions</span>,
        cell: (info) => {
          const p = info.row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {p.status === 'PUBLISHED' && (
                <Link href={`/posts/${p.slug}`} target="_blank" className="icon-btn hover:text-light-200" title="View">
                  <ExternalLink size={16} />
                </Link>
              )}
              <Link href={`/admin/posts/edit/${p.id}`} className="icon-btn hover:text-green-500" title="Edit">
                <Pencil size={16} />
              </Link>
              <button onClick={() => setTarget(p)} className="icon-btn hover:text-red-500" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-28-bold text-white">Posts</h2>
          <p className="text-14-regular text-dark-600">Create, edit and manage all articles.</p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary">
          <PlusCircle size={18} /> New post
        </Link>
      </div>

      {/* Filters: typing or changing status updates state, which re-runs the
          API query above. The table itself stays "dumb" — it only displays. */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-dark-500 bg-dark-400 px-3 focus-within:border-green-500">
          <Search size={16} className="text-dark-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-dark-600"
          />
        </div>
        <Select
          value={status}
          onChange={setStatus}
          className="w-full sm:w-44"
          options={[
            { value: '', label: 'All status' },
            { value: 'PUBLISHED', label: 'Published' },
            { value: 'DRAFT', label: 'Draft' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={posts}
        pageCount={pageCount}
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isFetching}
        emptyMessage="No posts match your filters."
      />

      <ConfirmDialog
        open={!!target}
        title="Delete post?"
        message={target ? `“${target.title}” will be permanently removed.` : ''}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}

// getLayout wraps this page in the admin shell (sidebar + header + auth guard).
AdminPostsPage.getLayout = withAdminLayout('Posts');
export default AdminPostsPage;
