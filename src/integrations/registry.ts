import type { ApiIntegration } from '@/types/integration'
import { jsonPlaceholderIntegration } from './jsonplaceholder/config'

export const dummyJsonIntegration: ApiIntegration = {
  id: 'dummyjson',
  name: 'DummyJSON API',
  description: 'Rich mock data for products, carts, recipes, and HTTP auth testing.',
  baseUrl: 'https://dummyjson.com',
  docUrl: 'https://dummyjson.com/docs',
  corsSupported: true,
  tags: ['Products', 'Mock', 'Auth', 'CORS-Ready'],
  endpoints: [
    {
      id: 'get-products',
      name: 'Get Products',
      description: 'Fetch list of products with limit and select fields',
      path: '/products',
      method: 'GET',
      queryParams: [
        { key: 'limit', value: '4', description: 'Number of items' },
        { key: 'select', value: 'title,price,category,rating', description: 'Selected fields' },
      ],
    },
    {
      id: 'search-products',
      name: 'Search Products',
      description: 'Search for products matching query keyword',
      path: '/products/search',
      method: 'GET',
      queryParams: [{ key: 'q', value: 'phone', description: 'Search query keyword' }],
    },
    {
      id: 'get-http-status-404',
      name: 'Simulate 404 Not Found',
      description: 'Returns HTTP 404 status to test error handling',
      path: '/http/404/DevForge-Simulated-Error',
      method: 'GET',
    },
  ],
}

export const availableIntegrations: ApiIntegration[] = [
  jsonPlaceholderIntegration,
  dummyJsonIntegration,
]

export function getIntegrationById(id: string): ApiIntegration | undefined {
  return availableIntegrations.find((item) => item.id === id)
}
