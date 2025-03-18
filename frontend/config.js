// Configuration de l'API
export const API_URL = "https://vonjymaika-api.vercel.app"

// Configuration de l'application
export const APP_CONFIG = {
  // Paramètres de la carte
  map: {
    defaultLatitude: -18.8792, // Antananarivo
    defaultLongitude: 47.5079,
    defaultZoom: 12,
  },

  // Paramètres des incidents
  incidents: {
    severityLevels: [
      {
        id: "low",
        label: "Faible",
        color: "#4CAF50",
      },
      {
        id: "medium",
        label: "Moyen",
        color: "#FFC107",
      },
      {
        id: "high",
        label: "Élevé",
        color: "#F44336",
      },
    ],
    statusTypes: [
      {
        id: "active",
        label: "Actif",
        color: "#F44336",
      },
      {
        id: "in_progress",
        label: "En cours",
        color: "#FFC107",
      },
      {
        id: "resolved",
        label: "Résolu",
        color: "#4CAF50",
      },
    ],
  },

  // Paramètres de notification
  notifications: {
    radius: 5, // Rayon en km pour les notifications d'incidents à proximité
  },
}

