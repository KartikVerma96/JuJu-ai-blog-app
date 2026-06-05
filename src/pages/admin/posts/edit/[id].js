import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { withAdminLayout } from '@/components/admin/AdminLayout';
import PostForm from '@/components/admin/PostForm';
import Spinner from '@/components/Spinner';
import { useGetPostByIdQuery, useUpdatePostMutation } from '@/store/services/api';

function EditPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, isError } = useGetPostByIdQuery(id, { skip: !id });
  const [updatePost, { isLoading: saving }] = useUpdatePostMutation();

  if (isLoading || !id) {
    return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  }
  if (isError || !data?.post) {
    return <p className="text-center text-dark-600">Post not found.</p>;
  }

  const handleSubmit = async (form) => {
    try {
      await updatePost({ id: Number(id), ...form }).unwrap();
      toast.success('Post updated');
      router.push('/admin/posts');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update post');
    }
  };

  return <PostForm mode="edit" initial={data.post} onSubmit={handleSubmit} submitting={saving} />;
}

EditPostPage.getLayout = withAdminLayout('Edit Post');
export default EditPostPage;
