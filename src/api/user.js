import apiClient from './client'

// Get user profile
export const getUserProfile = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`)
  return response.data
}

// Update user profile
export const updateProfile = async (data) => {
  const response = await apiClient.put('/users/profile', data)
  return response.data
}
