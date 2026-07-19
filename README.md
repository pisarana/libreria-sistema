# Sistema de Gestión de Librería

Sistema web interno para la gestión de libros, usuarios, autores, categorías, inventario y préstamos de una librería.

Proyecto universitario — Curso: Lenguajes de Programación

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Java 21 + Spring Boot 3.3 |
| Persistencia | Spring Data JPA + Hibernate |
| Seguridad | Spring Security (sesión HTTP) |
| Base de datos | PostgreSQL 15+ |
| Frontend | HTML5 + CSS3 + JavaScript ES6 |
| UI Framework | Bootstrap 5.3 + Bootstrap Icons 1.11 |
| Gráficos | Chart.js 4 |
| Build | Maven 3.9 |

---

## Requisitos previos

- Java 21
- Maven 3.9+
- PostgreSQL 15+ (local, Docker, Supabase o Neon)
- IntelliJ IDEA (recomendado)

---

## Configuración de PostgreSQL

### Opción A — Local

```sql
-- En psql o pgAdmin, crear la base de datos:
CREATE DATABASE libreria_db;
```

Actualizar `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/libreria_db
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### Opción B — Docker

```bash
docker run --name libreria-pg \
  -e POSTGRES_DB=libreria_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### Opción C — Neon (cloud gratuito)

1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear un proyecto y copiar la connection string
3. Reemplazar en `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://ep-xxx.us-east-2.aws.neon.tech/libreria_db?sslmode=require
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password
```

### Opción D — Supabase (cloud gratuito)

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a Settings → Database → Connection string (modo URI)
3. Reemplazar en `application.properties`

---

## Instalación y ejecución

```bash
# 1. Clonar o descomprimir el proyecto
cd libreria-sistema

# 2. Compilar (descarga dependencias automáticamente)
mvn clean install -DskipTests

# 3. Ejecutar
mvn spring-boot:run
```

Spring Boot ejecutará automáticamente `schema.sql` (crea tablas) y `data.sql` (datos de prueba) al arrancar.

**Acceder a la aplicación:** http://localhost:8080

---

## Credenciales de prueba

| Correo | Contraseña | Rol |
|---|---|---|
| admin@libreria.com | admin123 | ADMIN |
| maria@libreria.com | empleado123 | EMPLEADO |
| carlos@libreria.com | empleado123 | EMPLEADO |

---

## Estructura del proyecto

```
libreria-sistema/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/libreria/sistema/
    │   │   ├── LibreriaApplication.java
    │   │   ├── config/          → SecurityConfig
    │   │   ├── controller/      → REST endpoints
    │   │   ├── service/         → Interfaces de negocio
    │   │   │   └── impl/        → Implementaciones
    │   │   ├── repository/      → Repositorios JPA
    │   │   ├── entity/          → Entidades JPA
    │   │   │   └── enums/       → Rol, EstadoPrestamo
    │   │   ├── dto/
    │   │   │   ├── request/     → DTOs de entrada
    │   │   │   └── response/    → DTOs de salida
    │   │   ├── exception/       → Excepciones + handler global
    │   │   ├── security/        → UserDetailsService
    │   │   └── util/            → ApiResponse<T>
    │   └── resources/
    │       ├── application.properties
    │       ├── schema.sql       → DDL de la base de datos
    │       ├── data.sql         → Datos iniciales de prueba
    │       └── static/          → Frontend (HTML/CSS/JS)
    │           ├── index.html   → Login
    │           ├── assets/      → Logo e imágenes
    │           ├── pages/       → Vistas del sistema
    │           ├── css/         → Estilos
    │           └── js/          → Lógica frontend
    │               ├── services/    → Capa HTTP (fetch)
    │               └── components/  → Navbar, Sidebar, Modal
    └── test/
        └── java/com/libreria/sistema/
```

---

## API REST — Endpoints principales

Todos los endpoints (excepto `/api/auth/**`) requieren sesión activa.
Las operaciones mutables usan protección CSRF mediante la cookie `XSRF-TOKEN`; el frontend la envía automáticamente como `X-XSRF-TOKEN`.

| Método | Endpoint | Descripción |
|---|---|---|
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/logout | Cerrar sesión |
| GET | /api/auth/me | Usuario autenticado |
| GET | /api/libros | Listar libros (paginado) |
| POST | /api/libros | Crear libro |
| PUT | /api/libros/{id} | Actualizar libro |
| DELETE | /api/libros/{id} | Eliminar libro (ADMIN) |
| GET | /api/usuarios | Listar usuarios (ADMIN) |
| GET | /api/autores | Listar autores |
| GET | /api/categorias | Listar categorías |
| GET | /api/prestamos | Listar préstamos |
| POST | /api/prestamos | Registrar préstamo |
| PUT | /api/prestamos/{id}/devolver | Marcar como devuelto |
| GET | /api/inventario | Estado del inventario |
| GET | /api/dashboard/stats | Estadísticas del dashboard |

---

## Módulos implementados

- [x] Autenticación (login/logout con sesión HTTP)
- [x] Dashboard con estadísticas y gráficos
- [x] Gestión de Libros (CRUD + búsqueda + paginación)
- [x] Gestión de Autores (CRUD)
- [x] Gestión de Categorías (CRUD)
- [x] Gestión de Usuarios (CRUD — solo ADMIN)
- [x] Gestión de Préstamos (registro + historial)
- [x] Inventario (vista de stock + alertas)
- [x] Actualización automática de stock al registrar préstamo
- [x] Protección de sesión con cookies HttpOnly/SameSite y CSRF
- [x] Validación de paginación y bloqueo de stock durante préstamos
- [x] Pruebas unitarias de inventario/préstamos y CI con Java 21

## Verificación rápida

```bash
./mvnw test
./mvnw verify
```

Para producción, reemplaza todas las credenciales de ejemplo y configura
`DATABASE_URL`, `DATABASE_USERNAME` y `DATABASE_PASSWORD` como variables del
servicio. Las contraseñas de la tabla de demo solo sirven para desarrollo local.
