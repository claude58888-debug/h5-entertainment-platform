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

// ==================== FINANCE: Manual Deposit ====================

export const validateManualDeposit = [
  body('member_id')
    .notEmpty().withMessage('Member ID is required')
    .isLength({ min: 1, max: 50 }).withMessage('Member ID must be 1-50 characters')
    .trim(),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('channel')
    .optional()
    .isLength({ max: 50 }).withMessage('Channel must be under 50 characters')
    .trim(),
  body('txhash')
    .optional()
    .isLength({ max: 200 }).withMessage('TxHash must be under 200 characters')
    .trim(),
  body('reason')
    .notEmpty().withMessage('Reason is required')
    .isLength({ min: 1, max: 500 }).withMessage('Reason must be 1-500 characters')
    .trim()
]

// ==================== FINANCE: Batch Withdrawal ====================

export const validateBatchWithdrawal = [
  body('ids')
    .isArray({ min: 1 }).withMessage('At least one withdrawal ID is required'),
  body('action')
    .notEmpty().withMessage('Action is required')
    .isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('reason')
    .optional()
    .isLength({ max: 500 }).withMessage('Reason must be under 500 characters')
    .trim()
]

// ==================== FINANCE: Auto Review Rules ====================

export const validateAutoReviewRule = [
  body('name')
    .notEmpty().withMessage('Rule name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters')
    .trim(),
  body('condition_field')
    .notEmpty().withMessage('Condition field is required')
    .isLength({ min: 1, max: 50 }).withMessage('Condition field must be 1-50 characters')
    .trim(),
  body('operator')
    .notEmpty().withMessage('Operator is required')
    .isIn(['<', '<=', '=', '>=', '>']).withMessage('Invalid operator'),
  body('threshold')
    .notEmpty().withMessage('Threshold is required')
    .isFloat({ min: 0 }).withMessage('Threshold must be non-negative'),
  body('action')
    .notEmpty().withMessage('Action is required')
    .isIn(['auto_approve', 'manual_review', 'auto_reject']).withMessage('Invalid action'),
  body('enabled')
    .optional()
    .isBoolean().withMessage('Enabled must be boolean')
]

// ==================== GAMES: Hot Score ====================

export const validateHotScore = [
  body('hot_score')
    .notEmpty().withMessage('Hot score is required')
    .isInt({ min: 0 }).withMessage('Hot score must be a non-negative integer')
]

// ==================== GAMES: Recommend ====================

export const validateRecommend = [
  body('is_recommended')
    .notEmpty().withMessage('is_recommended is required')
    .isBoolean().withMessage('is_recommended must be boolean'),
  body('recommend_sort')
    .optional()
    .isInt({ min: 0 }).withMessage('Recommend sort must be a non-negative integer')
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

// ==================== MEMBER MANAGEMENT (Phase 11A) ====================

export const validateVipAdjust = [
  body('level')
    .notEmpty().withMessage('VIP level is required')
    .isInt({ min: 0, max: 99 }).withMessage('VIP level must be 0-99'),
  body('reason')
    .optional()
    .isLength({ max: 500 }).withMessage('Reason must be under 500 characters')
    .trim()
]

export const validateTagsUpdate = [
  body('tags')
    .isArray().withMessage('Tags must be an array')
    .custom(tags => tags.length <= 20).withMessage('Maximum 20 tags allowed'),
  body('tags.*')
    .isString().withMessage('Each tag must be a string')
    .isLength({ min: 1, max: 50 }).withMessage('Tag must be 1-50 characters')
    .trim()
]

export const validateBalanceAdjust = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['deposit', 'deduction']).withMessage('Type must be deposit or deduction'),
  body('reason')
    .notEmpty().withMessage('Reason is required')
    .isLength({ min: 1, max: 500 }).withMessage('Reason must be 1-500 characters')
    .trim()
]
