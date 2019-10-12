// import { message } from 'ant-design-vue'
import * as R from 'ramda'
import ERROR_INFO from '@/constants/error'

export const getErrorBody = data => {
  if (R.is(String, data)) {
    try {
      return JSON.parse(data)
    } catch (err) {
      return { code: 500, details: data }
    }
  }
  if (!data.code || !data.details) {
    return { code: 500, details: `${data}` }
  }
  return data
}

const replaceErrorMessage = (obj, arr) => {
  const { message = '', fields = [] } = obj
  return message.replace(/\{(\w+)\}/g, (all, $1) => {
    if (fields[arr[$1]]) {
      return fields[arr[$1]]
    }
    return arr[$1]
  })
}

// 获取http请求报错信息
export const getHttpErrorMessage = err => {
  if (!err.response || !err.response.data) return
  const errorData = err.response.data
  const errorBody = getErrorBody(errorData)
  if (!errorBody.class) return
  // 默认为错误的元信息
  let ret = errorBody.details
  // 查到对应的class翻译信息
  const errorInfo = ERROR_INFO[errorBody.class]
  if (errorInfo) {
    if (errorBody.data) {
      const { id = '', fields = [] } = errorBody.data
      // 查到对应class的details翻译信息
      const errorInfoDetails = errorInfo['details'] || {}
      const detail = errorInfoDetails[id]
      if (detail) {
        ret = `${replaceErrorMessage(detail['zh-CN'], fields)}`
      }
    }
  }
  return {
    class: errorInfo['zh-CN'],
    detail: ret,
    resource: err.response.data,
  }
}

// 获取http请求信息
export const getHttpReqMessage = error => {
  const { headers, method, params, data, url } = error.config
  const req = {
    method,
    url,
    headers,
  }
  if (data) req.data = R.is(String, data) ? JSON.parse(data) : data
  if (params) req.params = R.is(String, params) ? JSON.parse(params) : params
  return req
}