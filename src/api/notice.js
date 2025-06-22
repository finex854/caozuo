import request from '@/utils/request'

export function selectById(id) {
    return request({
      url: '/articles/' + id,
      method: 'get'
    })
  }

export function add(articles) {
  return request({
    url: '/articles',
    method: 'post',
    data: articles
  })
}

export function update(articles) {
  return request({
    url: '/articles',
    method: 'put',
    data: articles
  })
}

export function deleteById(id) {
  return request({
    url: '/articles/' + id,
    method: 'delete'
  })
}

export function setTop(id) {
  return request({
    url: '/articles/' + id + '/top',
    method: 'put'
  })
}

export function page(author, title, page, pageSize) {
  return request({
    url: '/articles?author=' + author + '&title=' + title + '&page=' + page + '&pageSize=' + pageSize,
    method: 'get'
  })
}
