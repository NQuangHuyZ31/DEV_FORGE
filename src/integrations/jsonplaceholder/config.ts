import type { ApiIntegration } from '@/types/integration'

export const jsonPlaceholderIntegration: ApiIntegration = {
  id: 'jsonplaceholder',
  name: 'JSONPlaceholder API',
  description: 'Free, reliable fake REST API for developers testing HTTP requests and CORS-ready endpoints.',
  baseUrl: 'https://jsonplaceholder.typicode.com',
  docUrl: 'https://jsonplaceholder.typicode.com',
  corsSupported: true,
  tags: ['Testing', 'REST', 'Mock', 'CORS-Ready'],
  endpoints: [
    {
      id: 'get-posts',
      name: 'List Posts',
      description: 'Fetch array of blog posts with pagination/limit query parameter',
      path: '/posts',
      method: 'GET',
      queryParams: [
        { key: '_limit', value: '5', description: 'Limit number of results', required: false },
        { key: '_page', value: '1', description: 'Page number', required: false },
      ],
    },
    {
      id: 'get-post-by-id',
      name: 'Get Single Post',
      description: 'Fetch post details for ID 1',
      path: '/posts/1',
      method: 'GET',
    },
    {
      id: 'get-post-comments',
      name: 'Get Post Comments',
      description: 'Fetch comments associated with Post ID 1',
      path: '/posts/1/comments',
      method: 'GET',
    },
    {
      id: 'create-post',
      name: 'Create Post',
      description: 'Send a JSON payload to simulate creating a new post',
      path: '/posts',
      method: 'POST',
      headers: [{ key: 'Content-Type', value: 'application/json; charset=UTF-8' }],
      bodyTemplate: JSON.stringify(
        {
          title: 'Hello from DevForge',
          body: 'Testing REST API Client integration with JSONPlaceholder',
          userId: 1,
        },
        null,
        2
      ),
    },
    {
      id: 'get-users',
      name: 'List Users',
      description: 'Fetch user profiles including email, website, and company',
      path: '/users',
      method: 'GET',
    },
  ],
}
