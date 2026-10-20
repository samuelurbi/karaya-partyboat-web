-- Tabla común a las 3 webs del grupo (karayapuntacana.com, karayatravelagents.com,
-- hispaniolatravelagents.com): una sola base de datos MySQL del Hostinger del cliente.
-- Importar en phpMyAdmin (hPanel > Bases de datos > phpMyAdmin > la base > Importar).
-- Compatible con MySQL 8 y MariaDB 10.5+.

CREATE TABLE IF NOT EXISTS envios (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sitio           VARCHAR(80)  NOT NULL,                -- dominio de la web que recibió el envío
  formulario      VARCHAR(40)  NOT NULL,                -- contacto, solicitud, agentes…
  idioma          VARCHAR(5)   NOT NULL DEFAULT 'en',
  datos           JSON         NOT NULL,                -- los campos del formulario
  consentimiento  JSON         NOT NULL,                -- {aceptado, texto aceptado, fecha, comunicaciones}
  origen          VARCHAR(200) NULL,                    -- utm_content / página de entrada
  utm             JSON         NULL,                    -- utm_source, utm_medium, utm_campaign…
  user_agent      VARCHAR(300) NULL,
  referencia      VARCHAR(24)  NULL,                    -- p. ej. KY-00042 (solicitudes)
  correo          TINYINT(1)   NULL,                    -- NULL pendiente, 1 aviso enviado, 0 el aviso falló (revisar)
  creado          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sitio_formulario (sitio, formulario, creado),
  KEY idx_referencia (referencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- La IP no se guarda. El límite por IP usa un hash con sal, solo en memoria del servidor.
