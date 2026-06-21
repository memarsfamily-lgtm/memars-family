const showPageMessage = (text, type = "error") => {
  const node = document.querySelector("[data-page-message]");
  if (node) node.innerHTML = text ? `<div class="notice ${type}">${text}</div>` : "";
};

const countStatus = (events, status) => events.filter((event) => event.status === status).length;

(async () => {
  try {
    const context = await window.AdminAuth.requireAdminSession();
    if (!context) return;

    window.AdminAuth.wireAdminShell(context);

    if (context.unauthorized) {
      showPageMessage("You are signed in but do not have permission to access the admin dashboard.", "warning");
      return;
    }

    const { data, error } = await context.supabase
      .from("events")
      .select("id, status")
      .is("deleted_at", null);

    if (error) throw error;

    const events = data || [];
    document.querySelector("[data-total-events]").textContent = events.length;
    document.querySelector("[data-published-events]").textContent = countStatus(events, "published");
    document.querySelector("[data-draft-events]").textContent = countStatus(events, "draft");
    document.querySelector("[data-archived-events]").textContent = countStatus(events, "archived");
  } catch (error) {
    showPageMessage(error.message || "Unable to load dashboard.");
  }
})();
