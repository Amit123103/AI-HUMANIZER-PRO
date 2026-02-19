/**
 * Word Cloud Module
 * Renders a before/after word frequency visualization using pure canvas
 */

const WordCloud = (() => {

    const STOP_WORDS = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
        'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
        'shall', 'can', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
        'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'our',
        'their', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all',
        'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
        'not', 'only', 'same', 'so', 'than', 'too', 'very', 'just', 'as', 'if', 'then',
        'there', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
        'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'once'
    ]);

    function getWordFreq(text, topN = 30) {
        const words = text.toLowerCase()
            .replace(/[^a-z\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3 && !STOP_WORDS.has(w));

        const freq = {};
        words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN);
    }

    function renderCloud(canvasId, words, colorScheme = 'purple') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        if (!words.length) {
            ctx.fillStyle = 'rgba(148,148,176,0.4)';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No text to display', W / 2, H / 2);
            return;
        }

        const maxFreq = words[0][1];
        const schemes = {
            purple: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'],
            green: ['#22c55e', '#16a34a', '#4ade80', '#86efac', '#06b6d4'],
            warm: ['#f97316', '#eab308', '#ef4444', '#ec4899', '#f59e0b'],
        };
        const colors = schemes[colorScheme] || schemes.purple;

        const placed = [];

        function overlaps(x, y, w, h) {
            return placed.some(p =>
                x < p.x + p.w + 8 && x + w + 8 > p.x &&
                y < p.y + p.h + 4 && y + h + 4 > p.y
            );
        }

        words.forEach(([word, freq]) => {
            const ratio = freq / maxFreq;
            const fontSize = Math.round(12 + ratio * 28);
            ctx.font = `${ratio > 0.6 ? 700 : 500} ${fontSize}px Inter, sans-serif`;
            const metrics = ctx.measureText(word);
            const tw = metrics.width;
            const th = fontSize;

            const color = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillStyle = color;

            // Try to place word randomly, avoid overlaps
            let placed_ok = false;
            for (let attempt = 0; attempt < 60; attempt++) {
                const x = Math.random() * (W - tw - 20) + 10;
                const y = Math.random() * (H - th - 10) + th;
                if (!overlaps(x, y - th, tw, th)) {
                    ctx.globalAlpha = 0.85 + ratio * 0.15;
                    ctx.fillText(word, x, y);
                    placed.push({ x, y: y - th, w: tw, h: th });
                    placed_ok = true;
                    break;
                }
            }
            ctx.globalAlpha = 1;
        });
    }

    function render(originalText, outputText) {
        const container = document.getElementById('wordcloud-section');
        if (!container) return;
        container.style.display = 'block';

        const beforeWords = getWordFreq(originalText);
        const afterWords = getWordFreq(outputText);

        renderCloud('wc-before', beforeWords, 'warm');
        renderCloud('wc-after', afterWords, 'green');

        // Compute changed words
        const beforeSet = new Set(beforeWords.map(([w]) => w));
        const afterSet = new Set(afterWords.map(([w]) => w));
        const added = afterWords.filter(([w]) => !beforeSet.has(w)).slice(0, 5);
        const removed = beforeWords.filter(([w]) => !afterSet.has(w)).slice(0, 5);

        const changesEl = document.getElementById('wc-changes');
        if (changesEl) {
            changesEl.innerHTML = `
        <div class="wc-change-col">
          <div class="wc-change-label removed">🔴 Words Replaced</div>
          ${removed.map(([w]) => `<span class="wc-tag removed">${w}</span>`).join('') || '<span class="wc-none">—</span>'}
        </div>
        <div class="wc-change-col">
          <div class="wc-change-label added">🟢 New Words Added</div>
          ${added.map(([w]) => `<span class="wc-tag added">${w}</span>`).join('') || '<span class="wc-none">—</span>'}
        </div>
      `;
        }
    }

    return { render };
})();
