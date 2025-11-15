INSERT INTO posts (
  slug, title, excerpt, content,
  author_id, category_id, header_style_id,
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