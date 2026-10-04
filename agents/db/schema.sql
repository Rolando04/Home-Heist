CREATE TABLE IF NOT EXISTS product_user (
  user_id varchar(128) primary key,
  email varchar(128),
  passwordHash varchar(255),
  creation_time time,
  creation_date date
);

CREATE TABLE IF NOT EXISTS loan_search (
  search_id varchar(128) primary key,
  user_id varchar(128),
  user_income float,
  credit_score int,
  property_zip varchar(10),
  property_price float,
  down_payment float,
  loan_amount float,
  creation_time time,
  creation_date date,
  foreign key (user_id) references product_user(user_id)
);

CREATE TABLE IF NOT EXISTS institution (
  institution_id varchar(128) primary key,
  institution_name varchar(128),
  institution_type varchar(255),
  institution_link varchar(255)
);

CREATE TABLE IF NOT EXISTS loan_product (
  product_id varchar(128) primary key,
  institution_id varchar(128),
  product_name varchar(128),
  loan_type varchar(128),
  term_months int,
  interest_rate float,
  apr float,
  min_credit_score int,
  max_credit_score int,
  product_link varchar(255),
  foreign key (institution_id) references institution (institution_id)
);
