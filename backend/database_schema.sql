-- EduWealth Database Schema (SQLite)
-- Generated from Django Models

-- ====================================
-- Table: interests
-- ====================================
CREATE TABLE interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- Table: users
-- ====================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,  -- UUID
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    budget_amount DECIMAL(10, 2),
    currency VARCHAR(5) DEFAULT 'INR',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT 1,
    is_staff BOOLEAN DEFAULT 0,
    is_superuser BOOLEAN DEFAULT 0
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- ====================================
-- Table: courses
-- ====================================
CREATE TABLE courses (
    id CHAR(36) PRIMARY KEY,  -- UUID
    title VARCHAR(500) NOT NULL,
    provider_name VARCHAR(50) NOT NULL,
    provider_slug VARCHAR(50) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    price DECIMAL(10, 2),
    currency VARCHAR(5),
    rating DECIMAL(3, 2),
    duration VARCHAR(50),
    categories TEXT,  -- JSON
    thumbnail_url VARCHAR(1000),
    description TEXT,
    source_hash VARCHAR(64) UNIQUE NOT NULL,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for courses table
CREATE INDEX courses_provide_3e157d_idx ON courses(provider_slug);
CREATE INDEX courses_price_56bbb6_idx ON courses(price);
CREATE INDEX courses_rating_757d69_idx ON courses(rating);

-- ====================================
-- Table: expenses
-- ====================================
CREATE TABLE expenses (
    id CHAR(36) PRIMARY KEY,  -- UUID
    user_id CHAR(36) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'INR',
    category VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for expenses table
CREATE INDEX expenses_user_id_1a4067_idx ON expenses(user_id);
CREATE INDEX expenses_date_a77b87_idx ON expenses(date);
CREATE INDEX expenses_categor_a6f264_idx ON expenses(category);

-- ====================================
-- Table: refresh_tokens
-- ====================================
CREATE TABLE refresh_tokens (
    id CHAR(36) PRIMARY KEY,  -- UUID
    user_id CHAR(36) NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for refresh_tokens table
CREATE INDEX refresh_tok_user_id_46676d_idx ON refresh_tokens(user_id);
CREATE INDEX refresh_tok_expires_a128d9_idx ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_token ON refresh_tokens(token);

-- ====================================
-- Table: user_interests (Junction Table)
-- ====================================
CREATE TABLE user_interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id CHAR(36) NOT NULL,
    interest_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE,
    UNIQUE(user_id, interest_id)
);

-- Indexes for user_interests table
CREATE INDEX user_intere_user_id_61e710_idx ON user_interests(user_id);
CREATE INDEX user_intere_interes_9d5382_idx ON user_interests(interest_id);

-- ====================================
-- Table: user_saved_courses (Junction Table)
-- ====================================
CREATE TABLE user_saved_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(user_id, course_id)
);

-- Indexes for user_saved_courses table
CREATE INDEX user_saved__user_id_9527ac_idx ON user_saved_courses(user_id);
CREATE INDEX user_saved__course__faca98_idx ON user_saved_courses(course_id);

-- ====================================
-- Database Relationships Summary
-- ====================================
-- 1. users -> expenses (One-to-Many)
-- 2. users -> refresh_tokens (One-to-Many)
-- 3. users <-> interests (Many-to-Many via user_interests)
-- 4. users <-> courses (Many-to-Many via user_saved_courses)
