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
  presentation_style_id,
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

  INSERT INTO posts (
  slug, title, excerpt, content,
  author_id, category_id, presentation_style_id,
  header_color_override, is_featured,
  hero_image_url, hero_image_alt, hero_image_caption, hero_image_credit,
  meta_title, meta_description,
  comments_enabled, status,
  regenerate_static, published_at, deleted_at
) VALUES
-- 9. Published, UK Politics, non-featured
(
  'gj2n91q0b7pt',
  'Cabinet meets to discuss rising energy prices',
  'Senior ministers gathered this morning to discuss soaring winter energy costs.',
  '<p>The cabinet convened at 8am to address energy price volatility...</p>',
  1, 1, 2,
  NULL, FALSE,
  'https://cdn.dailypolitics.com/images/cabinet-energy.jpg',
  'Downing Street cabinet entrance',
  'Ministers arrive for an early morning cabinet meeting.',
  'Photo: PA',
  'Cabinet meets on rising energy prices',
  'Cabinet ministers held an urgent meeting on surging winter energy prices.',
  TRUE, 'published',
  FALSE, '2025-11-10 06:30:00+00', NULL
),

-- 10. Published, World, featured
(
  'n9qp0m3s4fuw',
  'US and China agree to resume climate cooperation',
  'The two superpowers announced a surprise deal to resume climate talks.',
  '<p>In a joint statement released from Beijing...</p>',
  2, 2, 1,
  NULL, TRUE,
  'https://cdn.dailypolitics.com/images/us-china-climate.jpg',
  'Flags of US and China',
  'US and Chinese diplomats shake hands after the announcement.',
  'Photo: Reuters',
  'US–China climate deal',
  'The US and China have agreed to cooperate again on climate strategy.',
  TRUE, 'published',
  TRUE, '2025-11-09 14:45:00+00', NULL
),

-- 11. Published, Opinion, non-featured
(
  'q2b9v0k5l1as',
  'Why voter apathy is higher than ever',
  'Despite major national issues, voter turnout projections continue to fall.',
  '<p>Several factors contribute to declining engagement...</p>',
  3, 3, 2,
  NULL, FALSE,
  'https://cdn.dailypolitics.com/images/voter-apathy.jpg',
  'Empty polling station',
  'An empty polling station moments after opening.',
  'Photo: Getty',
  'Why voter apathy is rising',
  'A look at the social and political forces driving voter disengagement.',
  TRUE, 'published',
  FALSE, '2025-11-07 11:20:00+00', NULL
),

-- 12. Published, World, non-featured
(
  't9rk2o1x6vpl',
  'UN warns of growing humanitarian crisis in Sudan',
  'The UN has issued a new alert over worsening conditions in Sudan.',
  '<p>Humanitarian agencies are struggling to deliver aid...</p>',
  3, 2, 3,
  NULL, FALSE,
  'https://cdn.dailypolitics.com/images/un-sudan.jpg',
  'UN convoy delivering aid',
  'UN trucks attempt to deliver supplies in conflict zones.',
  'Photo: UN',
  'UN warns of worsening crisis in Sudan',
  'The humanitarian situation in Sudan continues to deteriorate, warns UN.',
  TRUE, 'published',
  FALSE, '2025-11-08 13:10:00+00', NULL
),

-- 13. Published, UK Politics, featured
(
  'w7mz3d1e4kvu',
  'Government announces rail reform package',
  'A major overhaul of the rail network has been unveiled.',
  '<p>The new plan will merge existing operators into a single structure...</p>',
  1, 1, 1,
  NULL, TRUE,
  'https://cdn.dailypolitics.com/images/rail-reform.jpg',
  'Train arriving at station',
  'A commuter train arrives in London during the morning rush.',
  'Photo: Alamy',
  'Rail reform announced',
  'Government unveils major rail reform restructuring the network.',
  TRUE, 'published',
  TRUE, '2025-11-10 16:00:00+00', NULL
),

-- 14. Published, Opinion, non-featured
(
  'l4tcb8z0k2mx',
  'Are political adverts becoming too persuasive?',
  'New research suggests targeted ads may shape elections more than ever.',
  '<p>Political campaigns increasingly rely on micro-targeting...</p>',
  2, 3, 2,
  NULL, FALSE,
  'https://cdn.dailypolitics.com/images/political-ads.jpg',
  'Digital advert targeting interface',
  'A behind-the-scenes look at modern political advertising.',
  'Photo: Shutterstock',
  'Persuasion in political advertising',
  'A closer look at how political adverts shape public perception.',
  TRUE, 'published',
  FALSE, '2025-11-06 09:15:00+00', NULL
),

-- 15. Published, UK Politics, non-featured, force regenerate
(
  'y8rn2c7v5qqk',
  'Commons committee launches inquiry into lobbying',
  'A new inquiry will investigate opaque lobbying practices in Westminster.',
  '<p>The committee will examine...</p>',
  1, 1, 2,
  NULL, FALSE,
  'https://cdn.dailypolitics.com/images/lobbying-committee.jpg',
  'Committee room inside Parliament',
  'MPs gather to discuss the scope of the lobbying inquiry.',
  'Photo: House of Commons',
  'Lobbying inquiry launched',
  'A new Commons inquiry will review lobbying rules and transparency.',
  TRUE, 'published',
  TRUE,
  '2025-11-05 10:00:00+00', NULL
),

-- 16. Published, World, non-featured
(
  'h1cm0d8r6bxp',
  'Brazil announces new rainforest protection measures',
  'The government has introduced policies to curb deforestation.',
  '<p>Brazil has committed to new environmental protections...</p>',
  3, 2, 3,
  NULL, FALSE,
  'https://cdn.dailypolitics.com/images/brazil-rainforest.jpg',
  'Amazon rainforest canopy',
  'View over dense Amazon forest near Manaus.',
  'Photo: AP',
  'Brazil boosts rainforest protections',
  'Brazilian ministers outline new measures to tackle deforestation.',
  TRUE, 'published',
  FALSE,
  '2025-11-08 06:45:00+00', NULL
),

-- 17. Published, Opinion, featured
(
  'b9kq1m3w7tza',
  'Is Britain facing a constitutional crisis?',
  'Experts warn the UK may be heading into uncharted political territory.',
  '<p>With tensions mounting between devolved governments...</p>',
  2, 3, 1,
  NULL, TRUE,
  'https://cdn.dailypolitics.com/images/constitutional-crisis.jpg',
  'Union Jack and UK constitution books',
  'Experts debate the future of the UK constitution.',
  'Photo: PA',
  'Is Britain facing a constitutional crisis?',
  'A deep look at the legal and political fractures emerging across the UK.',
  TRUE, 'published',
  TRUE,
  '2025-11-09 17:25:00+00', NULL
),

-- 18. Published, World, non-featured
(
  'k2r9d6m0s4vf',
  'France approves major pension reforms',
  'The French government has pushed through a controversial pension reform bill.',
  '<p>Protests erupted across major cities...</p>',
  3, 2, 2,
  NULL, FALSE,
  'https://cdn.dailypolitics.com/images/france-pension-reform.jpg',
  'Protesters in Paris',
  'Protesters march against pension reforms in central Paris.',
  'Photo: AFP',
  'France passes pension reforms',
  'French lawmakers approve a sweeping new pension reform bill.',
  TRUE, 'published',
  FALSE,
  '2025-11-07 15:55:00+00', NULL
);