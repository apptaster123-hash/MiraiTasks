/*
# Create tasks table (multi-user, owner-scoped)

1. New Tables
- `tasks`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user via auth.uid())
  - `title` (text, not null) — the task title
  - `note` (text, nullable) — optional note/description for the task
  - `completed` (boolean, default false) — whether the task is done
  - `priority` (text, default 'none') — task priority: 'none', 'low', 'medium', 'high'
  - `due_date` (timestamptz, nullable) — optional due date
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now()) — tracks last modification

2. Security
- Enable RLS on `tasks`.
- Owner-scoped CRUD: each authenticated user can only access rows they own (4 policies: select, insert, update, delete).
- The `user_id` column defaults to `auth.uid()` so frontend inserts that omit `user_id` still satisfy the INSERT WITH CHECK.

3. Indexes
- Index on `user_id` for fast per-user queries.
- Index on `due_date` for sorting/filtering by due date.

4. Important Notes
- This is a multi-user app requiring sign-in. All policies scope to `TO authenticated`.
- No `FOR ALL` policies — 4 separate per-verb policies.
- `updated_at` auto-updates via a trigger on every UPDATE.
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  note text,
  completed boolean NOT NULL DEFAULT false,
  priority text NOT NULL DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
