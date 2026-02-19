/**
 * A/B Versions Module
 * Generates 3 distinct humanized versions and lets user pick the best one
 */

const Versions = (() => {

    let currentVersions = [];
    let selectedVersion = 0;
    let onSelectCallback = null;

    // Generate 3 variants with slightly different seeds/styles
    function generateVersions(text, style, strength) {
        const styleVariants = [style, getVariantStyle(style, 0), getVariantStyle(style, 1)];
        const strengthVariants = [strength, Math.max(1, strength - 1), Math.min(3, strength + 1)];

        currentVersions = styleVariants.map((s, i) => ({
            id: i + 1,
            label: ['Version A', 'Version B', 'Version C'][i],
            emoji: ['🅰️', '🅱️', '🆑'][i],   // ✅ Bug 4 Fix: 🆑 renders correctly cross-platform
            style: s,
            strength: strengthVariants[i],
            text: NLP.humanize(text, s, strengthVariants[i]),
        }));

        return currentVersions;
    }

    function getVariantStyle(base, offset) {
        const styles = ['standard', 'casual', 'professional', 'academic', 'creative', 'simplified'];
        const idx = styles.indexOf(base);
        return styles[(idx + offset + 1) % styles.length];
    }

    function render(text, style, strength, onSelect) {
        onSelectCallback = onSelect;
        const versions = generateVersions(text, style, strength);
        const panel = document.getElementById('versions-panel');
        if (!panel) return;

        panel.style.display = 'block';
        panel.innerHTML = `
      <div class="versions-header">
        <span class="versions-icon">🧪</span>
        <h3>A/B Version Picker — Choose Your Best Version</h3>
        <p class="versions-sub">3 unique humanizations generated. Click one to use it as your output.</p>
      </div>
      <div class="versions-grid">
        ${versions.map((v, i) => `
          <div class="version-card ${i === 0 ? 'selected' : ''}" data-idx="${i}" id="version-card-${i}">
            <div class="version-card-header">
              <span class="version-emoji">${v.emoji}</span>
              <span class="version-label">${v.label}</span>
              <span class="version-meta">${v.style} · strength ${v.strength}</span>
              ${i === 0 ? '<span class="version-selected-badge">✓ Selected</span>' : ''}
            </div>
            <div class="version-text">${v.text}</div>
            <button class="version-use-btn" data-idx="${i}">
              ${i === 0 ? '✓ Using this version' : 'Use this version →'}
            </button>
          </div>
        `).join('')}
      </div>
    `;

        // Bind click events
        panel.querySelectorAll('.version-use-btn').forEach(btn => {
            btn.addEventListener('click', () => selectVersion(parseInt(btn.dataset.idx)));
        });
        panel.querySelectorAll('.version-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('version-use-btn')) {
                    selectVersion(parseInt(card.dataset.idx));
                }
            });
        });

        selectedVersion = 0;
    }

    function selectVersion(idx) {
        selectedVersion = idx;
        const cards = document.querySelectorAll('.version-card');
        cards.forEach((card, i) => {
            card.classList.toggle('selected', i === idx);
            const badge = card.querySelector('.version-selected-badge');
            const btn = card.querySelector('.version-use-btn');
            if (i === idx) {
                if (!badge) {
                    const header = card.querySelector('.version-card-header');
                    const b = document.createElement('span');
                    b.className = 'version-selected-badge';
                    b.textContent = '✓ Selected';
                    header.appendChild(b);
                }
                if (btn) btn.textContent = '✓ Using this version';
            } else {
                badge?.remove();
                if (btn) btn.textContent = 'Use this version →';
            }
        });

        if (onSelectCallback && currentVersions[idx]) {
            onSelectCallback(currentVersions[idx].text, idx);
        }
    }

    function getSelected() {
        return currentVersions[selectedVersion] || null;
    }

    return { render, getSelected, generateVersions };
})();
