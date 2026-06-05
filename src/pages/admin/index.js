import Link from 'next/link';
import { FileText, Eye, Users, MessageSquare, CheckCircle, FileEdit, PlusCircle } from 'lucide-react';
import { withAdminLayout } from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import Spinner from '@/components/Spinner';
import { useGetStatsQuery } from '@/store/services/api';
import { formatDate } from '@/lib/format';

function AdminDashboard() {
  const { data, isLoading } = useGetStatsQuery();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  }

  const s = data?.stats || {};
  const recent = data?.recentPosts || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-36-bold text-white">Welcome back 👋</h2>
          <p className="text-14-regular mt-1 text-dark-600">
            Here&apos;s what&apos;s happening across your publication today.
          </p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary">
          <PlusCircle size={18} /> New post
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total posts" value={s.totalPosts ?? 0} icon={FileText} accent="green" hint="All articles in the system" />
        <StatCard label="Published" value={s.published ?? 0} icon={CheckCircle} accent="green" hint="Live on the public site" />
        <StatCard label="Drafts" value={s.drafts ?? 0} icon={FileEdit} accent="yellow" hint="Work in progress" />
        <StatCard label="Total views" value={s.views ?? 0} icon={Eye} accent="blue" hint="Across all posts" />
        <StatCard label="Registered users" value={s.users ?? 0} icon={Users} accent="blue" hint="People who signed up" />
        <StatCard label="Comments" value={s.comments ?? 0} icon={MessageSquare} accent="red" hint="Community engagement" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-dark-500 p-5">
          <h3 className="font-semibold text-white">Recent posts</h3>
          <Link href="/admin/posts" className="text-sm text-green-500 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-dark-500">
          {recent.length === 0 && (
            <p className="p-5 text-sm text-dark-600">No posts yet. Create your first one.</p>
          )}
          {recent.map((p) => (
            <Link
              key={p.id}
              href={`/admin/posts/edit/${p.id}`}
              className="flex items-center justify-between p-5 transition-colors hover:bg-dark-500/20"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{p.title}</p>
                <p className="text-xs text-dark-600">
                  {p.author?.name} · {formatDate(p.createdAt)} · {p._count?.comments ?? 0} comments
                </p>
              </div>
              <span className={p.status === 'PUBLISHED' ? 'badge-green' : 'badge-blue'}>
                {p.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

AdminDashboard.getLayout = withAdminLayout('Dashboard');
export default AdminDashboard;
