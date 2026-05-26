# PinWand — Outfit Planner

Aplicación fullstack de gestión de closet virtual con IA, recomendaciones de outfits basadas en el clima real y asistente de moda personal.

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express.js |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | JWT + Google OAuth 2.0 |
| IA / Chat | GEMINI |
| Clima | OpenWeather API |
| Documentación | Swagger UI |
| Frontend | React + Vite + Tailwind CSS |
| HTTP Client | Axios |

---

## Funcionalidades principales

- **Autenticación** — Registro, login con email/contraseña y login con Google OAuth
- **Inventario de prendas** — CRUD completo con filtros por tipo, color, temporada y material
- **Outfits** — Crear, editar, eliminar outfits y asignarlos al calendario
- **Outfit del día con IA** — Algoritmo que detecta el clima real y sugiere un outfit del inventario personal
- **Asistente de moda IA** — Chat inteligente con modelo LLaMA 3.3 70B via IA XD
- **Clima en tiempo real** — Geolocalización automática + OpenWeather API
- **Dashboard** — Estadísticas del closet: colores más usados, prenda favorita, resumen
- **Wishlist** — Guardar prendas deseadas de tiendas externas
- **Calendario de outfits** — Planificar outfits por fecha
- **Lienzo de outfits** — Tablero visual para armar outfits con prendas del inventario

---

## Estructura del proyecto

```
Outfit-Planner/
├── backend/
│   ├── src/
│   │   ├── config/          # Base de datos, swagger, passport
│   │   ├── controllers/     # Lógica de cada módulo
│   │   ├── middleware/      # Auth JWT, manejo de errores
│   │   ├── models/          # Modelos de datos (user, outfit, prenda)
│   │   ├── routes/          # Definición de endpoints
│   │   └── services/        # Integraciones externas
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/      # Componentes reutilizables
    │   ├── pages/           # Vistas principales
    │   └── services/        # Llamadas a la API
    └── package.json
```

---

## Instalación y ejecución

### Requisitos previos
- Node.js >= 18
- Cuenta en Supabase
- Cuenta en Google enlazada a Gemini
- Cuenta en OpenWeather (clima gratuito)
- Proyecto OAuth en Google Cloud Console

### Clonar el repositorio

```bash
git clone https://github.com/annetryoshka/Outfit-Planner.git
cd Outfit-Planner
```

### Configurar el backend

```bash
cd backend
npm install
cp .env.example .env
```

### Crear las tablas en Supabase

SQL adjunto en el programa:
```
Outfit-Planner/
├── database/
│   ├── pinwanddb.sql/
```
### Correr el backend

```bash
cd ../backend
npm install
npm run dev
```

### Configurar y correr el frontend

```bash
cd ../frontend
npm install
npm install react-markdown
npm run dev

```

## Endpoints principales

### Auth
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/registro` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| PUT | `/api/auth/perfil` | Actualizar perfil |
| GET | `/api/auth/google` | Login con Google |
| GET | `/api/auth/google/callback` | Callback Google OAuth |

### Prendas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/prendas` | Obtener todas las prendas |
| POST | `/api/prendas` | Crear prenda |
| GET | `/api/prendas/:id` | Obtener prenda por ID |
| PUT | `/api/prendas/:id` | Actualizar prenda |
| DELETE | `/api/prendas/:id` | Eliminar prenda |

### Outfits
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/outfits` | Obtener todos los outfits |
| POST | `/api/outfits` | Crear outfit |
| GET | `/api/outfits/:id` | Obtener outfit por ID |
| GET | `/api/outfits/fecha/:fecha` | Outfits por fecha |
| PUT | `/api/outfits/:id` | Actualizar outfit |
| DELETE | `/api/outfits/:id` | Eliminar outfit |
| POST | `/api/outfits/:id/prendas` | Agregar prenda al outfit |
| DELETE | `/api/outfits/:id/prendas` | Quitar prenda del outfit |

### Clima e IA
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clima/:ciudad` | Clima de una ciudad |
| GET | `/api/clima/:ciudad/outfit` | Sugerencia de outfit por clima |
| GET | `/api/clima/coordenadas/outfit` | Outfit por coordenadas |
| GET | `/api/clima/outfit-inteligente` | Outfit con prendas del inventario |
| POST | `/api/asistente/chat` | Chat con asistente IA |

### Wishlist
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/wishlist` | Obtener wishlist |
| POST | `/api/wishlist` | Agregar item |
| DELETE | `/api/wishlist/:id` | Eliminar item |

---

## Algoritmo de Outfit del Dia

1. Obtiene coordenadas del usuario via geolocalización del navegador
2. Consulta OpenWeather API con lat/lon — temperatura actual
3. Clasifica el clima: muy_frio (10°C o menos) / frio (16°C o menos) / templado (22°C o menos) / calido (28°C o menos) / caliente
4. Mapea clasificación a temporada de prendas (invierno / verano / todo el año)
5. Consulta PostgreSQL buscando prendas del usuario por tipo (top, bottom, outerwear, shoes) y temporada
6. Usa ORDER BY RANDOM() para variedad diaria
7. Devuelve outfit personalizado con prendas reales del closet del usuario

---

## Division de trabajo

| Integrante | Responsabilidades |
|-----------|-------------------|
| Adriana Pando | Auth API (JWT + Google OAuth), Outfits, Clima, Asistente IA API, Algoritmo outfit, Swagger docs |
| Mayte Torrico | DB schema + migraciones, Prendas API, Upload API, Try-on API, Outfit del dia UI |
| Pablo Soto | Wishlist API, Panel inicial, Lienzo de outfits (Fabric.js), Sidebar, Wishlist UI |

---

## Seguridad

- Contraseñas hasheadas con bcryptjs
- Autenticación stateless con JWT (expiración en 7 dias)
- Rutas protegidas con middleware de autenticación
- Variables sensibles en .env (excluido del repositorio via .gitignore)
- Google OAuth 2.0 para login social seguro

---

Proyecto desarrollado para Tecnologias Web II 
