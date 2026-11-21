export const ROLES = [
  { key: "restaurant", label: "Restaurant", path: "/restaurant", description: "Post surplus food and track its pickup.", accent: "accent-restaurant" },
  { key: "ngo", label: "NGO / Community Kitchen", path: "/ngo", description: "Discover suitable donations and arrange collection.", accent: "accent-ngo" },
  { key: "volunteer", label: "Volunteer", path: "/volunteer", description: "Coordinate pickups and deliveries.", accent: "accent-volunteer" },
];

export function getRole(key) {
  return ROLES.find((r) => r.key === key);
}
