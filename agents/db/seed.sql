-- Demo-insurance seed rows: run if the agents/grounding can't reach the web.
--   docker compose -f ../docker-compose.yml exec -T postgres \
--     psql -U homeheist -d homeheist < db/seed.sql   (from agents/)

insert into institution (institution_id, institution_name, institution_type, institution_link) values
  ('seed-delta-community', 'Delta Community Credit Union', 'credit_union', 'https://www.deltacommunitycu.com'),
  ('seed-georgias-own',    'Georgia''s Own Credit Union',   'credit_union', 'https://www.georgiasown.org'),
  ('seed-georgia-dca',     'Georgia Dream Homeownership Program (DCA)', 'state_hfa', 'https://www.dca.ga.gov'),
  ('seed-renaissance-bank','Renaissance Community Bank',    'community_bank', 'https://example.com')
on conflict (institution_id) do nothing;

insert into loan_product
  (product_id, institution_id, product_name, loan_type, term_months,
   interest_rate, apr, min_credit_score, max_credit_score, product_link) values
  ('seed-lp-1', 'seed-delta-community', '30-Year Fixed Mortgage', 'conventional_30yr', 360, 6.250, 6.380, 680, 850, 'https://www.deltacommunitycu.com'),
  ('seed-lp-2', 'seed-delta-community', '15-Year Fixed Mortgage', 'conventional_15yr', 180, 5.625, 5.790, 680, 850, 'https://www.deltacommunitycu.com'),
  ('seed-lp-3', 'seed-georgias-own',    'First-Time Homebuyer 30yr', 'conventional_30yr', 360, 6.375, 6.510, 640, 850, 'https://www.georgiasown.org'),
  ('seed-lp-4', 'seed-georgia-dca',     'Georgia Dream First Mortgage', 'hfa_30yr', 360, 6.500, 6.620, 640, 850, 'https://www.dca.ga.gov'),
  ('seed-lp-5', 'seed-renaissance-bank','Community 5/6 ARM', 'arm_5_6', 360, 5.875, 6.100, 700, 850, 'https://example.com')
on conflict (product_id) do nothing;
