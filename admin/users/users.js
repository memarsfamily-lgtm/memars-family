const { bootAdmin, escapeHtml, showPageMessage } = window.AdminShared;
const roles = ['admin', 'editor', 'media_manager', 'viewer'];
bootAdmin(['admin'], async ({ supabase }) => {
  const tbody = document.querySelector('[data-user-rows]');

  const load = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, is_active, user_roles(id, deleted_at, roles(name))')
      .order('email');
    if (error) throw error;

    tbody.innerHTML = (data || []).map((profile) => {
      const activeRoles = (profile.user_roles || []).filter((row) => !row.deleted_at && row.roles?.name).map((row) => row.roles.name);
      const effectiveRoles = activeRoles.length ? activeRoles : [profile.role || 'viewer'];
      return `<tr>
        <td><strong>${escapeHtml(profile.full_name || 'Unnamed user')}</strong><br><small>${escapeHtml(profile.email || profile.id)}</small></td>
        <td>${profile.is_active ? 'Active' : 'Disabled'}</td>
        <td>${effectiveRoles.map((role) => `<span class="status-pill status-published">${escapeHtml(role)}</span> <button class="btn btn-light" data-remove-role="${profile.id}:${role}">Remove</button>`).join('<br>')}</td>
        <td><select data-role-select="${profile.id}">${roles.map((role) => `<option value="${role}">${role}</option>`).join('')}</select><button class="btn btn-secondary" data-assign-role="${profile.id}">Assign</button></td>
        <td class="actions"><button class="btn btn-light" data-toggle-user="${profile.id}:${profile.is_active ? 'false' : 'true'}">${profile.is_active ? 'Disable' : 'Re-enable'}</button></td>
      </tr>`;
    }).join('') || '<tr><td colspan="5">No users found.</td></tr>';

    document.querySelectorAll('[data-assign-role]').forEach((button) => button.onclick = () => assignRole(button.dataset.assignRole));
    document.querySelectorAll('[data-remove-role]').forEach((button) => button.onclick = () => removeRole(...button.dataset.removeRole.split(':')));
    document.querySelectorAll('[data-toggle-user]').forEach((button) => button.onclick = () => toggleUser(...button.dataset.toggleUser.split(':')));
  };

  const assignRole = async (userId) => {
    const role = document.querySelector(`[data-role-select="${userId}"]`).value;
    const { error } = await supabase.rpc('assign_user_role', { target_user_id: userId, role_name: role });
    if (error) throw error;
    await supabase.rpc('log_audit_event', { entity_type: 'profiles', entity_id: userId, action: 'assign_role', metadata: { role } });
    showPageMessage('Role assigned.', 'success');
    await load();
  };

  const removeRole = async (userId, role) => {
    const { error } = await supabase.rpc('remove_user_role', { target_user_id: userId, role_name: role });
    if (error) throw error;
    await supabase.rpc('log_audit_event', { entity_type: 'profiles', entity_id: userId, action: 'remove_role', metadata: { role } });
    showPageMessage('Role removed.', 'success');
    await load();
  };

  const toggleUser = async (userId, nextState) => {
    const isActive = nextState === 'true';
    const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', userId);
    if (error) throw error;
    await supabase.rpc('log_audit_event', { entity_type: 'profiles', entity_id: userId, action: isActive ? 'enable_user' : 'disable_user' });
    showPageMessage(isActive ? 'User re-enabled.' : 'User disabled.', 'success');
    await load();
  };

  await load();
});
