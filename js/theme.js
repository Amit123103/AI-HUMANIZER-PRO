/**
 * Theme Module — Light/Dark toggle + Custom accent color themes
 */
const Theme = (() => {
    const STORAGE_KEY = 'aih-theme';
    const ACCENT_KEY = 'aih-accent';

    const accents = {
        purple: { '--purple': '#6366f1', '--purple-light': '#818cf8', '--gradient-primary': 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
        blue: { '--purple': '#3b82f6', '--purple-light': '#60a5fa', '--gradient-primary': 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
        green: { '--purple': '#22c55e', '--purple-light': '#4ade80', '--gradient-primary': 'linear-gradient(135deg,#22c55e,#16a34a)' },
        pink: { '--purple': '#ec4899', '--purple-light': '#f472b6', '--gradient-primary': 'linear-gradient(135deg,#ec4899,#a855f7)' },
        orange: { '--purple': '#f97316', '--purple-light': '#fb923c', '--gradient-primary': 'linear-gradient(135deg,#f97316,#eab308)' },
    };

    const lightVars = {
        '--bg-base': '#f1f5f9',
        '--bg-surface': '#ffffff',
        '--bg-card': '#f8fafc',
        '--text-primary': '#0f172a',
        '--text-secondary': '#334155',
        '--text-muted': '#64748b',
        '--border': 'rgba(0,0,0,0.1)',
        '--border-hover': 'rgba(0,0,0,0.2)',
    };

    function applyTheme(mode) {
        const root = document.documentElement;
        if (mode === 'light') {
            Object.entries(lightVars).forEach(([k, v]) => root.style.setProperty(k, v));
            document.body.classList.add('light-mode');
        } else {
            Object.entries(lightVars).forEach(([k]) => root.style.removeProperty(k));
            document.body.classList.remove('light-mode');
        }
        localStorage.setItem(STORAGE_KEY, mode);
        updateToggleBtn(mode);
    }

    function applyAccent(name) {
        const root = document.documentElement;
        const vars = accents[name];
        if (!vars) return;
        Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
        localStorage.setItem(ACCENT_KEY, name);
        document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
        document.querySelector(`.accent-dot[data-accent="${name}"]`)?.classList.add('active');
    }

    function updateToggleBtn(mode) {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.textContent = mode === 'light' ? '🌙' : '☀️';
        btn.title = mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }

    function getMode() {
        return localStorage.getItem(STORAGE_KEY) || 'dark';
    }

    function init() {
        const savedMode = localStorage.getItem(STORAGE_KEY) || 'dark';
        const savedAccent = localStorage.getItem(ACCENT_KEY) || 'purple';
        applyTheme(savedMode);
        applyAccent(savedAccent);

        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            applyTheme(getMode() === 'dark' ? 'light' : 'dark');
        });

        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.addEventListener('click', () => applyAccent(dot.dataset.accent));
        });
    }

    return { init, applyTheme, applyAccent, getMode };
})();
