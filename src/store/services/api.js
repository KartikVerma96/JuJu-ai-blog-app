import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// RTK Query is the part of Redux Toolkit that handles "server data" for us:
// the posts, users, comments and so on that live in the database. We list our
// endpoints once here and it generates ready-made React hooks
// (useGetPostsQuery, useCreatePostMutation, ...) that do the fetching, the
// loading flags, the caching and the re-fetching for us. So no hand-written
// fetch() + useState + useEffect on every screen.
//
// Note: auth (login / register / logout / me) is intentionally NOT in here.
// It uses plain fetch in src/lib/authApi.js so the login flow is easy to
// follow step by step. This file is only for the rest of the server data.
//
// There are two kinds of endpoints below:
//   query    -> reads data            (GET)               e.g. getPosts
//   mutation -> changes data          (POST / PUT / DELETE) e.g. createPost
//
// How the caching stays fresh, in one idea: each query is labelled with tags
// (providesTags). When a mutation finishes it can mark some tags as stale
// (invalidatesTags), and RTK Query then refetches only the queries that used
// those tags. Example: createPost invalidates 'Posts', so the posts list
// refreshes by itself right after you add a post.
export const api = createApi({
  reducerPath: 'api', // the key this cache lives under inside the store
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    // send cookies with every request, so our httpOnly login cookie tags along
    credentials: 'include',
  }),
  // the full list of cache labels we use on the endpoints below
  tagTypes: ['Post', 'Posts', 'Users', 'Category', 'Stats', 'Comment'],
  endpoints: (builder) => ({
    // ---- Posts (public + admin) ----
    getPosts: builder.query({
      query: (params = {}) => ({ url: '/posts', params }),
      providesTags: ['Posts'],
    }),
    getPostBySlug: builder.query({
      query: (slug) => `/posts/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Post', id: slug }],
    }),
    getPostById: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    createPost: builder.mutation({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: ['Posts', 'Stats'],
    }),
    updatePost: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/posts/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Posts', 'Stats'],
    }),
    deletePost: builder.mutation({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Posts', 'Stats'],
    }),

    // ---- Comments ----
    addComment: builder.mutation({
      query: (body) => ({ url: '/comments', method: 'POST', body }),
      invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.slug }],
    }),
    deleteComment: builder.mutation({
      query: ({ id }) => ({ url: `/comments/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.slug }],
    }),

    // ---- Categories ----
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),

    // ---- Users (admin) ----
    // Takes { q, role, page, limit, sortBy, order } and sends them as the URL
    // query string. RTK Query caches each unique mix of params separately, so
    // going back to a page you already loaded is instant (served from cache).
    getUsers: builder.query({
      query: (params = {}) => ({ url: '/users', params }),
      providesTags: ['Users'],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({ url: `/users/${id}`, method: 'PUT', body: { role } }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),

    // ---- Dashboard stats ----
    getStats: builder.query({
      query: () => '/stats',
      providesTags: ['Stats'],
    }),
  }),
});

// RTK Query generated one hook for every endpoint above. These are what the
// components import and call (the naming is always use + EndpointName + Query
// or Mutation).
export const {
  useGetPostsQuery,
  useGetPostBySlugQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetStatsQuery,
} = api;
