import jwt from "jsonwebtoken"

// Middleware d'authentification
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return res.status(401).json({ message: "Accès non autorisé" })

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide" })
    req.user = user
    next()
  })
}

// Middleware pour vérifier si l'utilisateur est un admin
export const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Accès non autorisé" })

  if (req.user.role === "admin" || req.user.isSuperUser) {
    next()
  } else {
    return res.status(403).json({ message: "Accès refusé: droits d'administrateur requis" })
  }
}

// Middleware pour vérifier si l'utilisateur est un manager ou un admin
export const isManagerOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Accès non autorisé" })

  if (req.user.role === "admin" || req.user.role === "manager" || req.user.isSuperUser) {
    next()
  } else {
    return res.status(403).json({ message: "Accès refusé: droits de manager requis" })
  }
}

// Middleware pour vérifier si l'utilisateur est le propriétaire de la ressource ou un admin
export const isOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Accès non autorisé" })

    if (req.user.id === resourceUserId || req.user.role === "admin" || req.user.isSuperUser) {
      next()
    } else {
      return res.status(403).json({ message: "Accès refusé: vous n'êtes pas autorisé à accéder à cette ressource" })
    }
  }
}

