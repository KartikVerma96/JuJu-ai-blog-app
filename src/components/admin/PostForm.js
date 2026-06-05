import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Spinner from '../Spinner';
import Select from '../Select';
import { useGetCategoriesQuery } from '@/store/services/api';

const empty = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  status: 'DRAFT',
  categoryId: '',
};

export default function PostForm({ initial, onSubmit, submitting, mode = 'create' }) {
  const router = useRouter();
  const { data: catData } = useGetCategoriesQuery();
  const categories = catData?.categories || [];
  const [form, setForm] = useState({ ...empty, ...sanitize(initial) });
  const [preview, setPreview] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (status) => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast.error('Title, excerpt and content are required');
      return;
    }
    await onSubmit({ ...form, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/posts" className="inline-flex items-center gap-2 text-sm text-dark-600 hover:text-green-500">
          <ArrowLeft size={16} /> Back to posts
        </Link>
        <div className="flex gap-2">
          <button onClick={() => setPreview((v) => !v)} className="btn-outline">
            <Eye size={16} /> {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={() => handleSubmit('DRAFT')} disabled={submitting} className="btn-outline">
            Save draft
          </button>
          <button onClick={() => handleSubmit('PUBLISHED')} disabled={submitting} className="btn-primary">
            {submitting ? <Spinner size={16} className="text-dark-200" /> : <Save size={16} />}
            {mode === 'create' ? 'Publish' : 'Update'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {preview ? (
            <div className="card p-6">
              <h1 className="text-3xl font-bold text-white">{form.title || 'Untitled'}</h1>
              <p className="mt-3 text-dark-700">{form.excerpt}</p>
              <div className="prose-content mt-6 whitespace-pre-wrap">{form.content}</div>
            </div>
          ) : (
            <>
              <div className="card p-5">
                <label className="label">Title</label>
                <input value={form.title} onChange={set('title')} placeholder="An attention-grabbing headline" className="input" />
              </div>
              <div className="card p-5">
                <label className="label">Excerpt</label>
                <textarea value={form.excerpt} onChange={set('excerpt')} rows={2} placeholder="A short summary shown on cards and previews" className="input resize-none" />
              </div>
              <div className="card p-5">
                <label className="label">Content</label>
                <textarea value={form.content} onChange={set('content')} rows={16} placeholder={'Write your article here...\n\nUse blank lines between paragraphs.\n## for a heading\n> for a quote'} className="input resize-y font-mono text-sm leading-relaxed" />
                <p className="mt-2 text-xs text-dark-600">
                  Tip: blank line = new paragraph, <code>## </code> = heading, <code>&gt; </code> = quote.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <label className="label">Status</label>
            <span className={form.status === 'PUBLISHED' ? 'badge-green' : 'badge-blue'}>{form.status}</span>
          </div>
          <div className="card p-5">
            <label className="label">Category</label>
            <Select
              value={form.categoryId || ''}
              onChange={(v) => setForm({ ...form, categoryId: v })}
              placeholder="— None —"
              options={[
                { value: '', label: '— None —' },
                ...categories.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />
          </div>
          <div className="card p-5">
            <label className="label">Cover image URL</label>
            <input value={form.coverImage} onChange={set('coverImage')} placeholder="https://..." className="input" />
            {form.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImage} alt="cover preview" className="mt-3 h-32 w-full rounded-lg object-cover" />
            )}
            <p className="mt-2 text-xs text-dark-600">Leave blank to auto-generate a placeholder.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function sanitize(initial) {
  if (!initial) return {};
  return {
    title: initial.title || '',
    excerpt: initial.excerpt || '',
    content: initial.content || '',
    coverImage: initial.coverImage || '',
    status: initial.status || 'DRAFT',
    categoryId: initial.categoryId ? String(initial.categoryId) : '',
  };
}
