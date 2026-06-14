import apiClient from './client'

// Add/Update rating
export const rateResource = async (resourceId, score) => {
  const response = await apiClient.post(`/ratings/${resourceId}`, { score })
  return response.data
}
