-- 第二轮：增加 metadata_json 列，保存题型专属数据
ALTER TABLE exercises ADD COLUMN metadata_json TEXT;

-- 增加唯一约束确保 seed 幂等
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_id ON exercises(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_prerequisites ON lesson_prerequisites(lesson_id, prerequisite_lesson_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_entity ON bookmarks(user_id, entity_type, entity_id);
