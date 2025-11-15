-- ========================
-- USERS
-- ========================
INSERT INTO users (
  name, email, password_hash, password_reset_token,
  password_reset_expires_at, email_verified, role,
  bio, avatar, is_active, last_login, last_seen_at
) VALUES
  (
    'Alice Admin',
    'alice.admin@dailypolitics.com',
    'hashed-password-alice',        -- dummy hash
    NULL,
    NULL,
    TRUE,
    'admin',
    'Site administrator and political editor.',
    'https://example.com/avatars/alice.png',
    TRUE,
    '2025-11-10 09:00:00+00',
    '2025-11-10 09:05:00+00'
  ),
  (
    'Ed Editor',
    'ed.editor@dailypolitics.com',
    'hashed-password-ed',
    NULL,
    NULL,
    TRUE,
    'editor',
    'Commissioning editor for UK politics.',
    'https://example.com/avatars/ed.png',
    TRUE,
    '2025-11-10 10:00:00+00',
    '2025-11-10 10:10:00+00'
  ),
  (
    'Wendy Writer',
    'wendy.writer@dailypolitics.com',
    'hashed-password-wendy',
    NULL,
    NULL,
    FALSE,
    'author',
    'Political reporter covering Westminster and elections.',
    'https://example.com/avatars/wendy.png',
    TRUE,
    '2025-11-09 18:30:00+00',
    '2025-11-09 18:45:00+00'
  );


-- ========================
-- CATEGORIES
-- (assume ids: 1=UK Politics, 2=World, 3=Opinion)
-- ========================
INSERT INTO categories (
  name, slug, description, parent_id, sort_order, is_active
) VALUES
  (
    'UK Politics',
    'uk-politics',
    'Coverage of Westminster, devolved administrations and UK-wide political stories.',
    NULL,
    1,
    TRUE
  ),
  (
    'World',
    'world',
    'International politics, diplomacy and elections.',
    NULL,
    2,
    TRUE
  ),
  (
    'Opinion',
    'opinion',
    'Columns, editorials and commentary.',
    NULL,
    3,
    TRUE
  );


-- ========================
-- HEADER STYLES
-- (assume ids: 1=Breaking News, 2=Analysis, 3=Feature)
-- ========================
INSERT INTO header_styles (
  slug, name, description,
  background_hex, text_hex, is_active
) VALUES
  (
    'breaking-news',
    'Breaking News',
    'High-priority breaking stories.',
    '#CC0000',
    '#FFFFFF',
    TRUE
  ),
  (
    'analysis',
    'In-depth Analysis',
    'Long-form explainers and analysis.',
    '#003366',
    '#FFFFFF',
    TRUE
  ),
  (
    'feature',
    'Feature Story',
    'Human-interest and magazine-style pieces.',
    '#333333',
    '#FFFFFF',
    TRUE
  );


-- ========================
-- TOPICS
-- (assume ids: 1=NHS, 2=Brexit, 3=Elections, 4=Economy)
-- ========================
INSERT INTO topics (
  name, slug, description, parent_id, is_active
) VALUES
  (
    'NHS',
    'nhs',
    'Health service funding, staffing and reforms.',
    NULL,
    TRUE
  ),
  (
    'Brexit',
    'brexit',
    'Post-Brexit arrangements, trade deals and regulation.',
    NULL,
    TRUE
  ),
  (
    'Elections',
    'elections',
    'Local, national and international election coverage.',
    NULL,
    TRUE
  ),
  (
    'Economy',
    'economy',
    'Budget, growth, inflation and economic policy.',
    NULL,
    TRUE
  );


