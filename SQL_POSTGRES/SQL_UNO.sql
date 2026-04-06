-- Borra los productos y sus referencias en cascada
TRUNCATE TABLE productos CASCADE;

-- Insertamos los 14 productos con tus datos exactos
INSERT INTO productos (nombre, capacidad, gramaje, rosca, embalaje, precio, imagen_url) VALUES
('Botella 360ml', 360, 14.5, 'PCO 1881mm', 352, 0.056, 'foto1.png'),
('Botella 300ml', 300, 14.5, 'PCO 1881mm', 452, 0.056, 'foto2.png'),
('Botella 1000ml', 1000, 22.0, 'PCO 1881mm', 181, 0.084, 'foto3.png'),
('Botella 625ml', 625, 19.0, 'PCO 1881mm', 275, 0.075, 'foto4.png'),
('Galón 5 litros Héxagonal', 5000, 85.0, 'PCO 85mm', 36, 0.45, 'foto5.png'),
('Galon 5 litros redonda', 5000, 85.0, 'PCO 48mm', 36, 0.045, 'foto6.png'),
('Botella Desinfectante 500ml', 500, 14.5, '28mm', 300, 0.60, 'foto7.png'),
('Botella 250ml', 250, 14.5, 'PCO 1881mm', 500, 0.056, 'foto8.png'),
('Botella 625ml (Liviana)', 625, 14.5, 'PCO 1881mm', 275, 0.056, 'foto9.png'),
('Envase jugos 500ml', 500, 19.5, 'PCO 1881mm', 300, 0.060, 'foto10.png'),
('Botella hidratante 500ml', 500, 27.0, 'PCO 33mm', 300, 0.065, 'foto11.png'),
('Botella 600ml', 600, 14.5, 'PCO 1881', 300, 0.056, 'foto12.png'),
('Botella 500ml', 500, 14.5, 'PCO 1881', 300, 0.045, 'foto13.png'),
('Botella Aceite 900ml', 900, 28.0, 'PCO 1881', 290, 0.1200, 'foto14.png');

-- Verificamos que estén los 14
SELECT id, nombre, imagen_url FROM productos ORDER BY id ASC;