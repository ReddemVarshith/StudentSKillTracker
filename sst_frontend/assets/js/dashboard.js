document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('sst_token')) {
        window.location.href = '../index.html';
        return;
    }

    const logoutBtn = document.getElementById('nav-logout');
    const editProfileBtn = document.getElementById('nav-edit-profile');
    const statsContainer = document.getElementById('stats-container');

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('sst_token');
        window.location.href = '../index.html';
    });

    editProfileBtn.addEventListener('click', () => {
        window.location.href = 'setup.html';
    });

    try {
        // 1. Fetch User Profile
        const profile = await api.getMe();

        if (!profile || !profile.hall_ticket_number || !profile.email_id || !profile.name) {
            // Profile incomplete
            window.location.href = 'setup.html';
            return;
        }

        // Render Sidebar
        document.getElementById('sidebar-name').textContent = profile.name || "Student";
        document.getElementById('sidebar-dept').textContent = `${profile.department || ''} ${profile.batch ? `(${profile.batch})` : ''}`;
        document.getElementById('user-initial').textContent = profile.name ? profile.name.charAt(0).toUpperCase() : "S";

        // 2. Fetch Aggregated Stats
        const params = new URLSearchParams();
        if (profile.leetcode_username) params.append('leetcode', profile.leetcode_username);
        if (profile.codechef_username) params.append('codechef', profile.codechef_username);
        if (profile.gfg_username) params.append('gfg', profile.gfg_username);
        if (profile.hackerrank_username) params.append('hackerrank', profile.hackerrank_username);

        const queryUrl = params.toString() ? `?${params.toString()}` : '';
        const stats = await api.getAggregatedStats(queryUrl);

        // Render Stats
        renderStats(stats, profile);

    } catch (err) {
        console.error("Dashboard Error:", err);
        statsContainer.innerHTML = `<div class="error-box" style="grid-column: 1/-1;">Error loading dashboard data: ${err.message}</div>`;
    }

    function renderStats(stats, profile) {
        statsContainer.innerHTML = ''; // Clear Skeletons

        // Helper to generate a stat card HTML
        const createCard = (platform, username, data, colorClass, metricsHtml) => {
            if (!username) {
                return `
                <div class="glass-panel stat-card ${colorClass}" style="opacity: 0.5;">
                    <div class="platform-header">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            ${platform}
                        </span>
                        <span style="font-size: 0.8rem; color: var(--text-muted)">Not Connected</span>
                    </div>
                    <div style="font-size: 0.85rem; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                        Connect your ${platform} username in Edit Profile to track statistics.
                    </div>
                </div>`;
            }

            if (!data) {
                return `
                <div class="glass-panel stat-card ${colorClass}">
                    <div class="platform-header">
                        <span>${platform}</span>
                        <a href="#" target="_blank" style="font-size: 0.85rem;">@${username}</a>
                    </div>
                    <div class="error-box" style="margin-top:0;">Failed to fetch API data or user not found.</div>
                </div>`;
            }

            return `
            <div class="glass-panel stat-card ${colorClass}">
                <div class="platform-header">
                    <span>${platform}</span>
                    <span style="font-size: 0.85rem; color: var(--text-muted)">@${username}</span>
                </div>
                <div class="metrics">
                    ${metricsHtml}
                </div>
            </div>`;
        };

        // --- LeetCode ---
        const lcMetrics = stats.leetcode ? `
            <div class="metric"><div class="metric-label">Problems Solved</div><div class="metric-value">${stats.leetcode.solved || 0}</div></div>
            <div class="metric"><div class="metric-label">Global Rank</div><div class="metric-value">${stats.leetcode.ranking ? stats.leetcode.ranking.toLocaleString() : 'N/A'}</div></div>
        ` : '';
        statsContainer.innerHTML += createCard('LeetCode', profile.leetcode_username, stats.leetcode, 'leetcode', lcMetrics);

        // --- CodeChef ---
        const ccMetrics = stats.codechef ? `
            <div class="metric"><div class="metric-label">Rating</div><div class="metric-value" style="color: var(--codechef)">${stats.codechef.rating || 0}</div></div>
            <div class="metric"><div class="metric-label">Stars</div><div class="metric-value">${stats.codechef.stars || '0★'}</div></div>
            <div class="metric"><div class="metric-label">Global Rank</div><div class="metric-value">${stats.codechef.global_rank || 'N/A'}</div></div>
        ` : '';
        statsContainer.innerHTML += createCard('CodeChef', profile.codechef_username, stats.codechef, 'codechef', ccMetrics);

        // --- GeeksForGeeks ---
        const gfgMetrics = stats.gfg ? `
            <div class="metric"><div class="metric-label">Coding Score</div><div class="metric-value" style="color: var(--gfg)">${stats.gfg.score || 0}</div></div>
            <div class="metric"><div class="metric-label">Problems Solved</div><div class="metric-value">${stats.gfg.problems_solved || 0}</div></div>
        ` : '';
        statsContainer.innerHTML += createCard('GeeksForGeeks', profile.gfg_username, stats.gfg, 'gfg', gfgMetrics);

        // --- HackerRank ---
        // Hackerrank returns badges array
        let hrBadges = '';
        if (stats.hackerrank && stats.hackerrank.badges && stats.hackerrank.badges.length > 0) {
            hrBadges = `<div class="metric" style="grid-column: span 2;"><div class="metric-label">Badges</div>
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
                ${stats.hackerrank.badges.map(b => `<span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${b.name} (${b.stars}★)</span>`).join('')}
                </div></div>`;
        } else if (stats.hackerrank) {
            hrBadges = `<div class="metric" style="grid-column: span 2;"><div class="metric-label">Badges</div><div class="metric-value" style="font-size:1rem;font-weight:400;color:var(--text-muted);">No badges visible</div></div>`;
        }

        statsContainer.innerHTML += createCard('HackerRank', profile.hackerrank_username, stats.hackerrank, 'hackerrank', hrBadges);

        // Render Chart
        renderChart(stats);
    }

    function renderChart(stats) {
        const ctx = document.getElementById('skillsChart').getContext('2d');

        let lc = stats.leetcode ? stats.leetcode.solved : 0;
        let cc = stats.codechef ? stats.codechef.rating : 0;
        let gf = stats.gfg ? stats.gfg.score : 0;
        let hr = stats.hackerrank && stats.hackerrank.badges ? stats.hackerrank.badges.length * 100 : 0; // scale badges for visibility

        if (lc === 0 && cc === 0 && gf === 0 && hr === 0) {
            // No data to chart
            document.getElementById('skillsChart').parentElement.innerHTML = '<div style="color:var(--text-muted); display:flex; align-items:center;">No data available to chart</div>';
            return;
        }

        new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['LeetCode (Solved)', 'CodeChef (Rating)', 'GFG (Score)', 'HackerRank (Scaled)'],
                datasets: [{
                    data: [lc, cc, gf, hr],
                    backgroundColor: [
                        'rgba(234, 179, 8, 0.5)',   // LeetCode
                        'rgba(168, 85, 247, 0.5)',  // CodeChef
                        'rgba(34, 197, 94, 0.5)',   // GFG
                        'rgba(59, 130, 246, 0.5)'   // HackerRank
                    ],
                    borderColor: [
                        'rgba(234, 179, 8, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        ticks: { display: false },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#f8fafc', font: { family: 'Inter' } }
                    }
                }
            }
        });
    }
});
