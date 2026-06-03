import apiClient from './apiClient'

export const loginRequest = (email, password) => 
  apiClient.post('Auth/login', { email, password })

export const registerRequest = (formData) => 
  apiClient.post('Auth/register', formData)