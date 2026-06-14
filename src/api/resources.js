import apiClient from './client'

// Get all resources (with filters)
export const getResources = async (params = {}) => {
  const response = await apiClient.get('/resources', { params })
  return response.data
}

// Get single resource
export const getResource = async (id) => {
  const response = await apiClient.get(`/resources/${id}`)
  return response.data
}
