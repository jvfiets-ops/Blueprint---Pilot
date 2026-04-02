// Pilot mode: no authentication needed.
// Returns a fixed user for all API calls.
// Data is shared across all pilot users (no multi-tenancy in pilot).

const PILOT_USER = {
  id: "pilot-user",
  name: "Pilot",
  email: "pilot@blueprint.app",
  role: "admin",
};

export async function getCurrentUser() {
  return PILOT_USER;
}

export async function requireUser() {
  return PILOT_USER;
}
