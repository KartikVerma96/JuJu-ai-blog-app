import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Central RTK Query service. All requests send cookies so the httpOnly
// JWT travels with every call (credentials: 'include').
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
  }),
  tagTypes: ['Post', 'Posts', 'User', 'Users', 'Category', 'Stats', 'Comment'],
  endpoints: (builder) => ({
    // ---- Auth ----
    me: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['User', 'Stats'],
    }),
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['User'],
    }),

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
    // Accepts { q, role, page, limit, sortBy, order } and forwards them as the
    // query string. RTK Query caches each unique combination of params, so
    // flipping back to a page you already visited is instant (served from cache).
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

export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
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
