-- SK7755 Game Aggregator — Bet Records Table
-- Compatible with MySQL 5.7+ / 8.0

CREATE TABLE sk7755_bets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(20) NOT NULL COMMENT 'settle/cancelBet',
  uid VARCHAR(50) NOT NULL,
  acc_type TINYINT DEFAULT 0,
  supplier TINYINT,
  platform VARCHAR(20),
  order_no VARCHAR(100) NOT NULL UNIQUE,
  main_order_no VARCHAR(100),
  bonus_code VARCHAR(100),
  game_type VARCHAR(20),
  game_code VARCHAR(50),
  game_name VARCHAR(100),
  balance_before DECIMAL(18,2),
  balance_after DECIMAL(18,2),
  bet_amount DECIMAL(18,2),
  win_amount DECIMAL(18,2),
  add_amount DECIMAL(18,2),
  sub_amount DECIMAL(18,2),
  bet_time BIGINT,
  settle_time BIGINT,
  currency VARCHAR(10) DEFAULT 'CNY',
  bet_type VARCHAR(20),
  status VARCHAR(20) DEFAULT 'settled' COMMENT 'settled/cancelled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_uid (uid),
  INDEX idx_order_no (order_no),
  INDEX idx_settle_time (settle_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