-- ========================
-- POSTS
-- We rely on SERIAL ids in insertion order: 1..8
-- ========================
INSERT INTO posts (
  slug,
  title,
  excerpt,
  content,
  author_id,
  category_id,
  header_style_id,
  header_color_override,
  is_featured,
  hero_image_url,
  hero_image_alt,
  hero_image_caption,
  hero_image_credit,
  meta_title,
  meta_description,
  comments_enabled,
  status,
  regenerate_static,
  published_at,
  deleted_at
) VALUES
  -- 1. Featured, published, normal (no force regenerate)
  (
    'c874nw4g2zzo',
    'PMQs: Starmer clashes with PM over NHS funding',
    'Keir Starmer confronted the Prime Minister over mounting pressures in the NHS during a tense PMQs session.',
    '<p>In a heated exchange at Prime Minister’s Questions...</p>',
    3,          -- Wendy Writer
    1,          -- UK Politics
    1,          -- breaking-news
    NULL,
    TRUE,
    'https://cdn.dailypolitics.com/images/pmqs-nhs-2025.jpg',
    'Keir Starmer and the Prime Minister at the despatch box',
    'Keir Starmer challenges the Prime Minister during PMQs.',
    'Photo: UK Parliament',
    'PMQs: Starmer vs PM on NHS | DailyPolitics',
    'Keir Starmer pressed the Prime Minister on NHS funding and winter pressures during a combative PMQs.',
    TRUE,
    'published',
    FALSE,
    '2025-11-10 12:00:00+00',
    NULL
  ),

  -- 2. Non-featured, published, regenerate_static = TRUE (force rebuild)
  (
    'k29lp9w77m3e',
    'Chancellor unveils emergency cost-of-living package',
    'The Chancellor announced a short-term package aimed at easing the cost-of-living crisis.',
    '<p>The Treasury has confirmed a new package of measures...</p>',
    3,          -- Wendy Writer
    1,          -- UK Politics
    2,          -- analysis
    NULL,
    FALSE,
    'https://cdn.dailypolitics.com/images/chancellor-cost-of-living.jpg',
    'Chancellor walking outside the Treasury',
    'The Chancellor leaves the Treasury ahead of the announcement.',
    'Photo: PA',
    'Chancellor’s cost-of-living package | DailyPolitics',
    'The government has announced targeted support for households facing rising bills.',
    TRUE,
    'published',
    TRUE,       -- force regenerate
    '2025-11-09 08:30:00+00',
    NULL
  ),

  -- 3. Featured, draft (not yet published), regenerate_static TRUE
  (
    'd83k2p0abx1q',
    'Inside Number 10: How policy is really made',
    'An in-depth look at the real decision-making process inside Downing Street.',
    '<p>Sources inside Number 10 describe...</p>',
    3,          -- Wendy Writer
    3,          -- Opinion
    2,          -- analysis
    NULL,
    TRUE,
    'https://cdn.dailypolitics.com/images/inside-number10.jpg',
    'Number 10 Downing Street at night',
    'A late-night view of Number 10 Downing Street.',
    'Photo: Getty',
    'Inside Number 10: How policy is really made',
    'Exclusive insight into the politics and process behind government decision-making.',
    TRUE,
    'draft',
    TRUE,
    NULL,
    NULL
  ),

  -- 4. Archived piece
  (
    'z1k8mn39f0lh',
    'Exam grading algorithm row revisited',
    'A look back at the exam grading controversy and what has changed since.',
    '<p>Five years on from the exam grading algorithm fallout...</p>',
    2,          -- Ed Editor
    1,          -- UK Politics
    3,          -- feature
    NULL,
    FALSE,
    'https://cdn.dailypolitics.com/images/exam-algorithm.jpg',
    'Students sitting exams',
    'Students sitting exams during the period of the algorithm controversy.',
    'Photo: Alamy',
    'Exam grading algorithm row revisited',
    'What the fallout from the exam grading algorithm tells us about policymaking.',
    FALSE,
    'archived',
    FALSE,
    '2020-08-15 10:00:00+00',
    NULL
  ),

  -- 5. Published but soft-deleted (deleted_at NOT NULL)
  (
    'p0q9mn28x7ty',
    'Pilot scheme for voter ID quietly expanded',
    'New documents reveal the voter ID pilot scheme was expanded without fanfare.',
    '<p>Internal documents suggest the pilot scheme...</p>',
    3,          -- Wendy Writer
    1,          -- UK Politics
    2,          -- analysis
    NULL,
    FALSE,
    'https://cdn.dailypolitics.com/images/voter-id.jpg',
    'Polling station sign',
    'A polling station sign outside a community hall.',
    'Photo: Reuters',
    'Voter ID pilot quietly expanded',
    'Documents raise fresh questions over the rollout of voter ID requirements.',
    TRUE,
    'published',
    FALSE,
    '2025-10-20 09:00:00+00',
    '2025-11-01 00:00:00+00'   -- soft-deleted
  ),

  -- 6. Published, non-featured, regenerate_static FALSE
  (
    'm11bc8s2q9rz',
    'EU leaders meet for emergency migration summit',
    'European leaders gathered in Brussels for an emergency summit on migration.',
    '<p>At an overnight summit in Brussels...</p>',
    3,          -- Wendy Writer
    2,          -- World
    1,          -- breaking-news
    NULL,
    FALSE,
    'https://cdn.dailypolitics.com/images/eu-migration-summit.jpg',
    'Flags outside the European Council building',
    'EU flags outside the European Council in Brussels.',
    'Photo: AFP',
    'EU leaders hold emergency migration summit',
    'European leaders met in Brussels to discuss a new agreement on migration and border management.',
    TRUE,
    'published',
    FALSE,
    '2025-11-08 21:15:00+00',
    NULL
  ),

  -- 7. Draft, non-featured, regenerate_static FALSE
  (
    'x0aa90k2h5lm',
    'Can the NHS winter crisis be avoided?',
    'Experts warn that time is running out to prepare for winter pressures.',
    '<p>Senior health officials told DailyPolitics...</p>',
    3,          -- Wendy Writer
    1,          -- UK Politics
    2,          -- analysis
    NULL,
    FALSE,
    'https://cdn.dailypolitics.com/images/nhs-winter.jpg',
    'Ambulances outside a hospital',
    'Ambulances wait outside an A&E department on a busy winter night.',
    'Photo: AP',
    'Can the NHS winter crisis be avoided?',
    'With winter approaching, ministers face questions over NHS resilience.',
    TRUE,
    'draft',
    FALSE,
    NULL,
    NULL
  ),

  -- 8. Published, featured, regenerate_static TRUE (maybe homepage hero)
  (
    'f71jq9p2c1uv',
    'General election: everything you need to know',
    'Your guide to the upcoming general election, from key battlegrounds to the parties’ main pledges.',
    '<p>The country is heading to the polls...</p>',
    2,          -- Ed Editor
    3,          -- Opinion (or could be UK Politics)
    1,          -- breaking-news (hero style)
    NULL,
    TRUE,
    'https://cdn.dailypolitics.com/images/general-election-guide.jpg',
    'Ballot box at a polling station',
    'A ballot box in a polling station on election day.',
    'Photo: Shutterstock',
    'General election: everything you need to know',
    'A comprehensive guide to the upcoming general election.',
    TRUE,
    'published',
    TRUE,
    '2025-11-11 07:00:00+00',
    NULL
  );


