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