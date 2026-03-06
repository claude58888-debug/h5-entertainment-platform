import request from '@/utils/request'

export function getProfileApi() {
  return request.get('/user/profile')
}

export function updateProfileApi(data) {
  return request.put('/user/profile', data)
}

export function getIncomeApi(params) {
  return request.get('/user/income', { params })
}

export function getInviteInfoApi() {
  return request.get('/user/invite')
}

export function getTasksApi() {
  return request.get('/user/tasks')
}

export function claimTaskApi(taskId) {
  return request.post(`/user/tasks/${taskId}/claim`)
}
