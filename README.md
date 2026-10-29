# Vida Activa

Aplicación móvil de **telerrehabilitación** que conecta a especialistas (kinesiólogos, fisioterapeutas) con sus pacientes. El especialista prescribe rutinas de ejercicios y hace seguimiento de la adherencia y el dolor; el paciente ejecuta sus ejercicios desde el celular, guiado por la cámara, y reporta cómo se siente antes y después de cada sesión.

> **Estado:** en desarrollo. El proyecto se está migrando de GitLab a GitHub y el nombre cambió de *ActivaMente* a **Vida Activa**. El rediseño de la interfaz está pendiente. Por ahora la aplicación no se despliega.

## Qué hace

La app tiene tres roles, cada uno con su propia experiencia:

### Paciente
- Ve su rutina activa y su próxima cita.
- Ejecuta los ejercicios con la **cámara**: la app detecta la postura del cuerpo (esqueleto con MediaPipe BlazePose) para guiar la sesión.
- Responde una **encuesta previa** y una **posterior** a cada sesión (nivel de dolor y de fatiga, comentarios).
- Consulta su historial de sesiones y agenda citas con su especialista.

### Especialista
- Panel con sus pacientes y **alertas automáticas**: inactivo por más de 5 días, dolor alto (> 7) en la última encuesta o sin sesiones registradas.
- Crea y elimina **rutinas** a partir de la biblioteca de ejercicios, con series, repeticiones, nivel, descanso y día/hora.
- Revisa las **métricas de cumplimiento** (sesiones completadas, adherencia) y el historial de cada paciente.
- Gestiona sus citas (calendario, horarios disponibles, estado) y asigna pacientes a su cargo.

### Administrador
- Crea usuarios (pacientes, especialistas, administradores), los activa o desactiva y gestiona su perfil.

## Arquitectura

```
.
├── backend/    API REST (FastAPI + SQLAlchemy + PostgreSQL)
│   ├── app/             routers, modelos, schemas, servicios, seguridad (JWT)
│   ├── database/        init.sql (esquema) y seed.sql (datos de prueba)
│   └── tests/           pytest contra un Postgres real
├── frontend/   App móvil (React Native + Expo Router + TypeScript)
├── docker-compose.yml   Postgres + backend
└── .github/workflows/   CI (tests)
```

| Capa | Tecnología |
|------|-----------|
| App móvil | React Native 0.81, Expo 54, Expo Router, Vision Camera |
| API | FastAPI, SQLAlchemy 2, Pydantic 2, JWT (python-jose), bcrypt |
| Base de datos | PostgreSQL 16 |
| CI | GitHub Actions |

### Modelo de datos (resumen)
`users` (con rol ADMIN / SPECIALIST / PATIENT) → `specialists`, `patients`, `admin` · `specialist_patient` (asignación) · `appointments` · `exercises` · `routines` → `routine_exercises` · `sessions` → `session_exercises` (métricas por ejercicio) · `surveys` (PRE / POST).

### API principal
Documentación interactiva en `http://localhost:8000/docs` con el backend levantado.

| Prefijo | Función |
|---------|---------|
| `/api/auth` | Login y cambio de contraseña |
| `/api/users`, `/api/admins` | Gestión de usuarios y administradores |
| `/api/patients`, `/api/specialists` | Pacientes, asignación, dashboard del especialista |
| `/api/exercises` | Biblioteca de ejercicios |
| `/api/routines` | Rutinas y su ejercicios |
| `/api/sessions` | Sesiones de ejercicio y sus métricas |
| `/api/surveys` | Encuestas previa y posterior |
| `/api/appointments` | Citas y horarios disponibles |

## Cómo correrlo en local

### 1. Variables de entorno
```bash
cp .env.example .env     # ajusta contraseñas y SECRET_KEY
```

### 2. Backend + base de datos
```bash
docker compose up -d --build
```
La API queda en `http://localhost:8000`. En local, `docker-compose.override.yml` expone Postgres en el puerto `55432`.

La primera vez, la base se crea con `init.sql` y se llena con `seed.sql` (usuarios y datos **ficticios, solo para desarrollo**; nunca lo uses en un entorno real). Las credenciales de prueba están en los comentarios de ese archivo.

> `init.sql` y `seed.sql` solo se ejecutan cuando el volumen de Postgres está vacío. Para reiniciar la base: `docker compose down -v`.

### 3. App móvil
```bash
cd frontend
npm install
npx expo start
```
La detección de postura usa la cámara nativa, así que requiere un **development build** (`npm run android` / `npm run ios`); no funciona en Expo Go. Por defecto la app apunta a `http://10.0.2.2:8000` (emulador Android) o `http://localhost:8000`. En un dispositivo físico define la IP de tu red:
```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000 npx expo start
```

### 4. Tests del backend
```bash
docker compose up -d db
cd backend
pip install -r requirements-dev.txt
pytest
```
Los tests crean una base limpia `activamente_test`, cargan `init.sql` y `seed.sql`, y la eliminan al terminar. El mismo flujo corre en GitHub Actions ([ci.yml](.github/workflows/ci.yml)).

## Pendiente
- Rediseño de la interfaz.
- Renombrar carpetas, paquetes y textos de *ActivaMente* a *Vida Activa*.
- Migraciones de base de datos (hoy solo existen `init.sql` / `seed.sql`).
- Despliegue (omitido por ahora).
