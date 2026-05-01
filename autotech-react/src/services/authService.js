import { post } from './apiClient'

export async function loginRequest(email, password) {
  return post('Auth/login', { email, password })
}