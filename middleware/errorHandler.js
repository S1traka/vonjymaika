// Middleware pour capturer et formater les erreurs
export const errorHandler = (err, req, res, next) => {
  console.error("Erreur:", err.stack)

  const statusCode = err.statusCode || 500
  const message = err.message || "Une erreur est survenue sur le serveur"

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  })
}

// Middleware pour gérer les routes non trouvées
export const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

