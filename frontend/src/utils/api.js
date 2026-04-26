import axios from 'axios'

const backendBaseUrl = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: backendBaseUrl ? `${backendBaseUrl.replace(/\/$/, '')}/api` : '/api',
})

// Add token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('financeUser') || '{}')
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

// Handle 401 - auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('financeUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Transactions
export const getTransactions = (params) => api.get('/transactions', { params })
export const addTransaction = (data) => api.post('/transactions', data)
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data)
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`)
export const syncRecurringTransactions = () => api.post('/transactions/recurring/sync')

// Analytics
export const getSummary = (params) => api.get('/transactions/analytics/summary', { params })
export const getByCategory = (params) => api.get('/transactions/analytics/by-category', { params })
export const getMonthly = () => api.get('/transactions/analytics/monthly')

export default api
