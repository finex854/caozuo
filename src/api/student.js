import request from '@/utils/request'

// 获取所有学生
export function findAll() {
  return request({
    url: '/students',
    method: 'get'
  })
}

// 分页获取学生
export function getPage(pageNum, pageSize, name, classId) {
  return request({
    url: `/students/page`,
    method: 'get',
    params: {
      pageNum,
      pageSize,
      name,
      classId
    }
  })
}

// 添加学生
export function add(student) {
  return request({
    url: '/students',
    method: 'post',
    data: student
  })
}

// 更新学生
export function update(student) {
  return request({
    url: '/students',
    method: 'put',
    data: student
  })
}

// 删除学生
export function deleteById(id) {
  return request({
    url: '/students/' + id,
    method: 'delete'
  })
}

// 根据ID查询学生
export function selectById(id) {
  return request({
    url: '/students/' + id,
    method: 'get'
  })
}

// 根据班级ID查询学生
export function getByClassId(classId) {
  return request({
    url: `/students/class/${classId}`,
    method: 'get'
  })
}

// 根据班级ID分页查询学生
export function getPageByClassId(classId, pageNum, pageSize) {
  return request({
    url: `/students/class/${classId}/page?pageNum=${pageNum}&pageSize=${pageSize}`,
    method: 'get'
  })
} 