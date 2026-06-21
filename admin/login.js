const form = document.querySelector("[data-login-form]");
const message = document.querySelector("[data-login-message]");
const submit = document.querySelector("[data-login-submit]");

const showMessage = (text, type = "error") => {
  message.innerHTML = text ? `<div class="notice ${type}">${text}</div>` : "";
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");
  submit.disabled = true;
  submit.textContent = "Signing in...";

  try {
    const supabase = window.AdminAuth.getSupabaseOrThrow();
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get("next") || "/admin/";
  } catch (error) {
    showMessage(error.message || "Unable to sign in. Please try again.");
  } finally {
    submit.disabled = false;
    submit.textContent = "Sign in";
  }
});
