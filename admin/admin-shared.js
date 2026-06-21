const statusPill = (status) => `<span class="status-pill status-${status}">${(status || 'new').replaceAll('_', ' ')}</span>`;
const escapeHtml = (value = '') => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slugify = (value = '') => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const showPageMessage = (text, type = 'error') => { const n = document.querySelector('[data-page-message]'); if (n) n.innerHTML = text ? `<div class="notice ${type}">${text}</div>` : ''; };
const getPublicUrl = (supabase, bucket, path) => supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
const uploadFile = async (supabase, bucket, file, folder, onProgress) => {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  onProgress?.(`Uploading ${file.name}...`);
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  onProgress?.(`Uploaded ${file.name}`);
  return { path, publicUrl: getPublicUrl(supabase, bucket, path) };
};
const validateFile = (file, kind) => {
  const rules = { image: [/^image\/(jpeg|png|webp|gif)$/, 10], video: [/^video\/(mp4|webm|quicktime)$/, 100], pdf: [/^application\/pdf$/, 20] }[kind];
  if (!rules[0].test(file.type)) throw new Error(`Invalid ${kind} file type: ${file.name}`);
  if (file.size > rules[1] * 1024 * 1024) throw new Error(`${file.name} exceeds ${rules[1]}MB.`);
};
const bootAdmin = async (allowedRoles, callback) => {
  try {
    const context = await window.AdminAuth.requireAdminSession({ allowedRoles });
    if (!context) return;
    window.AdminAuth.wireAdminShell(context);
    if (context.unauthorized) return showPageMessage('You do not have permission to access this admin page.', 'warning');
    await callback(context);
  } catch (error) { showPageMessage(error.message || 'Unable to load page.'); }
};
window.AdminShared = { statusPill, escapeHtml, slugify, showPageMessage, getPublicUrl, uploadFile, validateFile, bootAdmin };
