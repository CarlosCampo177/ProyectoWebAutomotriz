import { post } from './apiClient'

export async function loginRequest(identifier, password) {
  return post('Auth/login', { identifier, password })
}

export async function registerRequest(formData) {
  return post('Auth/register', formData)
}