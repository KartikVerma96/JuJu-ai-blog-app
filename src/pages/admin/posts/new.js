import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { withAdminLayout } from '@/components/admin/AdminLayout';
import PostForm from '@/components/admin/PostForm';
import { useCreatePostMutation } from '@/store/services/api';

function NewPostPage() {
  const router = useRouter();
  const [createPost, { isLoading }] = useCreatePostMutation();

  const handleSubmit = async (data) => {
    try {
      const res = await createPost(data).unwrap();
      toast.success(data.status === 'PUBLISHED' ? 'Post published' : 'Draft saved');
      router.push('/admin/posts');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create post');
    }
  };

  return <PostForm mode="create" onSubmit={handleSubmit} submitting={isLoading} />;
}

NewPostPage.getLayout = withAdminLayout('New Post');
export default NewPostPage;
