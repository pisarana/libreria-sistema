-- ================================================================
--  LIBRERIA SISTEMA — data.sql
--  Datos iniciales para desarrollo y demostración del sistema
--
--  IMPORTANTE: Se usa INSERT ... ON CONFLICT DO NOTHING para
--  idempotencia. Puede ejecutarse múltiples veces sin duplicar.
-- ================================================================

-- ── AUTORES ────────────────────────────────────────────────────
INSERT INTO autores (nombre, apellido, nacionalidad) VALUES
    ('Gabriel',  'García Márquez',  'Colombiana'),
    ('Mario',    'Vargas Llosa',     'Peruana'),
    ('Isabel',   'Allende',          'Chilena'),
    ('Jorge Luis','Borges',          'Argentina'),
    ('Julio',    'Cortázar',         'Argentina'),
    ('Pablo',    'Neruda',           'Chilena'),
    ('Octavio',  'Paz',              'Mexicana'),
    ('Carlos',   'Fuentes',          'Mexicana'),
    ('Roberto',  'Bolaño',           'Chilena'),
    ('Juan',     'Rulfo',            'Mexicana')
ON CONFLICT DO NOTHING;

-- ── CATEGORIAS ─────────────────────────────────────────────────
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Literatura',       'Novelas, cuentos y poesía latinoamericana y universal'),
    ('Ciencia Ficción',  'Narrativa especulativa, distopías y space opera'),
    ('Historia',         'Ensayos y crónicas históricas'),
    ('Filosofía',        'Pensamiento clásico y contemporáneo'),
    ('Tecnología',       'Programación, sistemas y ciencias de la computación'),
    ('Autoayuda',        'Desarrollo personal y productividad'),
    ('Infantil',         'Literatura para niños y jóvenes')
ON CONFLICT DO NOTHING;

-- ── LIBROS ─────────────────────────────────────────────────────
-- autor_id: 1=García Márquez, 2=Vargas Llosa, 3=Allende, 4=Borges
--           5=Cortázar, 6=Neruda, 7=Paz, 8=Fuentes, 9=Bolaño, 10=Rulfo
-- categoria_id: 1=Literatura, 2=Sci-Fi, 3=Historia, 4=Filosofía
--               5=Tecnología, 6=Autoayuda, 7=Infantil
INSERT INTO libros (titulo, isbn, precio, stock, descripcion, autor_id, categoria_id) VALUES
    ('Cien años de soledad',       '9780060883287', 45.00, 7,  'La saga de la familia Buendía en Macondo.',                    1, 1),
    ('El amor en los tiempos del cólera', '9780140157239', 42.00, 2, 'Historia de amor que dura más de cincuenta años.',        1, 1),
    ('La ciudad y los perros',     '9788420471839', 38.00, 5,  'La vida en el Colegio Militar Leoncio Prado de Lima.',         2, 1),
    ('La casa de los espíritus',   '9780553383805', 40.00, 2,  'Saga familiar marcada por el destino y la política.',         3, 1),
    ('Ficciones',                  '9780802130303', 50.00, 9,  'Laberintos, espejos y bibliografías de libros inexistentes.',  4, 1),
    ('Rayuela',                    '9788437604572', 35.00, 3,  'Una contranovela experimental con capítulos intercambiables.', 5, 1),
    ('2666',                       '9780312429218', 55.00, 7,  'Épica narrativa sobre crímenes en una ciudad fronteriza.',     9, 1),
    ('Pedro Páramo',               '9788420471853', 28.00, 11, 'Un hombre busca a su padre en un pueblo fantasma.',           10, 1),
    ('Conversación en La Catedral','9788420471846', 48.00, 1,  'Cuatro horas de conversación que retratan una época.',        2, 1),
    ('El nombre de la rosa',       '9780156001311', 52.00, 5,  'Misterio medieval en una abadía benedictina.',                4, 3)
ON CONFLICT DO NOTHING;

