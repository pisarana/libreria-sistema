# Arquitectura

## Flujo de una operación

```text
Frontend (fetch + sesión)
        ↓
REST Controller (@Valid, autorización)
        ↓
Service (reglas de negocio + transacción)
        ↓
Repository (JPA + PostgreSQL/H2)
        ↓
ApiResponse<T> / GlobalExceptionHandler
```

## Límites

- `controller`: recibe HTTP, valida parámetros y delega.
- `service`: contiene reglas de negocio; los préstamos actualizan stock dentro de una transacción.
- `repository`: consulta persistencia; el stock se lee con bloqueo pesimista al crear préstamos.
- `dto`: evita exponer entidades directamente en la API.
- `security`: sesión HTTP, BCrypt, cookies protegidas y CSRF para operaciones mutables.
- `frontend`: la fuente editable está en `frontend/`; la copia servida está en `src/main/resources/static/`.

> Actualmente ambas carpetas se mantienen explícitamente porque el proyecto no tiene bundler; antes de publicar cambios de frontend hay que revisar ambas copias con `diff -qr frontend src/main/resources/static`.

## Datos y entornos

- Desarrollo: H2 en memoria, datos de demostración y `application.properties`.
- Producción: PostgreSQL mediante `application-prod.properties` y variables de entorno.
- No se deben subir contraseñas reales, tokens, cookies ni archivos `.env`.

## Verificación

```bash
./mvnw test
./mvnw verify
```

El endpoint público `/api/auth/health` permite comprobar disponibilidad sin iniciar sesión.
