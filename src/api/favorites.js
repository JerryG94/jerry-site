import apiClient from './client'

// Get user favorites
export const getFavorites = async () => {
  const response = await apiClient.get('/favorites')
  return response.data
}

// Add to favorites
export const addFavorite = async (resourceId) => {
  const response = await apiClient.post(`/favorites/${resourceId}`)
  return response.data
}

// Remove from favorites
export const removeFavorite = async (resourceId) => {
  const response = await apiClient.delete(`/favorites/${resourceId}`)
  return response.data
}
