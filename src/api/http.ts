import axios from 'axios'
import { httpLogger } from '@/utils/logger'

export function createHttp() {
  const http = axios.create({})

  http.interceptors.response.use(undefined, (err) => {
    httpLogger.error(err)
    return Promise.reject(err)
  })

  return http
}

const http = createHttp()

export default http
