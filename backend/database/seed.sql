-- ------------------------------------------------------
-- VIDA ACTIVA - Seed Data (fake data, safe to commit)
-- DO NOT use in production
-- ------------------------------------------------------

-- =====================
-- USERS
-- =====================
-- All users share the same password for dev convenience:
--   admin@vidaactiva.cl    → Admin1234!
--   maria.gonzalez@...      → Specialist1234!
--   pedro.soto@test.com     → Patient1234!
-- (hashes generated with bcrypt, cost=12)

INSERT INTO users (id, first_name, last_name, email, password_hash, role) VALUES
  -- Admin | password: Admin1234!
  ('e2b1cc5c-ab6f-47de-86d3-f4eba9db6b93',
   'Carlos', 'Mendoza',
   'admin@vidaactiva.cl',
   '$2b$12$deumaN7zMt.r//7SDytC3eSBsvxHdiKU2m/E1PfHM1owar96fywoG',
   'ADMIN'),

  -- Specialist | password: Specialist1234!
  ('ba80b312-b4e8-4800-bf46-8c8d84f5052a',
   'María', 'González',
   'maria.gonzalez@vidaactiva.cl',
   '$2b$12$l2WzsN7pm8YE4JWHWjpWEOqWmzBUr./vOb7xnbJ9uDE28hgJAODUG',
   'SPECIALIST'),

  -- Patient | password: Patient1234!
  ('90bcc710-3984-4f86-8570-772ac433d7cd',
   'Pedro', 'Soto',
   'pedro.soto@test.com',
   '$2b$12$Bsb8aWAEkGxbfgSBEjr9SuTYRH/UWMu5krkqyvy7DfLKoyBxmddu2',
   'PATIENT'),

  -- Patient 2 (not assigned to any specialist) | password: Patient1234!
  ('7c0f3d2a-1b44-4e58-9a31-2f6c8e0a9b12',
   'Ana', 'Pérez',
   'ana.perez@test.com',
   '$2b$12$Bsb8aWAEkGxbfgSBEjr9SuTYRH/UWMu5krkqyvy7DfLKoyBxmddu2',
   'PATIENT');

-- =====================
-- ADMIN
-- =====================

INSERT INTO admin (user_id, job_title) VALUES
  ('e2b1cc5c-ab6f-47de-86d3-f4eba9db6b93', 'Administrador de Plataforma');

-- =====================
-- SPECIALISTS
-- =====================

INSERT INTO specialists (user_id, rut, specialty, phone) VALUES
  ('ba80b312-b4e8-4800-bf46-8c8d84f5052a', '12345678-9', 'Kinesiología', '+56912345678');

-- =====================
-- PATIENTS
-- =====================

INSERT INTO patients (user_id, rut, age, gender, phone, address, is_active) VALUES
  ('90bcc710-3984-4f86-8570-772ac433d7cd', '98765432-1', 34, 'Masculino', '+56987654321', 'Av. Ficticia 123, Santiago', TRUE),
  -- Patient 2: not assigned to any specialist, to test the assignment flow.
  ('7c0f3d2a-1b44-4e58-9a31-2f6c8e0a9b12', '11111111-1', 28, 'Femenino', '+56911111111', 'Calle Falsa 456, Santiago', TRUE);

-- =====================
-- ROUTINES
-- =====================
-- Test routine for the sessions endpoints, with a fixed id so it is predictable:
--   routine_id  → 12f7ce23-cac4-4987-a338-9b0e1175edd8
--   patient_id  → 90bcc710-3984-4f86-8570-772ac433d7cd (Pedro Soto)

INSERT INTO routines (id, specialist_id, patient_id, name, start_date, end_date, day_of_week, scheduled_time) VALUES
  ('12f7ce23-cac4-4987-a338-9b0e1175edd8',
   'ba80b312-b4e8-4800-bf46-8c8d84f5052a',
   '90bcc710-3984-4f86-8570-772ac433d7cd',
   'Rutina de prueba - sesiones',
   CURRENT_DATE,
   CURRENT_DATE + INTERVAL '30 days',
   1,
   '10:00:00');

