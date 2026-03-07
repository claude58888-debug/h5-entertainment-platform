import request from '@/utils/request'

export function getBannersApi() {
  return request.get('/app/banners')
}

export function getAnnouncementsApi() {
  return request.get('/app/announcements')
}

export function getAppConfigApi() {
  return request.get('/app/config')
}

export function getSupportInfoApi() {
  return request.get('/app/support')
}
