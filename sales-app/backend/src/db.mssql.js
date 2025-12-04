// Conexión a SQL Server usando mssql
import sql from 'mssql';

const config = {
  user: 'TU_USUARIO',
  password: 'TU_CONTRASEÑA',
  server: 'localhost', // Cambia si usas otro servidor
  database: 'TU_BASE_DE_DATOS',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server');
    return pool;
  })
  .catch(err => console.log('Error de conexión a SQL Server', err));

export default poolPromise;
