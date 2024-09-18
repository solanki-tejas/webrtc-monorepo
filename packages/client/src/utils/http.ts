import axios, { type AxiosResponse, type AxiosRequestConfig } from 'axios'

// You can set a base URL for all requests here
const baseURL = 'http://localhost:8000'

const instance = axios.create({
  baseURL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
instance.interceptors.request.use(
  (config: any) => {
    // You can add authentication headers here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Response interceptor
instance.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    // Handle global errors here (e.g., unauthorized, server errors)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized error
          console.log('Unauthorized')
          break
        case 404:
          // Handle not found error
          console.log('Not Found')
          break
        case 500:
          // Handle server error
          console.log('Server Error')
          break
        default:
          console.log('An error occurred')
      }
    }
    return Promise.reject(error)
  }
)

export default {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return instance.get<T>(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return instance.post<T>(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return instance.put<T>(url, data, config)
  }

  // You can add more methods like delete, patch, etc. as needed
}
