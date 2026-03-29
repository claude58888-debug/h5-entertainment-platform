import { body, validationResult } from 'express-validator'

// Generic validation error handler
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    })
  }
  next()
}

// Sanitize helper - trim and escape
const sanitize = (field) => body(field).trim().escape()

// ==================== AUTH ====================

export const validateAdminLogin = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 2, max: 50 }).withMessage('Username must be 2-50 characters')
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 1, max: 128 }).withMessage('Password must be 1-128 characters')
]

// ==================== MEMBERS ====================

export const validateCreateMember = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 2, max: 50 }).withMessage('Username must be 2-50 characters')
    .trim(),
  body('vip')
    .optional()
    .isInt({ min: 0, max: 99 }).withMessage('VIP level must be 0-99'),
  body('balance')
    .optional()
    .isFloat({ min: 0 }).withMessage('Balance must be non-negative'),
  body('status')
    .optional()
    .isIn(['active', 'frozen', 'inactive']).withMessage('Invalid status')
]

// ==================== AGENTS ====================

export const validateCreateAgent = [
  body('brand')
    .notEmpty().withMessage('Brand is required')
    .isLength({ min: 1, max: 100 }).withMessage('Brand must be 1-100 characters')
    .trim(),
  body('domain')
    .optional()
    .isLength({ max: 200 }).withMessage('Domain must be under 200 characters')
    .trim(),
  body('contact')
    .optional()
    .isLength({ max: 100 }).withMessage('Contact must be under 100 characters')
    .trim(),
  body('balance')
    .optional()
    .isFloat({ min: 0 }).withMessage('Balance must be non-negative'),
  body('shareRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Share rate must be 0-100')
]

export const validateUpdateAgent = [
  body('brand')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('Brand must be 1-100 characters')
    .trim(),
  body('domain')
    .optional()
    .isLength({ max: 200 }).withMessage('Domain must be under 200 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'frozen']).withMessage('Invalid status'),
  body('shareRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Share rate must be 0-100')
]

// ==================== GAMES ====================

export const validateCreateGame = [
  body('name')
    .notEmpty().withMessage('Game name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters')
    .trim(),
  body('provider')
    .optional()
    .isLength({ max: 50 }).withMessage('Provider must be under 50 characters')
    .trim(),
  body('category')
    .optional()
    .isLength({ max: 50 }).withMessage('Category must be under 50 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance']).withMessage('Invalid status'),
  body('rtp')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('RTP must be 0-100')
]

export const validateUpdateGame = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance']).withMessage('Invalid status'),
  body('rtp')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('RTP must be 0-100')
]

// ==================== ADMINS ====================

export const validateCreateAdmin = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 2, max: 50 }).withMessage('Username must be 2-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
  body('role')
    .optional()
    .isIn(['superadmin', 'admin', 'finance', 'cs', 'risk']).withMessage('Invalid role'),
  body('displayName')
    .optional()
    .isLength({ max: 50 }).withMessage('Display name must be under 50 characters')
    .trim()
]

// ==================== PROVIDERS ====================

export const validateCreateProvider = [
  body('id')
    .notEmpty().withMessage('Provider ID is required')
    .isLength({ min: 1, max: 20 }).withMessage('ID must be 1-20 characters')
    .trim(),
  body('name')
    .notEmpty().withMessage('Provider name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters')
    .trim(),
  body('category')
    .optional()
    .isLength({ max: 50 }).withMessage('Category must be under 50 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance']).withMessage('Invalid status')
]

// ==================== ACTIVITIES / PROMOTIONS ====================

export const validateCreateActivity = [
  body('name')
    .notEmpty().withMessage('Activity name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters')
    .trim(),
  body('type')
    .optional()
    .isLength({ max: 50 }).withMessage('Type must be under 50 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'expired']).withMessage('Invalid status'),
  body('minDeposit')
    .optional()
    .isFloat({ min: 0 }).withMessage('Min deposit must be non-negative'),
  body('bonusRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Bonus rate must be 0-100'),
  body('maxBonus')
    .optional()
    .isFloat({ min: 0 }).withMessage('Max bonus must be non-negative')
]

export const validateUpdateActivity = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'expired']).withMessage('Invalid status'),
  body('minDeposit')
    .optional()
    .isFloat({ min: 0 }).withMessage('Min deposit must be non-negative'),
  body('bonusRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Bonus rate must be 0-100')
]

