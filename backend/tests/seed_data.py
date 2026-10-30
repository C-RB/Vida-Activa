"""Constants mirroring database/seed.sql; update them if the seed changes."""

# Users (email / password)
ADMIN_EMAIL = "admin@vidaactiva.cl"
ADMIN_PASSWORD = "Admin1234!"

SPECIALIST_EMAIL = "maria.gonzalez@vidaactiva.cl"
SPECIALIST_PASSWORD = "Specialist1234!"

# Pedro Soto: patient WITH a test routine and session assigned.
PATIENT_EMAIL = "pedro.soto@test.com"
PATIENT_PASSWORD = "Patient1234!"
PATIENT_PEDRO_ID = "90bcc710-3984-4f86-8570-772ac433d7cd"
PATIENT_PEDRO_RUT = "98765432-1"

# Ana Pérez: patient NOT assigned to any specialist (for the assignment flow).
PATIENT_ANA_EMAIL = "ana.perez@test.com"
PATIENT_ANA_PASSWORD = "Patient1234!"
PATIENT_ANA_ID = "7c0f3d2a-1b44-4e58-9a31-2f6c8e0a9b12"
PATIENT_ANA_RUT = "11111111-1"

# Pedro's test routine (4 routine_exercises).
ROUTINE_ID = "12f7ce23-cac4-4987-a338-9b0e1175edd8"

# Seeded exercise slugs.
EXERCISE_SLUGS = {"squat", "toe_touch", "leg_raise", "shoulder_raises"}
