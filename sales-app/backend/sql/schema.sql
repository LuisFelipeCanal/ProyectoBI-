CREATE DATABASE IF NOT EXISTS sales_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sales_db;

CREATE TABLE IF NOT EXISTS vendedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  marca  VARCHAR(100) NOT NULL,
  talla  VARCHAR(20)  NOT NULL,
  categoria VARCHAR(100) NULL,
  precio_compra DECIMAL(10,2) NULL,
  precio_venta  DECIMAL(10,2) NULL,
  stock INT DEFAULT 0,
  descripcion TEXT NULL,
  imagen_url VARCHAR(255) NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_prod (nombre, marca, talla)
);

CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  vendedor_id INT NULL,
  fecha_adquisicion DATE NOT NULL,
  fecha_venta DATE NOT NULL,
  precio_unitario_compra DECIMAL(10,2) NOT NULL,
  precio_unitario_venta  DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(5,2) DEFAULT 0,
  precio_final DECIMAL(10,2) NOT NULL,
  ingreso_total DECIMAL(10,2) NOT NULL,
  costo_total DECIMAL(10,2) NOT NULL,
  ganancia_total DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_ventas_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_ventas_vendedor FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)
);
