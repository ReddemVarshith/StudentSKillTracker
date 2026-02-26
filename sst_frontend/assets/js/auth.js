document.addEventListener('DOMContentLoaded', () => {
    // Token check - Redirect to dashboard if already logged in
    if (localStorage.getItem('sst_token')) {
        window.location.href = 'pages/dashboard.html';
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const errorBox = document.getElementById('auth-error');

    // UI Toggles
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        errorBox.classList.add('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        errorBox.classList.add('hidden');
    });

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.classList.remove('hidden');
    }

    // Login Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('button');
        btn.textContent = "Signing In...";
        btn.disabled = true;

        try {
            const data = await api.login(
                document.getElementById('login-username').value,
                document.getElementById('login-password').value
            );

            localStorage.setItem('sst_token', data.token);
            window.location.href = 'pages/dashboard.html';
        } catch (err) {
            showError(err.message);
        } finally {
            btn.textContent = "Sign In";
            btn.disabled = false;
        }
    });

    // Register Handler
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = registerForm.querySelector('button');
        btn.textContent = "Creating...";
        btn.disabled = true;

        try {
            const data = await api.register(
                document.getElementById('reg-username').value,
                document.getElementById('reg-password').value
            );

            localStorage.setItem('sst_token', data.token);
            // After register, send them to fill out their profile explicitly
            window.location.href = 'pages/setup.html';
        } catch (err) {
            showError(err.message || 'Registration failed.');
        } finally {
            btn.textContent = "Create Account";
            btn.disabled = false;
        }
    });
});
