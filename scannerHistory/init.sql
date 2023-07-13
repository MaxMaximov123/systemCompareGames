CREATE TABLE history (
  id BIGINT,
  globalGameId BIGINT,
  bookieId INT,
  bookieKey VARCHAR(64),
  sportId INT,
  sportKey VARCHAR(64),
  isLive BOOLEAN,
  startTime BIGINT,
  team1Id BIGINT,
  team2Id BIGINT,
  team1Name VARCHAR(64),
  score1 INT,
  score2 INT,
  first_ REAL,
  draw_ REAL,
  firstOrDraw REAL,
  second_ REAL,
  drawOrSecond REAL,
  firstOrSecond REAL
);

CREATE TABLE results (
  id1 BIGINT,
  id2 BIGINT,
  game1Team1Name VARCHAR(64),
  game1Team2Name VARCHAR(64),
  game2Team1Name VARCHAR(64),
  game2Team2Name VARCHAR(64),
  similarityNames REAL,
  similarityOutcomes REAL,
  similarityScores REAL,
  totalSimilarity REAL,
  needGroup BOOLEAN,
  grouped BOOLEAN
);
