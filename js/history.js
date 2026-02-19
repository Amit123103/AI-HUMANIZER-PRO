/**
 * History Module
 * Saves and displays past transformations with timestamps
 */

const History = (() => {

    // ✅ Bug 1 Fix: unified key used by Badges + Chart modules
    const STORAGE_KEY = 'aih-history';
    const MAX_ITEMS = 20;

    // ── Load / Save ───────────────────────────────────────────────────────────
    function load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch { return []; }
    }

    function save(items) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { }
    }

    // ── Add Entry ─────────────────────────────────────────────────────────────
    function addEntry({ mode, style, inputText, humanized, paraphrased, rewritten, analytics }) {
        // ✅ Bug 7 Fix: null guard for analytics
        const a = analytics || {};
        const items = load();
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            mode, style,
            inputPreview: (inputText || '').slice(0, 120) + ((inputText || '').length > 120 ? '…' : ''),
            outputPreview: (humanized || '').slice(0, 120) + ((humanized || '').length > 120 ? '…' : ''),
            inputText, humanized, paraphrased, rewritten,
            analytics: a,
            stats: {
                beforeAI: a.beforeAI ?? 0,
                afterAI: a.afterAI ?? 0,
                humanScore: a.humanScore ?? 0,
                readGrade: a.afterRead?.grade ?? 0,
            }
        };
        items.unshift(entry);
        if (items.length > MAX_ITEMS) items.pop();
        save(items);
        renderDrawer();
        updateBadge();
    }

    // ── Clear All ─────────────────────────────────────────────────────────────
    function clearAll() {
        save([]);
        renderDrawer();
        updateBadge();
    }

    // ── Update Badge ──────────────────────────────────────────────────────────
    function updateBadge() {
        const items = load();
        const badge = document.getElementById('history-count');
        if (!badge) return;
        if (items.length > 0) {
            badge.textContent = items.length;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // ── Format Time ───────────────────────────────────────────────────────────
    function formatTime(iso) {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHr < 24) return `${diffHr}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        return d.toLocaleDateString();
    }

    // ── Mode Icons ────────────────────────────────────────────────────────────
    const modeIcons = { humanize: '🧠', paraphrase: '🔄', rewrite: '✍️' };

    // ── Render Drawer ─────────────────────────────────────────────────────────
    function renderDrawer() {
        const list = document.getElementById('history-list');
        if (!list) return;
        const items = load();

        if (items.length === 0) {
            list.innerHTML = '<div class="history-empty">No transformations yet.<br/>Process some text to see your history here.</div>';
            return;
        }

        list.innerHTML = items.map(item => `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-header">
          <span class="history-mode-badge">${modeIcons[item.mode] || '✨'} ${item.mode}</span>
          <span class="history-style-badge">${item.style}</span>
          <span class="history-time">${formatTime(item.timestamp)}</span>
        </div>
        <div class="history-preview">
          <div class="history-preview-label">Input</div>
          <div class="history-preview-text">${escapeHtml(item.inputPreview)}</div>
        </div>
        <div class="history-preview">
          <div class="history-preview-label">Output</div>
          <div class="history-preview-text output">${escapeHtml(item.outputPreview)}</div>
        </div>
        <div class="history-stats">
          <span class="history-stat">🛡️ ${item.stats.beforeAI}% → ${item.stats.afterAI}%</span>
          <span class="history-stat">🧬 ${item.stats.humanScore}%</span>
          <span class="history-stat">📖 G${item.stats.readGrade}</span>
        </div>
        <div class="history-actions">
          <button class="panel-btn history-restore-btn" data-id="${item.id}">↩ Restore</button>
          <button class="panel-btn danger history-delete-btn" data-id="${item.id}">✕</button>
        </div>
      </div>
    `).join('');

        // Bind restore buttons
        list.querySelectorAll('.history-restore-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                restoreEntry(id);
            });
        });

        // Bind delete buttons
        list.querySelectorAll('.history-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                deleteEntry(id);
            });
        });
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Restore Entry ─────────────────────────────────────────────────────────
    function restoreEntry(id) {
        const items = load();
        const entry = items.find(i => i.id === id);
        if (!entry) return;

        // Restore input
        const textarea = document.getElementById('input-text');
        if (textarea) {
            textarea.value = entry.inputText;
            textarea.dispatchEvent(new Event('input'));
        }

        // Restore outputs
        UI.showOutput(entry.humanized, entry.paraphrased, entry.rewritten, entry.inputText);

        // Close drawer
        closeDrawer();

        if (typeof UI !== 'undefined') {
            UI.showToast('↩ Restored from history', 'success');
        }
    }

    // ── Delete Entry ──────────────────────────────────────────────────────────
    function deleteEntry(id) {
        const items = load().filter(i => i.id !== id);
        save(items);
        renderDrawer();
        updateBadge();
    }

    // ── Drawer Open/Close ─────────────────────────────────────────────────────
    function openDrawer() {
        document.getElementById('history-drawer')?.classList.add('open');
        document.getElementById('history-overlay')?.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        document.getElementById('history-drawer')?.classList.remove('open');
        document.getElementById('history-overlay')?.classList.remove('show');
        document.body.style.overflow = '';
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    function init() {
        updateBadge();
        renderDrawer();

        document.getElementById('history-toggle-btn')?.addEventListener('click', openDrawer);
        document.getElementById('history-drawer-close')?.addEventListener('click', closeDrawer);
        document.getElementById('history-overlay')?.addEventListener('click', closeDrawer);
        document.getElementById('history-clear-btn')?.addEventListener('click', () => {
            if (confirm('Clear all history?')) clearAll();
        });
    }

    return { init, addEntry, clearAll, openDrawer, closeDrawer };

})();
