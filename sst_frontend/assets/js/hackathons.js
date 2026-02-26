document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('sst_token')) {
        window.location.href = '../index.html';
        return;
    }

    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('sst_token');
            window.location.href = '../index.html';
        });
    }

    // Modal Control
    const modal = document.getElementById('addHackathonModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');

    openBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    // Conditional Fields Toggle
    const wonCheckbox = document.getElementById('won_checkbox');
    const winnerFields = document.getElementById('winnerFields');

    wonCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            winnerFields.classList.add('active');
            // Mark conditionally required fields
            document.getElementById('place').required = true;
            document.getElementById('project_title').required = true;
            document.getElementById('winning_certificate').required = true;
        } else {
            winnerFields.classList.remove('active');
            // Unmark conditionally required fields
            document.getElementById('place').required = false;
            document.getElementById('project_title').required = false;
            document.getElementById('winning_certificate').required = false;
        }
    });

    // Hydrate User Sidebar
    try {
        const profile = await api.getMe();

        if (!profile || !profile.hall_ticket_number || !profile.email_id || !profile.name) {
            window.location.href = 'setup.html';
            return;
        }

        if (profile) {
            document.getElementById('sidebar-name').textContent = profile.name || "Student";
            document.getElementById('sidebar-dept').textContent = `${profile.department || ''} ${profile.batch ? `(${profile.batch})` : ''}`;
            document.getElementById('user-initial').textContent = profile.name ? profile.name.charAt(0).toUpperCase() : "S";
        }
    } catch (e) {
        console.error("Failed to load user profile", e);
    }

    // Load Existing Hackathons
    async function loadHackathons() {
        const container = document.getElementById('hackathons-container');
        try {
            const data = await api.request('/hackathons/');
            container.innerHTML = ''; // Clear loading

            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 12px; background: rgba(0,0,0,0.2);">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 16px; opacity: 0.5;">
                            <path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z"></path>
                        </svg>
                        <h3 style="margin-bottom: 8px; color: white;">No Hackathons Logged</h3>
                        <p>Track your hackathons and certifications to boost your profile score.</p>
                    </div>`;
                return;
            }

            data.forEach(h => {
                const isWinner = h.won;
                const linkLabel = isWinner ? "View Winning Cert" : "View Participation";
                const certLink = isWinner && h.winning_certificate ? h.winning_certificate : h.participation_certificate;

                const cardHtml = `
                    <div class="hackathon-card">
                        ${isWinner
                        ? `<div class="card-badge badge-winner">🏆 ${h.place || 'Winner'}</div>`
                        : `<div class="card-badge badge-participant">Participant</div>`}
                        
                        <h3 style="font-size: 1.25rem; margin-right: 80px; color: white;">${h.hackathon_name}</h3>
                        <div style="font-size: 0.9rem; color: var(--text-muted);">
                            By ${h.conducted_by} &bull; ${h.date}
                        </div>
                        
                        ${isWinner && h.project_title ? `
                            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Winning Project</div>
                                <div style="font-weight: 500; color: #fbbf24;">${h.project_title} ${h.domain ? `(${h.domain})` : ''}</div>
                                ${h.prize_money ? `<div style="font-size: 0.85rem; margin-top: 4px; font-weight: bold;">💰 ${h.prize_money}</div>` : ''}
                            </div>
                        ` : ''}
                        
                        <div style="margin-top: auto; padding-top: 16px;">
                            ${certLink ? `
                                <a href="${certLink}" target="_blank" style="text-decoration: none; display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-radius: 8px; background: rgba(99,102,241,0.1); color: var(--primary); transition: background 0.2s;">
                                    <span style="font-size: 0.9rem; font-weight: 600;">${linkLabel}</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </a>
                            ` : `<span style="font-size: 0.85rem; color: var(--error);">Certificate Missing</span>`}
                        </div>
                    </div>
                `;
                container.innerHTML += cardHtml;
            });

        } catch (err) {
            container.innerHTML = `<div class="error-box" style="grid-column: 1/-1">${err.message}</div>`;
        }
    }

    loadHackathons();

    // Form Submission
    const form = document.getElementById('hackathonForm');
    const errorBox = document.getElementById('hackathon-error');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.classList.add('hidden');
        submitBtn.textContent = "Uploading...";
        submitBtn.disabled = true;

        const formData = new FormData();
        formData.append('hackathon_name', document.getElementById('hackathon_name').value);
        formData.append('conducted_by', document.getElementById('conducted_by').value);
        formData.append('date', document.getElementById('date').value);

        const filePart = document.getElementById('participation_certificate').files[0];
        if (filePart) formData.append('participation_certificate', filePart);

        const isWinner = wonCheckbox.checked;
        formData.append('won', isWinner ? 'true' : 'false');

        if (isWinner) {
            formData.append('place', document.getElementById('place').value);
            formData.append('prize_money', document.getElementById('prize_money').value || '');
            formData.append('project_title', document.getElementById('project_title').value);
            formData.append('domain', document.getElementById('domain').value || '');

            const fileWin = document.getElementById('winning_certificate').files[0];
            if (fileWin) formData.append('winning_certificate', fileWin);
        }

        try {
            const token = localStorage.getItem('sst_token');
            const res = await fetch(`${api.baseUrl}/hackathons/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`
                    // Do not set Content-Type, browser handles multipart boundaries automatically
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || JSON.stringify(errData) || "Upload failed");
            }

            // Success
            modal.classList.remove('active');
            form.reset();
            winnerFields.classList.remove('active');
            wonCheckbox.checked = false;

            // Reload list
            loadHackathons();

        } catch (err) {
            errorBox.textContent = `Error: ${err.message}`;
            errorBox.classList.remove('hidden');
        } finally {
            submitBtn.textContent = "Submit Verification";
            submitBtn.disabled = false;
        }
    });
});
