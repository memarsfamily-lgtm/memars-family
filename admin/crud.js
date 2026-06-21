const { bootAdmin, escapeHtml, statusPill, slugify, showPageMessage } = window.AdminShared;
const configs = {
  news: { table: 'news', title: 'News & Success Stories', roles: ['admin','editor'], fields: ['title','slug','category','summary','content','publish_date','featured','status','seo_description'], order: 'publish_date' },
  reports: { table: 'reports', title: 'Reports Library', roles: ['admin','editor'], fields: ['title','slug','category','description','publication_date','featured','status','seo_description'], order: 'publication_date' }
};
const mode = document.body.dataset.module;
const cfg = configs[mode];
bootAdmin(cfg.roles, async ({ supabase, session }) => {
  const form = document.querySelector('[data-crud-form]');
  const tbody = document.querySelector('[data-crud-rows]');
  const fileInput = document.querySelector('[data-file]');
  let editingId = null;
  const load = async () => {
    const { data, error } = await supabase.from(cfg.table).select('*').is('deleted_at', null).order(cfg.order, { ascending: false, nullsFirst: false });
    if (error) throw error;
    tbody.innerHTML = (data || []).map((row) => `<tr><td><strong>${escapeHtml(row.title)}</strong><br><small>${escapeHtml(row.slug)}</small></td><td>${escapeHtml(row.category)}</td><td>${statusPill(row.status)}</td><td>${row.featured ? 'Yes' : 'No'}</td><td class="actions"><button class="btn btn-light" data-edit="${row.id}">Edit</button><button class="btn btn-danger" data-delete="${row.id}">Archive</button></td></tr>`).join('') || '<tr><td colspan="5">No records yet.</td></tr>';
    document.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => edit(data.find((r) => r.id === b.dataset.edit)));
    document.querySelectorAll('[data-delete]').forEach((b) => b.onclick = () => remove(b.dataset.delete));
  };
  const edit = (row) => { editingId = row.id; cfg.fields.forEach((f) => { const el = form.elements[f]; if (!el) return; if (el.type === 'checkbox') el.checked = !!row[f]; else el.value = row[f] || ''; }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (id) => { const { error } = await supabase.from(cfg.table).update({ status: 'archived', deleted_at: new Date().toISOString() }).eq('id', id); if (error) throw error; await supabase.rpc('log_audit_event', { entity_type: cfg.table, entity_id: id, action: 'archive' }); await load(); };
  form.title.addEventListener('input', () => { if (!form.slug.value) form.slug.value = slugify(form.title.value); });
  form.addEventListener('reset', () => { editingId = null; });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    values.featured = form.featured.checked;
    values.published_at = values.status === 'published' ? new Date().toISOString() : null;
    if (!values.slug) values.slug = slugify(values.title);
    if (mode === 'news') values.author_id = session.user.id;
    if (mode === 'reports') {
      values.author_id = session.user.id;
      if (fileInput.files[0]) {
        window.AdminShared.validateFile(fileInput.files[0], 'pdf');
        const uploaded = await window.AdminShared.uploadFile(supabase, 'report-documents', fileInput.files[0], 'reports', showPageMessage);
        values.file_path = uploaded.path; values.public_url = uploaded.publicUrl;
      }
      if (!editingId && !values.file_path) return showPageMessage('Upload a PDF before saving a new report.');
    }
    const query = editingId ? supabase.from(cfg.table).update(values).eq('id', editingId).select().single() : supabase.from(cfg.table).insert(values).select().single();
    const { data, error } = await query; if (error) throw error;
    await supabase.rpc('log_audit_event', { entity_type: cfg.table, entity_id: data.id, action: editingId ? 'update' : 'create' });
    form.reset(); editingId = null; showPageMessage('Saved successfully.', 'success'); await load();
  });
  await load();
});
