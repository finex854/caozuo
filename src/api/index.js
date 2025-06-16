import axios from 'axios'

export function getIndexData() {
  return axios({
    url: 'http://localhost:9528/',
    method: 'get'
  })
}