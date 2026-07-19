# Librería Sistema Hardening and Polish Implementation Plan

**Goal:** Convert the existing university library system into a safer, more testable and more maintainable local application without changing its core modules.

**Architecture:** Keep the existing layered Spring MVC structure and static frontend. Strengthen the boundaries at security, request validation, error handling and persistence, then add focused tests and repeatable verification. Keep `frontend/` as the editable source and mirror runtime assets under `src/main/resources/static/` until a frontend build step exists.

**Tech Stack:** Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA, H2/PostgreSQL, Maven, HTML/CSS/ES modules, Graphify.

## Global Constraints

- Preserve existing API paths and Spanish user-facing copy.
- Do not store credentials or connection secrets in tracked files.
- Keep H2 local development and PostgreSQL production profiles working.
- Do not push or merge changes without explicit user confirmation.
- Every behavior change must be verified with Maven tests or a browser smoke test.

### Task 1: Establish a clean verification baseline

**Files:**
- Inspect: `pom.xml`, `src/main/java/**`, `src/main/resources/**`, `frontend/**`
- Generate: `graphify-out/**`

- [x] Run `JAVA_HOME=/Users/misael/.gemini/antigravity-ide/scratch/jdk21/Contents/Home ./mvnw test -q`.
- [x] Generate the code graph and cluster report with Graphify.
- [x] Record the current architecture and risks before editing.

### Task 2: Harden session security and frontend requests

**Files:**
- Modify: `src/main/java/com/libreria/sistema/config/SecurityConfig.java`
- Modify: `src/main/resources/application.properties`
- Modify: `src/main/resources/application-prod.properties`
- Modify: `frontend/js/utils.js`
- Modify: `src/main/resources/static/js/utils.js`
- Test: `src/test/java/com/libreria/sistema/security/SecurityConfigTest.java`

- [ ] Enable CSRF protection with a readable `XSRF-TOKEN` cookie and require `X-XSRF-TOKEN` for unsafe browser requests.
- [ ] Keep public login/static routes available while requiring authentication for business endpoints.
- [ ] Preserve HttpOnly, Secure-in-production and SameSite cookie settings.
- [ ] Add response security headers that do not block the existing Bootstrap/Chart.js CDN assets.
- [ ] Add a test proving unauthenticated business requests are rejected and the public health endpoint remains available.

### Task 3: Make request boundaries predictable

**Files:**
- Modify: `src/main/java/com/libreria/sistema/controller/LibroController.java`
- Modify: `src/main/java/com/libreria/sistema/controller/PrestamoController.java`
- Modify: `src/main/java/com/libreria/sistema/exception/GlobalExceptionHandler.java`
- Create: `src/main/java/com/libreria/sistema/exception/InvalidRequestException.java`
- Test: `src/test/java/com/libreria/sistema/controller/LibroControllerTest.java`

- [ ] Enforce bounded page and size parameters so invalid pagination cannot create a server error.
- [ ] Return stable ordering for paginated list endpoints.
- [ ] Return field-level validation details with field names and deterministic messages.
- [ ] Map malformed path/query parameters to a clear 400 response.

### Task 4: Protect inventory and loan invariants

**Files:**
- Modify: `src/main/java/com/libreria/sistema/repository/LibroRepository.java`
- Modify: `src/main/java/com/libreria/sistema/service/impl/PrestamoServiceImpl.java`
- Modify: `src/main/java/com/libreria/sistema/entity/Libro.java`
- Test: `src/test/java/com/libreria/sistema/service/PrestamoServiceImplTest.java`

- [ ] Use a transaction-safe stock read when creating a loan.
- [ ] Reject empty loan detail lists and non-positive quantities at the request boundary.
- [ ] Prevent duplicate book lines from bypassing available-stock validation.
- [ ] Preserve atomic rollback when one line cannot be fulfilled.

### Task 5: Add maintainability and delivery guardrails

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.editorconfig`
- Modify: `README.md`
- Modify: `.gitignore`
- Create: `docs/ARCHITECTURE.md`

- [ ] Add CI for Java 21, Maven tests and packaged build.
- [ ] Document local H2, production PostgreSQL, security behavior and test commands.
- [ ] Exclude generated runtime/build artifacts and local secrets.
- [ ] Document the source/runtime frontend duplication and its synchronization command.

### Task 6: Verify and refresh the project graph

**Files:**
- Update: `graphify-out/**`

- [ ] Run the complete Maven verification command.
- [ ] Run a local HTTP smoke test for public health, login and one protected endpoint.
- [ ] Re-run Graphify and confirm the updated architecture is represented.
- [ ] Report changed files and any remaining limitations before offering a commit/PR.