-- =====================
-- EXERCISES
-- =====================
-- exercises.id is a VARCHAR slug matching the frontend exerciseId and the exerciseRegistry.ts keys
-- (toe_touch, leg_raise, shoulder_raises, squat); do not change them.
INSERT INTO exercises (id, name, description, instructions, multimedia_url) VALUES
  ('squat', 'Sentadilla',
   'Ejercicio de fuerza para piernas y glúteos.',
   'Párate con los pies separados al ancho de los hombros. Baja flexionando rodillas y caderas como si fueras a sentarte, manteniendo la espalda recta. Desciende hasta que los muslos queden paralelos al suelo y vuelve a subir de forma controlada.',
   NULL),
  ('toe_touch', 'Toque de punta de pies',
   'Estiramiento de espalda baja e isquiotibiales.',
   'Párate erguido con los pies juntos y las piernas estiradas. Inclínate hacia adelante desde la cadera bajando las manos hacia las puntas de los pies. Mantén la espalda lo más recta posible y vuelve lentamente a la posición inicial.',
   NULL),
  ('leg_raise', 'Elevación de pierna',
   'Fortalece la cadera y el equilibrio.',
   'Párate erguido y apóyate en una superficie estable si lo necesitas. Eleva una pierna estirada hacia el frente manteniendo el tronco firme. Sube hasta donde puedas sin doblar la rodilla y baja la pierna de forma controlada.',
   NULL),
  ('shoulder_raises', 'Elevación de brazos',
   'Movilidad y fuerza de hombros.',
   'Párate erguido con los brazos a los costados del cuerpo. Eleva ambos brazos estirados hacia adelante hasta la altura de los hombros. Mantén un instante y baja los brazos lentamente a la posición inicial.',
   NULL);

-- =====================
-- ROUTINE_EXERCISES
-- =====================
-- Exercises of the test routine (12f7ce23...), by order_index. POST /api/sessions needs them to create
-- one session_exercises row per routine_exercise.
INSERT INTO routine_exercises (id, routine_id, exercise_id, order_index, level, total_series, total_reps, rest_time_seconds, time_limit_seconds) VALUES
  ('1fab546d-7829-478a-98f5-bd42ed045a0d', '12f7ce23-cac4-4987-a338-9b0e1175edd8', 'toe_touch',       0, 1, 1, 10, 30, NULL),
  ('c3dc751c-72d2-421c-a7e5-d10fbe41d440', '12f7ce23-cac4-4987-a338-9b0e1175edd8', 'leg_raise',       1, 1, 1, 10, 30, NULL),
  ('1a582d5c-ee9d-4395-8672-2e8b0ba64a2f', '12f7ce23-cac4-4987-a338-9b0e1175edd8', 'shoulder_raises', 2, 1, 1, 10, 30, NULL),
  ('869202d7-7b9e-4f38-82f6-11b0b959ee5e', '12f7ce23-cac4-4987-a338-9b0e1175edd8', 'squat',           3, 1, 1, 10, 30, NULL);

-- =====================
-- SESSIONS
-- =====================
-- Test session with a fixed id for the progress PUT endpoint.
--   session_id  → 90a1aeee-c904-439f-ba34-1a3c9dfc2a41
--   patient_id  → 90bcc710-3984-4f86-8570-772ac433d7cd (Pedro Soto)
--   routine_id  → 12f7ce23-cac4-4987-a338-9b0e1175edd8

INSERT INTO sessions (id, patient_id, routine_id, duration_minutes, is_completed) VALUES
  ('90a1aeee-c904-439f-ba34-1a3c9dfc2a41',
   '90bcc710-3984-4f86-8570-772ac433d7cd',
   '12f7ce23-cac4-4987-a338-9b0e1175edd8',
   NULL,
   FALSE);

-- =====================
-- SESSION_EXERCISES
-- =====================
-- Exercise record inside the session, with a fixed id; routine_exercise_id is left NULL (optional).
--   session_exercise_id → 6b75d303-0e53-442b-bd3a-330a30b5e366

INSERT INTO session_exercises (id, session_id, exercise_id, routine_exercise_id, series_completed, reps_completed, accuracy_score, feedback) VALUES
  ('6b75d303-0e53-442b-bd3a-330a30b5e366',
   '90a1aeee-c904-439f-ba34-1a3c9dfc2a41',
   'squat',
   NULL,
   0,
   0,
   NULL,
   NULL);

