const ADMIN_ROLES = ["admin", "editor", "media_manager", "viewer"];
const EVENT_EDITOR_ROLES = ["admin", "editor"];

const normalizeRole = (role) => role || "viewer";

const getSupabaseOrThrow = () => {
  if (!window.memarsSupabase) {
    throw new Error("Supabase is not configured. Update lib/supabase-config.js before using the admin area.");
  }

  return window.memarsSupabase;
};

const hasAnyRole = (profile, roles) => {
  const userRoles = profile?.roles?.length ? profile.roles : [normalizeRole(profile?.role)];
  return userRoles.some((role) => roles.includes(role));
};

const roleLabel = (profile) => {
  const roles = profile?.roles?.length ? profile.roles : [normalizeRole(profile?.role)];
  return roles.map((role) => role.replace("_", " ")).join(", ");
};

const redirectToLogin = () => {
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/admin/login.html?next=${next}`;
};

const loadProfile = async (supabase, userId) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;
  if (!profile?.is_active) throw new Error("Your admin account is inactive. Contact an administrator.");

  const { data: roleRows, error: rolesError } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (rolesError) throw rolesError;

  return {
    ...profile,
    roles: roleRows?.map((row) => row.roles?.name).filter(Boolean) || []
  };
};

const requireAdminSession = async ({ allowedRoles = ADMIN_ROLES } = {}) => {
  const supabase = getSupabaseOrThrow();
  const { data: sessionData, error } = await supabase.auth.getSession();

  if (error) throw error;
  if (!sessionData.session) {
    redirectToLogin();
    return null;
  }

  const profile = await loadProfile(supabase, sessionData.session.user.id);

  if (!hasAnyRole(profile, allowedRoles)) {
    return { supabase, session: sessionData.session, profile, unauthorized: true };
  }

  return { supabase, session: sessionData.session, profile, unauthorized: false };
};

const wireAdminShell = ({ profile }) => {
  document.querySelectorAll("[data-admin-name]").forEach((node) => {
    node.textContent = profile.full_name || profile.email || "Admin User";
  });

  document.querySelectorAll("[data-admin-role]").forEach((node) => {
    node.textContent = roleLabel(profile);
  });

  document.querySelectorAll("[data-editor-only]").forEach((node) => {
    node.classList.toggle("hidden", !hasAnyRole(profile, EVENT_EDITOR_ROLES));
  });
};

const logout = async () => {
  const supabase = getSupabaseOrThrow();
  await supabase.auth.signOut();
  window.location.href = "/admin/login.html";
};

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-logout]");
  if (trigger) {
    event.preventDefault();
    logout();
  }
});

window.AdminAuth = {
  ADMIN_ROLES,
  EVENT_EDITOR_ROLES,
  getSupabaseOrThrow,
  hasAnyRole,
  roleLabel,
  requireAdminSession,
  wireAdminShell,
  logout
};
