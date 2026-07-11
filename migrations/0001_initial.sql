PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS course_modules (
  id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, description TEXT,
  order_index INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY, module_id TEXT NOT NULL REFERENCES course_modules(id), slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL, summary TEXT, level TEXT NOT NULL, estimated_minutes INTEGER,
  content_json TEXT NOT NULL, order_index INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lesson_prerequisites (
  lesson_id TEXT NOT NULL REFERENCES lessons(id), prerequisite_lesson_id TEXT NOT NULL REFERENCES lessons(id),
  PRIMARY KEY (lesson_id, prerequisite_lesson_id)
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY, lesson_id TEXT REFERENCES lessons(id), knowledge_node_id TEXT, type TEXT NOT NULL,
  prompt_json TEXT NOT NULL, answer_json TEXT NOT NULL, explanation_json TEXT, difficulty INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS exercise_attempts (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, exercise_id TEXT NOT NULL REFERENCES exercises(id),
  answer_json TEXT NOT NULL, is_correct INTEGER NOT NULL CHECK(is_correct IN (0,1)), score REAL NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_progress (
  user_id TEXT NOT NULL, lesson_id TEXT NOT NULL REFERENCES lessons(id), status TEXT NOT NULL,
  mastery REAL NOT NULL DEFAULT 0, last_studied_at TEXT, updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  created_at TEXT NOT NULL, UNIQUE(user_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS song_cases (
  id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, artist TEXT,
  key_tonic TEXT NOT NULL, key_mode TEXT NOT NULL, content_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transcription_projects (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, audio_key TEXT,
  duration REAL, bpm REAL, key_tonic TEXT, key_mode TEXT, result_json TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chord_events (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES transcription_projects(id) ON DELETE CASCADE,
  start_time REAL NOT NULL, end_time REAL NOT NULL, detected_chord TEXT, corrected_chord TEXT,
  confidence REAL, source TEXT NOT NULL DEFAULT 'detected'
);

CREATE TABLE IF NOT EXISTS content_versions (
  id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, version INTEGER NOT NULL,
  content_json TEXT NOT NULL, status TEXT NOT NULL, created_by TEXT, created_at TEXT NOT NULL,
  UNIQUE(entity_type, entity_id, version)
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON exercise_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user ON transcription_projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chords_project ON chord_events(project_id, start_time);
