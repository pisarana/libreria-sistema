-- ================================================================
--  LIBRERIA SISTEMA — schema.sql
--  Motor: PostgreSQL 15+
--  Compatible con: Supabase, Neon, Docker PostgreSQL, local
--
--  Ejecutar con: psql -d libreria_db -f schema.sql
--  O dejar que Spring Boot lo ejecute al arrancar.
--
--  NOTA: Se usa IF NOT EXISTS para que sea idempotente
--        (puede ejecutarse múltiples veces sin error).
-- ================================================================

-- ── AUTORES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS autores (
    id                  BIGSERIAL       PRIMARY KEY,
    nombre              VARCHAR(100)    NOT NULL,
    apellido            VARCHAR(100)    NOT NULL,
    nacionalidad        VARCHAR(80),
    biografia           TEXT,
    fecha_creacion      TIMESTAMP       NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_autor_nombre    CHECK (LENGTH(TRIM(nombre)) > 0),
    CONSTRAINT chk_autor_apellido  CHECK (LENGTH(TRIM(apellido)) > 0)
);

-- ── CATEGORIAS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
    id                  BIGSERIAL       PRIMARY KEY,
    nombre              VARCHAR(100)    NOT NULL,
    descripcion         TEXT,
    fecha_creacion      TIMESTAMP       NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_categoria_nombre  UNIQUE (nombre),
    CONSTRAINT chk_categoria_nombre CHECK (LENGTH(TRIM(nombre)) > 0)
);

-- ── LIBROS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS libros (
    id                  BIGSERIAL       PRIMARY KEY,
    titulo              VARCHAR(255)    NOT NULL,
    isbn                VARCHAR(20)     NOT NULL,
    precio              NUMERIC(10, 2)  NOT NULL DEFAULT 0.00,
    stock               INTEGER         NOT NULL DEFAULT 0,
    stock_minimo        INTEGER         NOT NULL DEFAULT 3,
    fecha_publicacion   DATE,
    descripcion         TEXT,
    autor_id            BIGINT          NOT NULL,
    categoria_id        BIGINT          NOT NULL,
    fecha_creacion      TIMESTAMP       NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_libro_isbn        UNIQUE (isbn),
    CONSTRAINT fk_libro_autor       FOREIGN KEY (autor_id)
        REFERENCES autores(id)      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_libro_categoria   FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)   ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_libro_precio     CHECK (precio >= 0),
    CONSTRAINT chk_libro_stock      CHECK (stock >= 0),
    CONSTRAINT chk_libro_titulo     CHECK (LENGTH(TRIM(titulo)) > 0),
    CONSTRAINT chk_libro_isbn_len   CHECK (LENGTH(TRIM(isbn)) >= 10)
);

-- ── USUARIOS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id                  BIGSERIAL       PRIMARY KEY,
    nombre              VARCHAR(100)    NOT NULL,
    apellido            VARCHAR(100)    NOT NULL,
    correo              VARCHAR(150)    NOT NULL,
    password            VARCHAR(255)    NOT NULL,
    rol                 VARCHAR(20)     NOT NULL DEFAULT 'EMPLEADO',
    estado              BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_creacion      TIMESTAMP       NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_usuario_correo    UNIQUE (correo),
    CONSTRAINT chk_usuario_rol      CHECK (rol IN ('ADMIN', 'EMPLEADO')),
    CONSTRAINT chk_usuario_correo   CHECK (correo ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_usuario_nombre   CHECK (LENGTH(TRIM(nombre)) > 0)
);

-- ── PRESTAMOS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prestamos (
    id                  BIGSERIAL       PRIMARY KEY,
    usuario_id          BIGINT          NOT NULL,
    fecha_prestamo      DATE            NOT NULL DEFAULT CURRENT_DATE,
    fecha_devolucion    DATE,
    estado              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVO',
    observaciones       TEXT,
    fecha_creacion      TIMESTAMP       NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_prestamo_usuario  FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)     ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_prestamo_estado  CHECK (estado IN ('ACTIVO', 'DEVUELTO', 'VENCIDO')),
    CONSTRAINT chk_prestamo_fechas  CHECK (
        fecha_devolucion IS NULL OR fecha_devolucion >= fecha_prestamo
    )
);

-- ── DETALLE_PRESTAMOS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS detalle_prestamos (
    id              BIGSERIAL   PRIMARY KEY,
    prestamo_id     BIGINT          NOT NULL,
    libro_id        BIGINT          NOT NULL,
    cantidad        INTEGER         NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(10, 2)  NOT NULL DEFAULT 0.00,

    CONSTRAINT fk_detalle_prestamo  FOREIGN KEY (prestamo_id)
        REFERENCES prestamos(id)    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_libro     FOREIGN KEY (libro_id)
        REFERENCES libros(id)       ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_creacion      TIMESTAMP   NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT uq_detalle_libro     UNIQUE (prestamo_id, libro_id)
);

-- ================================================================
--  ÍNDICES — mejoran el rendimiento de búsquedas frecuentes
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_libro_titulo        ON libros(titulo);
CREATE INDEX IF NOT EXISTS idx_libro_isbn          ON libros(isbn);
CREATE INDEX IF NOT EXISTS idx_libro_autor         ON libros(autor_id);
CREATE INDEX IF NOT EXISTS idx_libro_categoria     ON libros(categoria_id);
-- Índice en stock para consultas de stock bajo (compara contra stock_minimo en tiempo de ejecución)
CREATE INDEX IF NOT EXISTS idx_libro_stock_bajo    ON libros(stock);

CREATE INDEX IF NOT EXISTS idx_usuario_correo      ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuario_estado      ON usuarios(estado);

CREATE INDEX IF NOT EXISTS idx_prestamo_usuario    ON prestamos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_prestamo_estado     ON prestamos(estado);
CREATE INDEX IF NOT EXISTS idx_prestamo_fecha      ON prestamos(fecha_prestamo);
-- Índice por fecha para agrupación mensual del gráfico Chart.js
CREATE INDEX IF NOT EXISTS idx_prestamo_mes        ON prestamos(fecha_prestamo);