-- ── USUARIOS ───────────────────────────────────────────────────
-- Contraseñas hasheadas con BCrypt (rounds=10)
-- admin@libreria.com     → admin123
-- maria@libreria.com     → empleado123
-- carlos@libreria.com    → empleado123
-- Todos los usuarios usan contraseña: admin123
-- Hash generado con BCryptPasswordEncoder(10)
INSERT INTO usuarios (nombre, apellido, correo, password, rol, estado) VALUES
    ('Administrador', 'Sistema',   'admin@libreria.com',   '$2a$10$sYDhqiymScGDu3.EfgvZaOEnzewRWcp6p9PYTsY3PRkp/xiBMOc1y', 'ADMIN',    TRUE),
    ('María',         'González',  'maria@libreria.com',   '$2a$10$sYDhqiymScGDu3.EfgvZaOEnzewRWcp6p9PYTsY3PRkp/xiBMOc1y', 'EMPLEADO', TRUE),
    ('Carlos',        'Rodríguez', 'carlos@libreria.com',  '$2a$10$sYDhqiymScGDu3.EfgvZaOEnzewRWcp6p9PYTsY3PRkp/xiBMOc1y', 'EMPLEADO', TRUE),
    ('Lucía',         'Fernández', 'lucia@libreria.com',   '$2a$10$sYDhqiymScGDu3.EfgvZaOEnzewRWcp6p9PYTsY3PRkp/xiBMOc1y', 'EMPLEADO', FALSE)
ON CONFLICT DO NOTHING;

-- ── PRESTAMOS ──────────────────────────────────────────────────
-- Préstamos distribuidos en los últimos 6 meses (datos para el gráfico)
INSERT INTO prestamos (usuario_id, fecha_prestamo, fecha_devolucion, estado, observaciones) VALUES
    (2, CURRENT_DATE - INTERVAL '150 days', CURRENT_DATE - INTERVAL '143 days', 'DEVUELTO', 'Devolución en buen estado'),
    (3, CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE - INTERVAL '113 days', 'DEVUELTO', NULL),
    (2, CURRENT_DATE - INTERVAL '90 days',  CURRENT_DATE - INTERVAL '83 days',  'DEVUELTO', 'Devolución con leve deterioro en cubierta'),
    (3, CURRENT_DATE - INTERVAL '60 days',  CURRENT_DATE - INTERVAL '53 days',  'DEVUELTO', NULL),
    (2, CURRENT_DATE - INTERVAL '45 days',  CURRENT_DATE - INTERVAL '38 days',  'DEVUELTO', NULL),
    (3, CURRENT_DATE - INTERVAL '30 days',  CURRENT_DATE - INTERVAL '23 days',  'DEVUELTO', NULL),
    (2, CURRENT_DATE - INTERVAL '20 days',  NULL,                                'VENCIDO',  'Pendiente de devolución'),
    (3, CURRENT_DATE - INTERVAL '10 days',  NULL,                                'ACTIVO',   'Primera semana'),
    (2, CURRENT_DATE - INTERVAL '5 days',   NULL,                                'ACTIVO',   NULL),
    (3, CURRENT_DATE,                        NULL,                                'ACTIVO',   'Préstamo de hoy')
ON CONFLICT DO NOTHING;

-- ── DETALLE_PRESTAMOS ──────────────────────────────────────────
INSERT INTO detalle_prestamos (prestamo_id, libro_id, cantidad) VALUES
    (1, 1, 1), (1, 5, 1),
    (2, 3, 1), (2, 8, 1),
    (3, 2, 1),
    (4, 6, 1), (4, 7, 1),
    (5, 4, 1), (5, 9, 1),
    (6, 10, 1),
    (7, 1, 1),
    (8, 3, 1), (8, 5, 1),
    (9, 2, 1),
    (10, 8, 1), (10, 6, 1)
ON CONFLICT DO NOTHING;

-- Stock ya refleja préstamos activos en los INSERT anteriores (idempotente)
