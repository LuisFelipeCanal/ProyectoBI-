// errorHandler.js
export default function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    message: err.message,
    ...(isDev && { stack: err.stack })
  });
}
