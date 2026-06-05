import Seo from '@/components/Seo';
import { withPublicLayout } from '@/components/PublicLayout';
import { PenLine, Users, Sparkles } from 'lucide-react';

function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="JuJu is a full-stack publishing platform built with Next.js, Prisma, Redux and Tailwind CSS — with complete authentication, role-based authorization and an admin panel."
        path="/about"
      />
      <section className="container-app max-w-3xl py-16">
        <h1 className="text-4xl font-bold text-white sm:text-5xl">About JuJu</h1>
        <p className="mt-5 text-lg leading-relaxed text-dark-700">
          JuJu is a modern publishing platform where writers share long-form articles,
          tutorials and stories. It was built as a full-stack demo using Next.js, Prisma + MySQL,
          Redux Toolkit and Tailwind CSS — with complete authentication, role-based authorization
          and an admin panel.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { icon: PenLine, title: 'Write freely', body: 'A distraction-free authoring experience for admins.' },
            { icon: Users, title: 'Community', body: 'Readers register, comment and join the conversation.' },
            { icon: Sparkles, title: 'Curated', body: 'Posts organised by categories for easy discovery.' },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <f.icon className="text-green-500" size={28} />
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-dark-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

AboutPage.getLayout = withPublicLayout;
export default AboutPage;