// ==================== MESSAGES ====================

export const validateCreateMessage = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters')
    .trim(),
  body('content')
    .optional()
    .isLength({ max: 5000 }).withMessage('Content must be under 5000 characters'),
  body('type')
    .optional()
    .isIn(['mail', 'sms', 'push', 'system']).withMessage('Invalid message type')
]

// ==================== ANNOUNCEMENTS ====================

export const validateCreateAnnouncement = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters')
    .trim(),
  body('content')
    .optional()
    .isLength({ max: 5000 }).withMessage('Content must be under 5000 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Invalid status')
]

// ==================== RISK ====================

export const validateCreateRiskRule = [
  body('name')
    .notEmpty().withMessage('Rule name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
  body('threshold')
    .optional()
    .isFloat({ min: 0 }).withMessage('Threshold must be non-negative'),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Invalid status')
]

export const validateAddBlacklistIP = [
  body('ip')
    .notEmpty().withMessage('IP address is required')
    .matches(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/).withMessage('Invalid IP address format'),
  body('reason')
    .optional()
    .isLength({ max: 500 }).withMessage('Reason must be under 500 characters')
    .trim()
]

// ==================== VIP LEVELS ====================

export const validateUpdateVipLevel = [
  body('minPoints')
    .optional()
    .isInt({ min: 0 }).withMessage('Min points must be non-negative'),
  body('benefitsJson')
    .optional()
    .isLength({ max: 2000 }).withMessage('Benefits JSON must be under 2000 characters'),
  body('rakebackBonus')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Rakeback bonus must be 0-100'),
  body('monthlyReview')
    .optional()
    .isIn(['true', 'false', true, false]).withMessage('Monthly review must be boolean'),
  body('quarterlyReview')
    .optional()
    .isIn(['true', 'false', true, false]).withMessage('Quarterly review must be boolean')
]

// ==================== RAKEBACK CONFIG ====================

export const validateUpdateRakebackConfig = [
  body('houseEdgeMin')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('House edge min must be 0-100'),
  body('houseEdgeMax')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('House edge max must be 0-100'),
  body('defaultEdge')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Default edge must be 0-100'),
  body('minBet')
    .optional()
    .isFloat({ min: 0 }).withMessage('Min bet must be non-negative'),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Invalid status')
]

// ==================== AGENT SETTLEMENTS ====================

export const validateCalculateSettlement = [
  body('agentId')
    .notEmpty().withMessage('Agent ID is required')
    .trim(),
  body('agentName')
    .optional()
    .isLength({ max: 100 }).withMessage('Agent name must be under 100 characters')
    .trim(),
  body('periodStart')
    .notEmpty().withMessage('Period start is required'),
  body('periodEnd')
    .notEmpty().withMessage('Period end is required'),
  body('totalRevenue')
    .notEmpty().withMessage('Total revenue is required')
    .isFloat({ min: 0 }).withMessage('Total revenue must be non-negative'),
  body('memberCount')
    .notEmpty().withMessage('Member count is required')
    .isInt({ min: 0 }).withMessage('Member count must be non-negative')
]

// ==================== SYSTEM PERMISSIONS ====================

export const validateUpdatePermissions = [
  body('permissions')
    .isArray({ min: 1 }).withMessage('Permissions array is required'),
  body('permissions.*.module')
    .notEmpty().withMessage('Module name is required')
    .trim(),
  body('permissions.*.canView')
    .isBoolean().withMessage('canView must be boolean'),
  body('permissions.*.canCreate')
    .isBoolean().withMessage('canCreate must be boolean'),
  body('permissions.*.canEdit')
    .isBoolean().withMessage('canEdit must be boolean'),
  body('permissions.*.canDelete')
    .isBoolean().withMessage('canDelete must be boolean')
]
