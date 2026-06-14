import apiClient from './client'

// Get comments for resource
export const getComments = async (resourceId) => {
  const response = await apiClient.get(`/resources/${resourceId}/comments`)
  return response.data
}

// Add comment
export const addComment = async (resourceId, content) => {
  const response = await apiClient.post(`/resources/${resourceId}/comments`, { content })
  return response.data
}
