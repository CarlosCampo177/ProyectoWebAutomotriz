import apiClient from './apiClient'

export const loginRequest = (identifier, password) => 
  apiClient.post('Auth/login', { identifier, password })

export const registerRequest = (formData) => 
  apiClient.post('Auth/register', formData)