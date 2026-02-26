document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('sst_token')) {
        window.location.href = '../index.html';
        return;
    }

    const form = document.getElementById('setupForm');
    const errorBox = document.getElementById('setup-error');
    const btn = form.querySelector('button');

    // Attempt to preload existing data
    try {
        const profile = await api.getMe();
        if (profile && profile.hall_ticket_number) {
            // Populate logic
            document.getElementById('hall_ticket_number').value = profile.hall_ticket_number || '';
            document.getElementById('name').value = profile.name || '';
            document.getElementById('email_id').value = profile.email_id || '';
            document.getElementById('department').value = profile.department || 'CSE';
            document.getElementById('section').value = profile.section || 'A';
            document.getElementById('batch').value = profile.batch || '2023-2027';
            document.getElementById('leetcode_username').value = profile.leetcode_username || '';
            document.getElementById('codechef_username').value = profile.codechef_username || '';
            document.getElementById('gfg_username').value = profile.gfg_username || '';
            document.getElementById('hackerrank_username').value = profile.hackerrank_username || '';
            // Change button text if updating
            btn.textContent = "Update Profile";
        }
    } catch (err) {
        // Assume failure means it isn't set up yet, which is fine
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        btn.textContent = "Saving...";
        btn.disabled = true;
        errorBox.classList.add('hidden');

        const payload = {
            hall_ticket_number: document.getElementById('hall_ticket_number').value,
            name: document.getElementById('name').value,
            email_id: document.getElementById('email_id').value,
            department: document.getElementById('department').value,
            section: document.getElementById('section').value,
            batch: document.getElementById('batch').value,
            leetcode_username: document.getElementById('leetcode_username').value || null,
            codechef_username: document.getElementById('codechef_username').value || null,
            gfg_username: document.getElementById('gfg_username').value || null,
            hackerrank_username: document.getElementById('hackerrank_username').value || null,
        };

        try {
            await api.updateMe(payload);
            window.location.href = 'dashboard.html';
        } catch (err) {
            errorBox.textContent = err.message || "Failed to update profile. Make sure Hall Ticket and Email are unique.";
            errorBox.classList.remove('hidden');
            btn.textContent = "Save to Dashboard";
            btn.disabled = false;
        }
    });

});
