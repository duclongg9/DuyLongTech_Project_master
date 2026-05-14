// Tất cả hằng số dùng chung trong ứng dụng

export const CONDITION_LABELS = {
  LIKE_NEW_99: 'Like New 99%',
  GOOD_95: 'Đẹp 95%',
  GOOD_90: 'Tốt 90%',
  FAIR_80: 'TB 80%',
  NEW: 'Mới 100%',
}

export const CONDITION_CLASSES = {
  LIKE_NEW_99: 'tag-green',
  GOOD_95: 'tag-green',
  GOOD_90: 'tag-yellow',
  FAIR_80: 'tag-orange',
  NEW: 'tag-blue',
}

export const condLabel = c => CONDITION_LABELS[c] || c
export const condClass = c => CONDITION_CLASSES[c] || 'tag-green'

export const fmt = n => n?.toLocaleString('vi-VN')

export const ROLES = ['ADMIN', 'STAFF', 'SHIPPER', 'CUSTOMER']
