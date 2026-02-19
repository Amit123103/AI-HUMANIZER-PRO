/**
 * Badges Module — Achievement system
 */
const Badges = (() => {
    const STORAGE_KEY = 'aih-badges';

    const ALL_BADGES = [
        { id: 'first_transform', icon: '🎉', name: 'First Step', desc: 'Complete your first transformation', check: (s, h) => h.length >= 1 },
        { id: 'score_below_20', icon: '🛡️', name: 'Ghost Writer', desc: 'Get AI detection below 20%', check: (s) => s.analytics?.afterAI <= 20 },
        { id: 'score_below_10', icon: '👻', name: 'Invisible', desc: 'Get AI detection below 10%', check: (s) => s.analytics?.afterAI <= 10 },
        { id: 'perfect_human', icon: '🧬', name: 'Fully Human', desc: 'Achieve 95%+ humanization score', check: (s) => s.analytics?.humanScore >= 95 },
        { id: 'high_orig', icon: '🌟', name: 'Original Thinker', desc: 'Achieve 90%+ originality score', check: (s) => s.analytics?.origScore >= 90 },
        { id: 'ten_transforms', icon: '🔟', name: 'Prolific Writer', desc: 'Complete 10 transformations', check: (s, h) => h.length >= 10 },
        { id: 'fifty_transforms', icon: '🏆', name: 'Power User', desc: 'Complete 50 transformations', check: (s, h) => h.length >= 50 },
        { id: 'all_styles', icon: '🎨', name: 'Style Master', desc: 'Use all 6 writing styles', check: (s, h) => new Set(h.map(e => e.style)).size >= 6 },
        { id: 'all_modes', icon: '🔀', name: 'Triple Threat', desc: 'Use all 3 modes (humanize, paraphrase, rewrite)', check: (s, h) => new Set(h.map(e => e.mode)).size >= 3 },
        { id: 'long_text', icon: '📜', name: 'Essay Writer', desc: 'Transform text with 1000+ words', check: (s) => s.inputText?.split(/\s+/).length >= 1000 },
        { id: 'auto_retry', icon: '🔁', name: 'Perfectionist', desc: 'Use Auto-Retry mode successfully', check: (s) => s.usedAutoRetry === true },
        { id: 'pdf_export', icon: '📄', name: 'Publisher', desc: 'Export a result as PDF', check: (s) => s.exportedPdf === true },
        { id: 'tts_used', icon: '🔊', name: 'Listener', desc: 'Use Text-to-Speech on output', check: (s) => s.usedTTS === true },
        { id: 'thread_split', icon: '🐦', name: 'Tweeter', desc: 'Split output into a Twitter thread', check: (s) => s.usedThreadSplit === true },
    ];

    function getUnlocked() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
    }

    function saveUnlocked(ids) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }

    function check(sessionState, history) {
        const unlocked = getUnlocked();
        const newlyUnlocked = [];

        ALL_BADGES.forEach(badge => {
            if (!unlocked.includes(badge.id) && badge.check(sessionState, history)) {
                unlocked.push(badge.id);
                newlyUnlocked.push(badge);
            }
        });

        if (newlyUnlocked.length) {
            saveUnlocked(unlocked);
            newlyUnlocked.forEach(b => showBadgeToast(b));
        }

        renderBadgeGrid(unlocked);
        return newlyUnlocked;
    }

    function showBadgeToast(badge) {
        const toast = document.createElement('div');
        toast.className = 'badge-toast';
        toast.innerHTML = `
      <span class="badge-toast-icon">${badge.icon}</span>
      <div>
        <div class="badge-toast-title">🏅 Badge Unlocked!</div>
        <div class="badge-toast-name">${badge.name}</div>
        <div class="badge-toast-desc">${badge.desc}</div>
      </div>
    `;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4000);
    }

    function renderBadgeGrid(unlocked) {
        const grid = document.getElementById('badges-grid');
        if (!grid) return;
        const section = document.getElementById('badges-section');
        if (section) section.style.display = 'block';

        grid.innerHTML = ALL_BADGES.map(b => {
            const isUnlocked = unlocked.includes(b.id);
            return `
        <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" title="${b.desc}">
          <div class="badge-icon">${isUnlocked ? b.icon : '🔒'}</div>
          <div class="badge-name">${b.name}</div>
          <div class="badge-desc">${b.desc}</div>
        </div>
      `;
        }).join('');
    }

    function init() {
        const unlocked = getUnlocked();
        renderBadgeGrid(unlocked);
    }

    return { check, init, getUnlocked, ALL_BADGES };
})();
