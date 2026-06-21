const {
    bootAdmin,
    escapeHtml,
    statusPill,
    showPageMessage
} = window.AdminShared;

const configs = {
    contact: {
        table: 'contact_messages',
        cols: [
            'name',
            'email',
            'phone',
            'subject',
            'message'
        ]
    },

    volunteers: {
        table: 'volunteer_applications',
        cols: [
            'full_name',
            'email',
            'phone',
            'skills',
            'interests',
            'availability',
            'motivation'
        ]
    },

    partnerships: {
        table: 'partnership_requests',
        cols: [
            'organization',
            'contact_person',
            'email',
            'phone',
            'partnership_proposal'
        ]
    }
};

const cfg = configs[document.body.dataset.module];

bootAdmin(
    ['admin', 'editor', 'viewer'],
    async ({ supabase }) => {
        const tbody = document.querySelector('[data-submission-rows]');

        const load = async () => {
            const { data, error } = await supabase
                .from(cfg.table)
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            tbody.innerHTML =
                (data || [])
                    .map((record) => `
                        <tr>
                            <td>
                                ${escapeHtml(record[cfg.cols[0]])}
                                <br>
                                <small>${escapeHtml(record.email)}</small>
                            </td>

                            <td>
                                ${statusPill(record.status)}
                            </td>

                            <td>
                                ${escapeHtml(
                                    new Date(record.created_at)
                                        .toLocaleString()
                                )}
                            </td>

                            <td>
                                ${cfg.cols
                                    .map(
                                        (column) => `
                                            <strong>
                                                ${column.replaceAll('_', ' ')}:
                                            </strong>
                                            ${escapeHtml(record[column] || '')}
                                        `
                                    )
                                    .join('<br>')}

                                <br>

                                <label>
                                    Admin notes

                                    <textarea
                                        data-notes="${record.id}"
                                    >${escapeHtml(
                                        record.admin_notes || ''
                                    )}</textarea>
                                </label>
                            </td>

                            <td>
                                <select data-status="${record.id}">
                                    <option>new</option>
                                    <option>in_review</option>
                                    <option>responded</option>
                                    <option>closed</option>
                                    <option>spam</option>
                                </select>

                                <button
                                    class="btn btn-primary"
                                    data-save="${record.id}"
                                >
                                    Save
                                </button>
                            </td>
                        </tr>
                    `)
                    .join('') ||
                `
                    <tr>
                        <td colspan="5">
                            No submissions.
                        </td>
                    </tr>
                `;

            (data || []).forEach((record) => {
                const statusSelect = document.querySelector(
                    `[data-status="${record.id}"]`
                );

                if (statusSelect) {
                    statusSelect.value = record.status;
                }
            });

            document
                .querySelectorAll('[data-save]')
                .forEach((button) => {
                    button.onclick = () =>
                        save(button.dataset.save);
                });
        };

        const save = async (id) => {
            const status = document.querySelector(
                `[data-status="${id}"]`
            ).value;

            const adminNotes = document.querySelector(
                `[data-notes="${id}"]`
            ).value;

            const { error } = await supabase
                .from(cfg.table)
                .update({
                    status,
                    admin_notes: adminNotes
                })
                .eq('id', id);

            if (error) {
                throw error;
            }

            await supabase.rpc(
                'log_audit_event',
                {
                    entity_type: cfg.table,
                    entity_id: id,
                    action: 'review'
                }
            );

            showPageMessage(
                'Submission updated.',
                'success'
            );

            await load();
        };

        await load();
    }
);
