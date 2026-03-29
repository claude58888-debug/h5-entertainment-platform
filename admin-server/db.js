import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'admin.db')

const db = new Database(dbPath)

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initDB() {
  db.exec(`
    -- Admin accounts
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      display_name TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Agents
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      domain TEXT,
      contact TEXT,
      balance REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (date('now')),
      members INTEGER DEFAULT 0,
      month_revenue REAL DEFAULT 0,
      share_mode TEXT DEFAULT 'revenue',
      share_rate REAL DEFAULT 40
    );

    -- Members
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      agent TEXT,
      vip INTEGER DEFAULT 0,
      balance REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      registered TEXT NOT NULL DEFAULT (date('now')),
      last_login TEXT,
      total_deposit REAL DEFAULT 0,
      total_withdraw REAL DEFAULT 0,
      tags TEXT DEFAULT '[]'
    );

    -- Deposit orders
    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      member TEXT NOT NULL,
      agent TEXT,
      amount REAL NOT NULL,
      channel TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      time TEXT NOT NULL DEFAULT (datetime('now')),
      tx_hash TEXT DEFAULT ''
    );

    -- Withdrawal orders
    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      member TEXT NOT NULL,
      agent TEXT,
      amount REAL NOT NULL,
      channel TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      time TEXT NOT NULL DEFAULT (datetime('now')),
      address TEXT DEFAULT '',
      risk_level TEXT DEFAULT 'low'
    );

    -- Game providers
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      games INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      api_health REAL DEFAULT 99.0,
      balance REAL DEFAULT 0,
      response_time TEXT DEFAULT '100ms',
      api_key TEXT DEFAULT '',
      api_latency INTEGER DEFAULT 100
    );

    -- Games
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT,
      category TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      rtp REAL DEFAULT 96.0,
      is_hot INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      bets INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0
    );

    -- Betting records
    CREATE TABLE IF NOT EXISTS bets (
      id TEXT PRIMARY KEY,
      member TEXT NOT NULL,
      game TEXT NOT NULL,
      provider TEXT,
      bet_amount REAL NOT NULL,
      win_amount REAL DEFAULT 0,
      time TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT DEFAULT 'settled'
    );

    -- VIP levels
    CREATE TABLE IF NOT EXISTS vip_levels (
      level INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      upgrade_deposit REAL DEFAULT 0,
      upgrade_wager REAL DEFAULT 0,
      monthly_bonus REAL DEFAULT 0,
      birthday_bonus REAL DEFAULT 0,
      withdraw_limit TEXT DEFAULT '50000'
    );

    -- Rakeback config
    CREATE TABLE IF NOT EXISTS rakeback_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_type TEXT NOT NULL,
      rate REAL NOT NULL DEFAULT 0,
      min_bet REAL DEFAULT 0,
      status TEXT DEFAULT 'active'
    );

    -- Rakeback records
    CREATE TABLE IF NOT EXISTS rakeback_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member TEXT NOT NULL,
      game_type TEXT,
      bet_amount REAL DEFAULT 0,
      rakeback_amount REAL DEFAULT 0,
      time TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT DEFAULT 'settled'
    );

    -- Promotions / Activities
    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      start_time TEXT,
      end_time TEXT,
      min_deposit REAL DEFAULT 0,
      bonus_rate REAL DEFAULT 0,
      wagering REAL DEFAULT 0,
      max_bonus REAL DEFAULT 0,
      participants INTEGER DEFAULT 0
    );

    -- Messages (inbox)
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      target TEXT DEFAULT '全部用户',
      target_type TEXT DEFAULT 'all',
      type TEXT DEFAULT 'mail',
      status TEXT DEFAULT 'sent',
      sent_at TEXT NOT NULL DEFAULT (datetime('now')),
      content TEXT DEFAULT ''
    );

    -- System notifications
    CREATE TABLE IF NOT EXISTS system_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      level TEXT DEFAULT 'info',
      content TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Chat sessions
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      subject TEXT,
      status TEXT DEFAULT 'active',
      last_message TEXT DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Risk rules
    CREATE TABLE IF NOT EXISTS risk_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      threshold REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      triggers INTEGER DEFAULT 0
    );

    -- IP blacklist
    CREATE TABLE IF NOT EXISTS ip_blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      reason TEXT,
      added_by TEXT DEFAULT 'admin',
      added_time TEXT NOT NULL DEFAULT (datetime('now')),
      hit_count INTEGER DEFAULT 0
    );

    -- Audit logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operator TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT,
      detail TEXT,
      time TEXT NOT NULL DEFAULT (datetime('now')),
      ip TEXT DEFAULT '10.0.0.1'
    );

    -- Announcements
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      target TEXT DEFAULT '全部代理',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (date('now'))
    );

    -- Payment channels
    CREATE TABLE IF NOT EXISTS payment_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'crypto',
      status TEXT DEFAULT 'active',
      fee REAL DEFAULT 0,
      min_amount REAL DEFAULT 0,
      max_amount REAL DEFAULT 0,
      today_volume REAL DEFAULT 0,
      wallet_count INTEGER DEFAULT 0
    );

    -- Settlement records
    CREATE TABLE IF NOT EXISTS settlements (
      id TEXT PRIMARY KEY,
      agent TEXT NOT NULL,
      month TEXT,
      subordinates INTEGER DEFAULT 0,
      total_bets REAL DEFAULT 0,
      commission_rate REAL DEFAULT 0,
      commission_amount REAL DEFAULT 0,
      upstream_deduction REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      paid_time TEXT DEFAULT ''
    );

    -- Financial summary (daily)
    CREATE TABLE IF NOT EXISTS financial_summary (
      date TEXT PRIMARY KEY,
      deposit REAL DEFAULT 0,
      withdrawal REAL DEFAULT 0,
      bonus REAL DEFAULT 0,
      ggr REAL DEFAULT 0,
      ngr REAL DEFAULT 0
    );

    -- Revenue trend
    CREATE TABLE IF NOT EXISTS revenue_trend (
      date TEXT PRIMARY KEY,
      revenue REAL DEFAULT 0,
      deposit REAL DEFAULT 0,
      withdrawal REAL DEFAULT 0
    );

    -- System settings
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      category TEXT DEFAULT 'global'
    );

    -- Banners
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image TEXT DEFAULT '',
      link TEXT DEFAULT '',
      sort INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      start_time TEXT,
      end_time TEXT
    );

    -- KYC Documents
    CREATE TABLE IF NOT EXISTS kyc_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      document_type TEXT NOT NULL DEFAULT 'id_card',
      document_url TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      reject_reason TEXT DEFAULT '',
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT,
      reviewed_by TEXT
    );

    -- AML Alerts
    CREATE TABLE IF NOT EXISTS aml_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      transaction_id TEXT,
      alert_type TEXT NOT NULL DEFAULT 'large_transaction',
      amount REAL DEFAULT 0,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT,
      resolved_by TEXT
    );

    -- Self Exclusions
    CREATE TABLE IF NOT EXISTS self_exclusions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      exclusion_type TEXT NOT NULL DEFAULT '24h',
      start_date TEXT NOT NULL DEFAULT (datetime('now')),
      end_date TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      reason TEXT DEFAULT ''
    );

    -- User Limits
    CREATE TABLE IF NOT EXISTS user_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      limit_type TEXT NOT NULL DEFAULT 'deposit',
      period TEXT NOT NULL DEFAULT 'daily',
      amount REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Responsible Gaming Settings (admin configurable defaults)
    CREATE TABLE IF NOT EXISTS compliance_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      category TEXT DEFAULT 'responsible_gaming',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- H5 Users (separate auth from admin)
    CREATE TABLE IF NOT EXISTS h5_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT DEFAULT '',
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      member_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login TEXT,
      status TEXT NOT NULL DEFAULT 'active'
    );

    -- H5 Transactions (wallet history for H5 users)
    CREATE TABLE IF NOT EXISTS h5_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      balance_after REAL DEFAULT 0,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'completed',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- H5 Promotion claims
    CREATE TABLE IF NOT EXISTS h5_promotion_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      promotion_id TEXT NOT NULL,
      amount REAL DEFAULT 0,
      claimed_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(member_id, promotion_id)
    );

    -- H5 User messages (inbox for individual users)
    CREATE TABLE IF NOT EXISTS h5_user_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      type TEXT DEFAULT 'system',
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ==================== PERFORMANCE INDEXES ====================

    -- Members: frequently queried by status, agent, username
    CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
    CREATE INDEX IF NOT EXISTS idx_members_agent ON members(agent);
    CREATE INDEX IF NOT EXISTS idx_members_registered ON members(registered);
    CREATE INDEX IF NOT EXISTS idx_members_username ON members(username);

    -- Deposits: queried by status, member, time
    CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
    CREATE INDEX IF NOT EXISTS idx_deposits_member ON deposits(member);
    CREATE INDEX IF NOT EXISTS idx_deposits_time ON deposits(time DESC);

    -- Withdrawals: queried by status, member, time
    CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_member ON withdrawals(member);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_time ON withdrawals(time DESC);

    -- Games: queried by status, category, provider, revenue
    CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
    CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
    CREATE INDEX IF NOT EXISTS idx_games_provider ON games(provider);
    CREATE INDEX IF NOT EXISTS idx_games_revenue ON games(revenue DESC);

    -- Bets: queried by member, game, time
    CREATE INDEX IF NOT EXISTS idx_bets_member ON bets(member);
    CREATE INDEX IF NOT EXISTS idx_bets_game ON bets(game);
    CREATE INDEX IF NOT EXISTS idx_bets_time ON bets(time DESC);

    -- Audit logs: queried by time, operator
    CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(time DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_operator ON audit_logs(operator);

    -- H5 transactions: queried by member_id, type, created_at
    CREATE INDEX IF NOT EXISTS idx_h5_transactions_member ON h5_transactions(member_id);
    CREATE INDEX IF NOT EXISTS idx_h5_transactions_type ON h5_transactions(member_id, type);
    CREATE INDEX IF NOT EXISTS idx_h5_transactions_time ON h5_transactions(created_at DESC);

    -- H5 user messages: queried by member_id, is_read
    CREATE INDEX IF NOT EXISTS idx_h5_messages_member ON h5_user_messages(member_id);
    CREATE INDEX IF NOT EXISTS idx_h5_messages_unread ON h5_user_messages(member_id, is_read);

    -- KYC documents: queried by user_id, status
    CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_documents(user_id);
    CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_documents(status);

    -- AML alerts: queried by status, user_id
    CREATE INDEX IF NOT EXISTS idx_aml_status ON aml_alerts(status);
    CREATE INDEX IF NOT EXISTS idx_aml_user ON aml_alerts(user_id);

    -- Self exclusions: queried by user_id, status
    CREATE INDEX IF NOT EXISTS idx_exclusions_user ON self_exclusions(user_id);
    CREATE INDEX IF NOT EXISTS idx_exclusions_status ON self_exclusions(status);

    -- User limits: queried by user_id
    CREATE INDEX IF NOT EXISTS idx_user_limits_user ON user_limits(user_id);

    -- H5 users: queried by phone, member_id
    CREATE INDEX IF NOT EXISTS idx_h5_users_phone ON h5_users(phone);
    CREATE INDEX IF NOT EXISTS idx_h5_users_member ON h5_users(member_id);

    -- Rakeback records: queried by member
    CREATE INDEX IF NOT EXISTS idx_rakeback_member ON rakeback_records(member);

    -- Promotion claims: queried by member_id
    CREATE INDEX IF NOT EXISTS idx_promo_claims_member ON h5_promotion_claims(member_id);
  `)
}

export default db