-- ========================
-- POST_TOPICS
-- Use the assumed post ids (1..8) and topic ids (1..4)
-- ========================
INSERT INTO post_topics (post_id, topic_id) VALUES
  -- Post 1: PMQs on NHS funding -> NHS, Economy
  (1, 1),
  (1, 4),

  -- Post 2: Cost-of-living package -> Economy
  (2, 4),

  -- Post 3: Inside Number 10 -> Elections, Economy
  (3, 3),
  (3, 4),

  -- Post 4: Exam grading algorithm -> Elections
  (4, 3),

  -- Post 5: Voter ID pilot -> Elections, Brexit
  (5, 2),
  (5, 3),

  -- Post 6: EU migration summit -> Brexit, World/Economy-ish
  (6, 2),
  (6, 4),

  -- Post 7: NHS winter crisis -> NHS
  (7, 1),

  -- Post 8: General election guide -> Elections
  (8, 3);


-- ========================
-- SETTINGS
-- ========================
INSERT INTO settings (
  setting_key,
  setting_value,
  setting_type,
  description
) VALUES
  (
    'site_name',
    'DailyPolitics',
    'string',
    'The public name of the site.'
  ),
  (
    'site_tagline',
    'Independent analysis and political reporting.',
    'string',
    'Short description or tagline for metadata.'
  ),
  (
    'password_global_salt',
    'changeme-super-secret-salt',
    'string',
    'Global salt / pepper used in password hashing (store real value securely).'
  ),
  (
    'last_build_time',
    '2025-11-10T23:00:00Z',
    'string',
    'Timestamp of the last static site build.'
  );