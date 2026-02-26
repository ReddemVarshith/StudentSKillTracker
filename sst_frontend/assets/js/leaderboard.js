// Leaderboard Page API and Renderer
document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth
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

    // Hydrate User Sidebar
    try {
        const profile = await api.getMe();

        if (!profile || !profile.hall_ticket_number || !profile.email_id || !profile.name) {
            // Profile incomplete
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

    const tableBody = document.getElementById('leaderboard-body');
    const rankTop3 = document.getElementById('rank-top-3');
    const tableHeadRow = document.getElementById('table-head-row');
    const scoreHeader = document.getElementById('score-header');

    let currentPlatform = 'total';
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlatform = btn.dataset.platform;
            fetchLeaderboard();
        });
    });

    function setHtmlLoading() {
        const colCount = currentPlatform === 'total' ? 5 : 3;
        tableBody.innerHTML = `<tr><td colspan="${colCount}" class="text-center" style="padding: 60px 24px;">
            <div style="display: flex; justify-content: center; align-items: center; gap: 12px; color: var(--primary);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <span style="font-weight:600;">Loading Leaderboard...</span>
            </div>
            </td></tr>`;
        rankTop3.innerHTML = '';
        if (!document.getElementById('spin-style')) {
            const style = document.createElement('style');
            style.id = 'spin-style';
            style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }
    }

    async function fetchLeaderboard() {
        setHtmlLoading();
        try {
            const data = await api.request(`/leaderboard/?platform=${currentPlatform}`, { method: 'GET' });

            if (!data || data.length === 0) {
                const colCount = currentPlatform === 'total' ? 5 : 3;
                tableBody.innerHTML = `<tr><td colspan="${colCount}" class="text-center" style="padding: 24px;">No students on the leaderboard yet!</td></tr>`;
                rankTop3.innerHTML = '';
                return;
            }

            renderLeaderboard(data, currentPlatform);
        } catch (err) {
            console.error("Leaderboard Error:", err);
            const colCount = currentPlatform === 'total' ? 5 : 3;
            tableBody.innerHTML = `<tr><td colspan="${colCount}" class="error-box text-center">Failed to load leaderboard: ${err.message}</td></tr>`;
        }
    }

    // Initial Fetch
    fetchLeaderboard();

    function renderLeaderboard(data, platform) {
        tableBody.innerHTML = '';
        rankTop3.innerHTML = '';

        let scoreKey = 'total_score';
        let scoreLabel = 'Total Score';
        if (platform === 'leetcode') { scoreKey = 'leetcode_solved'; scoreLabel = 'LeetCode Solved'; }
        else if (platform === 'codechef') { scoreKey = 'codechef_rating'; scoreLabel = 'CodeChef Rating'; }
        else if (platform === 'gfg') { scoreKey = 'gfg_score'; scoreLabel = 'GFG Score'; }
        else if (platform === 'hackerrank') { scoreKey = 'hackerrank_badges'; scoreLabel = 'HackerRank Badges'; }

        // Setup Dynamic Table Headers
        if (platform === 'total') {
            tableHeadRow.innerHTML = `
                <th>Rank</th>
                <th>Student Code</th>
                <th>LeetCode Slvd</th>
                <th>CodeChef / GFG</th>
                <th style="text-align: right;">Total Score</th>
            `;
        } else {
            tableHeadRow.innerHTML = `
                <th>Rank</th>
                <th>Student Code</th>
                <th style="text-align: right;">${scoreLabel}</th>
            `;
        }

        // Render Top 3 Podium
        const top3 = data.slice(0, 3);
        const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean); // Reorder for visual: 2nd, 1st, 3rd

        podiumOrder.forEach((student, index) => {
            const actualRank = data.indexOf(student) + 1;
            const height = actualRank === 1 ? '140px' : (actualRank === 2 ? '110px' : '90px');
            const medal = actualRank === 1 ? '🥇' : (actualRank === 2 ? '🥈' : '🥉');
            const podClass = actualRank === 1 ? 'podium-1' : (actualRank === 2 ? 'podium-2' : 'podium-3');

            rankTop3.innerHTML += `
                <div class="podium-item">
                    <div class="avatar-sm" style="margin-bottom: 8px; font-size: 1.5rem;">${medal}</div>
                    <div class="student-name" style="font-size: 0.9rem;">${student.name}</div>
                    <div class="student-score text-primary" style="font-weight: 700; font-size: 1.2rem;">${student[scoreKey]}</div>
                    <div class="podium-bar ${podClass}" style="height: ${height};"></div>
                </div>
            `;
        });

        // Render Table list
        data.forEach((student, index) => {
            const row = document.createElement('tr');

            // Highlight current user if logged in
            const activeClass = (localStorage.getItem('sst_username') === student.user?.username) ? 'active-row' : '';
            if (activeClass) row.classList.add(activeClass);

            let columnsHtml = '';
            const rankCol = `<td style="font-weight: bold; width: 60px;">#${index + 1}</td>`;
            const studentCol = `
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="avatar-xs">${student.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <div style="font-weight: 500;">${student.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${student.department} (${student.batch})</div>
                        </div>
                    </div>
                </td>
            `;

            if (platform === 'total') {
                columnsHtml = `
                    ${rankCol}
                    ${studentCol}
                    <td><span style="color: var(--leetcode);">${student.leetcode_solved}</span></td>
                    <td><span style="color: var(--codechef);">${student.codechef_rating}</span> / <span style="color: var(--gfg);">${student.gfg_score}</span></td>
                    <td style="font-weight: bold; color: var(--primary); text-align: right; font-size: 1.1rem;">${student[scoreKey]}</td>
                `;
            } else {
                columnsHtml = `
                    ${rankCol}
                    ${studentCol}
                    <td style="font-weight: bold; color: var(--primary); text-align: right; font-size: 1.1rem;">${student[scoreKey]}</td>
                `;
            }

            row.innerHTML = columnsHtml;
            tableBody.appendChild(row);
        });
    }
});
