import axios, { AxiosError } from 'axios'
import useStore from '@/store/'
import { logger } from '@/utils/logger'

export function createHttp() {
  const http = axios.create({})

  http.interceptors.response.use(undefined, (err) => {
    useStore
      .getState()
      .openAlert(
        err instanceof AxiosError
          ? `HTTP 请求错误，状态码：${err.response?.status ?? '未知'}`
          : `HTTP 请求错误：${err.message}`,
        '错误'
      )
    logger.label('HTTP').error(err)
    return Promise.reject(err)
  })

  return http
}

const http = createHttp()

export default http
