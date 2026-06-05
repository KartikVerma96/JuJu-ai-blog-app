import { useState } from 'react';
import toast from 'react-hot-toast';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { withAdminLayout } from '@/components/admin/AdminLayout';
import Spinner from '@/components/Spinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/store/services/api';

function AdminCategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
  const [name, setName] = useState('');
  const [target, setTarget] = useState(null);

  const categories = data?.categories || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory({ name: name.trim() }).unwrap();
      toast.success('Category added');
      setName('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add category');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(target.id).unwrap();
      toast.success('Category deleted');
      setTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Categories</h2>
        <p className="text-sm text-dark-600">Organise posts into topics.</p>
      </div>

      <form onSubmit={handleCreate} className="card flex gap-3 p-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="input"
        />
        <button type="submit" disabled={creating} className="btn-primary whitespace-nowrap">
          {creating ? <Spinner size={16} className="text-dark-200" /> : <Plus size={16} />}
          Add
        </button>
      </form>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size={28} /></div>
        ) : categories.length === 0 ? (
          <p className="p-10 text-center text-sm text-dark-600">No categories yet.</p>
        ) : (
          <div className="divide-y divide-dark-500">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-green-500">
                    <Tag size={16} />
                  </span>
                  <div>
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-dark-600">{c._count?.posts ?? 0} posts · /{c.slug}</p>
                  </div>
                </div>
                <button onClick={() => setTarget(c)} className="rounded-md p-2 text-dark-600 hover:bg-dark-500/40 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!target}
        title="Delete category?"
        message={target ? `“${target.name}” will be removed. Posts will keep their content but lose this category.` : ''}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}

AdminCategoriesPage.getLayout = withAdminLayout('Categories');
export default AdminCategoriesPage;
