// Matrice des droits pour l'application VonjyMaika
// Basée sur la matrice fournie

// Types d'utilisateurs:
// - visitor: Visiteur non connecté
// - user: Utilisateur simple enregistré
// - child: Enfant (compte familial)
// - parent: Parent (compte familial)
// - field: Agent de terrain (entreprise cliente)
// - manager: Manager (entreprise cliente)
// - admin: Administrateur interne
// - authority: Autorités

const PERMISSIONS = {
  // Fonctionnalités de carte
  MAP_VIEW: ["visitor", "user", "child", "parent", "field", "manager", "admin", "authority"],
  MAP_EVENTS: ["user", "child", "parent", "field", "manager", "admin", "authority"],
  OFFLINE_MAP: ["user", "child", "parent", "field", "manager", "admin", "authority"],

  // Signalement et alertes
  REPORT_EVENT: ["user", "parent", "field", "manager", "admin", "authority"],
  EMERGENCY_CALL: ["user", "child", "parent", "field", "manager", "admin"],

  // Visualisation des utilisateurs
  VIEW_OTHER_USERS: ["parent", "field", "manager", "admin", "authority"],

  // Notifications
  EVENT_NOTIFICATIONS: ["user", "parent", "field", "manager", "admin", "authority"],
  DANGER_NOTIFICATIONS: ["user", "child", "parent", "field", "manager", "admin"],

  // Gestion des événements
  CRUD_EVENTS: ["manager", "admin", "authority"],

  // Réception d'alertes
  RECEIVE_ALERTS: ["parent", "field", "manager", "admin", "authority"],
  RECEIVE_EVENTS: ["field", "manager", "admin", "authority"],

  // Astuces de survie
  SURVIVAL_TIPS: ["visitor", "user", "child", "parent", "field", "manager", "admin", "authority"],

  // Gestion des équipes
  MANAGE_TEAMS: ["manager", "admin"],
  JOIN_TEAMS: ["field", "manager"],

  // Administration
  ADMIN_DASHBOARD: ["admin"],
  MANAGE_USERS: ["admin"],
  MANAGE_REWARDS: ["admin"],
}

// Fonction pour vérifier si un utilisateur a une permission spécifique
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false

  // Convertir le rôle utilisateur au format attendu par la matrice
  let role
  switch (userRole) {
    case "admin":
      role = "admin"
      break
    case "manager":
      role = "manager"
      break
    case "user":
      role = "user"
      break
    case "child":
      role = "child"
      break
    case "parent":
      role = "parent"
      break
    case "field":
      role = "field"
      break
    case "authority":
      role = "authority"
      break
    default:
      role = "visitor"
  }

  return PERMISSIONS[permission] && PERMISSIONS[permission].includes(role)
}

// Fonction pour obtenir toutes les permissions d'un utilisateur
export const getUserPermissions = (userRole) => {
  const userPermissions = []

  for (const [permission, roles] of Object.entries(PERMISSIONS)) {
    if (hasPermission(userRole, permission)) {
      userPermissions.push(permission)
    }
  }

  return userPermissions
}

export default PERMISSIONS

