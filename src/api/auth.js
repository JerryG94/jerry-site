import apiClient from './client'

// Register
export const register = async (username, email, password) => {
  const response = await apiClient.post('/auth/register', {
    username,
    email,
    password
  })
  return response.data
}

// Login
export const login = async (username, password) => {
  const response = await apiClient.post('/auth/login', {
    username,
    password
  })
  return response.data
}
