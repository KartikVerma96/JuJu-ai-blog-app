/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@juju.com' },
    update: {},
    create: {
      name: 'Kartik Admin',
      email: 'admin@juju.com',
      password: adminPassword,
      role: 'ADMIN',
      bio: 'Editor-in-chief at JuJu.',
    },
  });

  const reader = await prisma.user.upsert({
    where: { email: 'reader@juju.com' },
    update: {},
    create: {
      name: 'Jamie Reader',
      email: 'reader@juju.com',
      password: userPassword,
      role: 'USER',
    },
  });

  const categoryNames = ['Technology', 'Design', 'Productivity', 'Lifestyle'];
  const categories = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    categories[name] = cat;
  }

  const samplePosts = [
    {
      title: 'Building a Full-Stack Blog with Next.js and Prisma',
      category: 'Technology',
      excerpt: 'A practical walkthrough of wiring up Next.js API routes, Prisma and MySQL into a production-ready blog.',
      cover: 'https://picsum.photos/seed/nextjs/1200/600',
      content: `Modern web development has never been more approachable. In this article we explore how to combine Next.js with Prisma to ship a real product.

## Why this stack?

Next.js gives you both the frontend and the backend in a single codebase. Prisma turns your database into a type-safe, ergonomic client. Together they remove a huge amount of boilerplate.

## Setting up the database

We model users, posts and comments. Relations are declared once in the schema and Prisma generates the client for you.

> The best code is the code you never have to write twice.

## Authentication

We store a signed JWT in an httpOnly cookie. This keeps tokens out of JavaScript's reach while remaining easy to use across API routes.

Wrap up: with a clear schema, a few API routes and Redux Toolkit for state, you can build something genuinely useful in an afternoon.`,
    },
    {
      title: 'Designing Dark Interfaces That Don\'t Strain the Eyes',
      category: 'Design',
      excerpt: 'Dark mode is more than inverting colors. Here is how to build a calm, legible dark UI.',
      cover: 'https://picsum.photos/seed/darkui/1200/600',
      content: `Dark interfaces are everywhere, but many of them are harsh and hard to read. Good dark design is about contrast control.

## Avoid pure black

Pure black backgrounds create too much contrast with white text. Use a very dark grey instead — it feels softer and more premium.

## Use accent colors sparingly

A single vivid accent (we use a calm green) draws the eye to the things that matter: primary actions and active states.

## Mind your elevation

Lighter surfaces read as "closer" to the user. Layer your greys to communicate depth without harsh borders.`,
    },
    {
      title: 'The Two-List System for Staying Productive',
      category: 'Productivity',
      excerpt: 'Forget complicated apps. A simple two-list method keeps you focused on what actually matters.',
      cover: 'https://picsum.photos/seed/productivity/1200/600',
      content: `Productivity systems often collapse under their own complexity. The two-list system is deliberately minimal.

## List one: today

No more than five items. If it doesn't fit, it isn't today's problem.

## List two: someday

Everything else lives here. Review it weekly and promote items to "today" as space frees up.

> Constraints create focus.

That's it. The power is in the limit, not the tooling.`,
    },
    {
      title: 'Slow Mornings: A Case for Doing Less Before Noon',
      category: 'Lifestyle',
      excerpt: 'What happens when you stop optimizing your mornings and start enjoying them.',
      cover: 'https://picsum.photos/seed/morning/1200/600',
      content: `Hustle culture sold us the 5am miracle morning. But for many people, slow mornings are the real productivity hack.

## Protect the first hour

No email, no feeds. Let your brain warm up on its own terms.

## Single-task on purpose

Make coffee and just make coffee. The ritual is the point.

A calmer morning sets a calmer tone for the entire day.`,
    },
    {
      title: 'State Management in 2026: When Do You Actually Need Redux?',
      category: 'Technology',
      excerpt: 'Redux Toolkit and RTK Query make state predictable — but not every app needs them. A balanced take.',
      cover: 'https://picsum.photos/seed/redux/1200/600',
      content: `Redux earned a reputation for boilerplate years ago. Redux Toolkit changed that story completely.

## RTK Query handles your server state

Caching, invalidation and loading flags come for free. This alone removes most of the data-fetching code you'd otherwise hand-roll.

## Slices for everything else

UI state like a sidebar toggle or auth status fits neatly into small slices.

## When to skip it

Tiny apps with little shared state are fine with local state and context. Reach for Redux when many distant components care about the same data.`,
    },
  ];

  for (const p of samplePosts) {
    const slug = slugify(p.title);
    await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        title: p.title,
        slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.cover,
        status: 'PUBLISHED',
        views: Math.floor((p.title.length * 7) % 400) + 20,
        authorId: admin.id,
        categoryId: categories[p.category]?.id || null,
      },
    });
  }

  // Add a couple of comments to the first post.
  const first = await prisma.post.findUnique({ where: { slug: slugify(samplePosts[0].title) } });
  if (first) {
    const existing = await prisma.comment.count({ where: { postId: first.id } });
    if (existing === 0) {
      await prisma.comment.createMany({
        data: [
          { content: 'This was exactly what I needed — thanks for the clear walkthrough!', postId: first.id, authorId: reader.id },
          { content: 'Great point about httpOnly cookies. Switched my project over.', postId: first.id, authorId: admin.id },
        ],
      });
    }
  }

  console.log('✅ Seed complete.');
  console.log('   Admin login: admin@juju.com / Admin@123');
  console.log('   User login:  reader@juju.com / User@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
