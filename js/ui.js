/**
 * UI Module — Handles all DOM interactions, tabs, animations, compare mode
 */

const UI = (() => {

    // ── Toast Notifications ──────────────────────────────────────────────────
    function showToast(message, type = 'default', duration = 3000) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => { toast.className = 'toast'; }, duration);
    }

    // ── Word / Char Count ────────────────────────────────────────────────────
    function updateWordCount(text, wordEl, charEl) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        if (wordEl) wordEl.textContent = words.toLocaleString();
        if (charEl) charEl.textContent = chars.toLocaleString();
        return words;
    }

    // ── AI Meter Mini ────────────────────────────────────────────────────────
    function updateAIMeterMini(score, barEl, valEl) {
        if (!barEl || !valEl) return;
        barEl.style.width = `${score}%`;
        valEl.textContent = `${score}%`;
        // Color based on score
        if (score > 60) {
            barEl.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else if (score > 30) {
            barEl.style.background = 'linear-gradient(135deg, #eab308, #f97316)';
        } else {
            barEl.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        }
    }

    // ── Output Tabs ──────────────────────────────────────────────────────────
    function initOutputTabs(onTabChange) {
        const tabs = document.querySelectorAll('.output-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                // Update Tab Buttons
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update Tab Panes with entry animation
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    const isActive = pane.id === `tab-${target}`;
                    pane.classList.toggle('active', isActive);

                    // Trigger Phase 7 fade-in animation
                    if (isActive) {
                        pane.classList.remove('tab-content-active');
                        void pane.offsetWidth; // Trigger reflow for animation reset
                        pane.classList.add('tab-content-active');
                    } else {
                        pane.classList.remove('tab-content-active');
                    }
                });

                if (onTabChange) onTabChange(target);
            });
        });
    }

    // ── Mode Buttons ─────────────────────────────────────────────────────────
    function initModeBtns(onModeChange) {
        const btns = document.querySelectorAll('.mode-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                onModeChange(btn.dataset.mode);
            });
        });
    }

    // ── Style Pills ──────────────────────────────────────────────────────────
    function initStylePills(onStyleChange) {
        const pills = document.querySelectorAll('.style-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                onStyleChange(pill.dataset.style);
            });
        });
    }

    // ── Strength Slider ──────────────────────────────────────────────────────
    function initStrengthSlider(onChange) {
        const slider = document.getElementById('strength-slider');
        if (!slider) return;
        slider.addEventListener('input', () => {
            const val = parseInt(slider.value);
            // Update gradient fill (1-4 range means divide by 3)
            const pct = ((val - 1) / 3) * 100;
            slider.style.background = `linear-gradient(to right, #6366f1 0%, #6366f1 ${pct}%, rgba(255,255,255,0.07) ${pct}%)`;
            onChange(val);
        });
    }

    function updateStrengthLabels(mode) {
        const l1 = document.getElementById('strength-label-1');
        const l2 = document.getElementById('strength-label-2');
        const l3 = document.getElementById('strength-label-3');
        const l4 = document.getElementById('strength-label-4');

        if (!l1 || !l2 || !l3 || !l4) return;

        if (mode === 'rewrite') {
            l1.textContent = 'Standard';
            l2.textContent = 'Strong';
            l3.textContent = 'Full Rewrite';
            l4.innerHTML = 'Complete Transformation ⭐';
        } else {
            l1.textContent = 'Mild';
            l2.textContent = 'Medium';
            l3.textContent = 'Strong';
            l4.innerHTML = 'Maximum ⭐';
        }
    }

    // ── Process Button State ─────────────────────────────────────────────────
    function setProcessing(isProcessing, mode) {
        const btn = document.getElementById('process-btn');
        const spinner = document.getElementById('process-spinner');
        const icon = document.getElementById('process-icon');
        const text = document.getElementById('process-text');
        const hint = document.getElementById('process-hint');

        if (isProcessing) {
            btn.classList.add('processing');
            spinner.style.display = 'block';
            icon.style.display = 'none';
            text.textContent = '...';
            hint.textContent = 'Processing your text';
            btn.disabled = true;
        } else {
            btn.classList.remove('processing');
            spinner.style.display = 'none';
            icon.style.display = 'block';
            const labels = { humanize: 'Humanize', paraphrase: 'Paraphrase', rewrite: 'Rewrite' };
            const icons = { humanize: '🧠', paraphrase: '🔄', rewrite: '✍️' };
            text.textContent = labels[mode] || 'Process';
            icon.textContent = icons[mode] || '🚀';
            hint.textContent = 'Click to transform your text';
            btn.disabled = false;
        }
    }

    // ── Show Output ──────────────────────────────────────────────────────────
    function showOutput(humanized, paraphrased, rewritten, originalText) {
        // Hide placeholder, show tabs and content
        document.getElementById('output-placeholder').style.display = 'none';
        document.getElementById('output-tabs').style.display = 'flex';
        document.getElementById('output-content').style.display = 'block';
        document.getElementById('output-footer').style.display = 'flex';

        // Populate tabs
        document.getElementById('out-humanized').textContent = humanized;
        document.getElementById('out-paraphrased').textContent = paraphrased;
        document.getElementById('out-rewritten').textContent = rewritten;

        // Compare tab
        document.getElementById('compare-original').innerHTML = highlightDiff(originalText, humanized, 'original');
        document.getElementById('compare-output').innerHTML = highlightDiff(originalText, humanized, 'output');

        // Enable copy/download/export/tts
        const enableIds = ['btn-copy', 'btn-download', 'btn-export-pdf', 'btn-export-word', 'tts-btn'];
        enableIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = false;
        });

        // Update output word count
        const words = humanized.trim().split(/\s+/).length;
        document.getElementById('output-word-count').textContent = words.toLocaleString();

        // Activate first tab
        document.querySelectorAll('.output-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
        document.querySelectorAll('.tab-pane').forEach((p, i) => p.classList.toggle('active', i === 0));
    }

    // ── Word-Level Diff Highlighting ──────────────────────────────────────────
    // Marks every word in the output that is DIFFERENT from the original in green
    function buildWordDiff(originalText, outputText) {
        const origWords = new Set(
            originalText.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z']/g, ''))
        );

        return outputText.split(/(\s+)/).map(token => {
            // Preserve whitespace tokens as-is
            if (/^\s+$/.test(token)) return token;

            const clean = token.toLowerCase().replace(/[^a-z']/g, '');
            // Skip very short words (articles, prepositions) and punctuation-only
            if (clean.length <= 2 || !clean) return token;

            const isNew = !origWords.has(clean);
            if (isNew) {
                return `<mark class="word-changed" title="Changed word">${token}</mark>`;
            }
            return token;
        }).join('');
    }

    // Legacy diff for Compare tab (kept for compatibility)
    function highlightDiff(original, output, side) {
        const origWords = original.split(/\s+/);
        const outWords = output.split(/\s+/);

        if (side === 'original') {
            return origWords.map(word => {
                const clean = word.toLowerCase().replace(/[^a-z]/g, '');
                const inOutput = outWords.some(w => w.toLowerCase().replace(/[^a-z]/g, '') === clean);
                return inOutput ? word : `<span class="changed">${word}</span>`;
            }).join(' ');
        } else {
            return outWords.map(word => {
                const clean = word.toLowerCase().replace(/[^a-z]/g, '');
                const inOriginal = origWords.some(w => w.toLowerCase().replace(/[^a-z]/g, '') === clean);
                return inOriginal ? word : `<span class="changed">${word}</span>`;
            }).join(' ');
        }
    }

    // ── Score Strip ──────────────────────────────────────────────────────────
    function updateScoreStrip(analytics) {
        const strip = document.getElementById('score-strip');
        strip.style.display = 'grid';

        // AI Detection
        animateGauge('sc-ai-fill', analytics.afterAI, 'danger');
        document.getElementById('sc-ai-val').textContent = `${analytics.afterAI}%`;
        document.getElementById('sc-ai-change').textContent = `↓ ${analytics.aiReduction}% reduced`;

        // Humanization
        animateGauge('sc-human-fill', analytics.humanScore, 'success');
        document.getElementById('sc-human-val').textContent = `${analytics.humanScore}%`;
        document.getElementById('sc-human-change').textContent = `✓ ${analytics.humanScore}% natural`;

        // Originality
        animateGauge('sc-orig-fill', analytics.origScore, 'warning');
        document.getElementById('sc-orig-val').textContent = `${analytics.origScore}%`;
        document.getElementById('sc-orig-change').textContent = `+${analytics.origScore}% unique`;

        // Readability
        const readScore = Math.max(0, Math.min(100, 100 - analytics.afterRead.grade * 5));
        animateGauge('sc-read-fill', readScore, 'info');
        document.getElementById('sc-read-val').textContent = `G${analytics.afterRead.grade}`;
        const readChange = analytics.readImprovement > 0
            ? `↑ ${analytics.readImprovement}% easier`
            : analytics.readImprovement < 0
                ? `↓ ${Math.abs(analytics.readImprovement)}% harder`
                : 'No change';
        document.getElementById('sc-read-change').textContent = readChange;
    }

    function animateGauge(fillId, pct, type) {
        const el = document.getElementById(fillId);
        if (!el) return;
        const colors = {
            danger: '#ef4444',
            success: '#22c55e',
            warning: '#eab308',
            info: '#06b6d4',
        };
        const color = colors[type] || '#6366f1';
        el.style.background = `conic-gradient(${color} ${pct * 3.6}deg, #1a1a2e ${pct * 3.6}deg)`;
    }

    // ── Analytics Panel ───────────────────────────────────────────────────────
    function renderAnalyticsPanel(analytics) {
        const section = document.getElementById('analytics');
        section.style.display = 'block';

        // Animate scroll into view
        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

        // AI Detection Rings
        animateRing('det-before-circle', analytics.beforeAI, '#ef4444');
        animateRing('det-after-circle', analytics.afterAI, '#22c55e');
        document.getElementById('det-before-val').textContent = `${analytics.beforeAI}%`;
        document.getElementById('det-after-val').textContent = `${analytics.afterAI}%`;
        document.getElementById('det-improvement').textContent =
            `🎉 AI detection risk reduced by ${analytics.aiReduction} percentage points!`;

        // Humanization Score
        const humanEl = document.getElementById('human-score-val');
        humanEl.textContent = `${analytics.humanScore}%`;
        humanEl.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        humanEl.style.webkitBackgroundClip = 'text';
        humanEl.style.webkitTextFillColor = 'transparent';
        humanEl.style.backgroundClip = 'text';
        animateBar('human-score-bar', analytics.humanScore);
        document.getElementById('human-score-desc').textContent =
            analytics.humanScore >= 80 ? '✅ Excellent — text reads very naturally'
                : analytics.humanScore >= 60 ? '👍 Good — mostly natural with some patterns'
                    : '⚠️ Moderate — still has some AI characteristics';

        // Originality Score
        const origEl = document.getElementById('orig-score-val');
        origEl.textContent = `${analytics.origScore}%`;
        origEl.style.background = 'linear-gradient(135deg, #eab308, #f97316)';
        origEl.style.webkitBackgroundClip = 'text';
        origEl.style.webkitTextFillColor = 'transparent';
        origEl.style.backgroundClip = 'text';
        animateBar('orig-score-bar', analytics.origScore);
        document.getElementById('orig-score-desc').textContent =
            `+${analytics.origScore}% improved uniqueness vs original`;

        // Readability
        document.getElementById('read-before').textContent = `G${analytics.beforeRead.grade}`;
        document.getElementById('read-after').textContent = `G${analytics.afterRead.grade}`;
        const readDesc = analytics.readImprovement > 0
            ? `✅ ${analytics.readImprovement}% easier to read (${analytics.afterRead.level})`
            : analytics.readImprovement < 0
                ? `📈 Text became more complex (${analytics.afterRead.level})`
                : `→ Readability unchanged (${analytics.afterRead.level})`;
        document.getElementById('read-improvement').textContent = readDesc;

        // Tone Analysis
        const toneTagsEl = document.getElementById('tone-tags');
        const toneBarsEl = document.getElementById('tone-bars');
        const tones = analytics.toneAnalysis;
        const topTones = Object.entries(tones).filter(([, v]) => v > 20).sort((a, b) => b[1] - a[1]);

        toneTagsEl.innerHTML = topTones.map(([tone]) =>
            `<span class="tone-tag">${tone}</span>`
        ).join('') || '<span class="tone-tag">Neutral</span>';

        toneBarsEl.innerHTML = Object.entries(tones).map(([tone, val]) => `
      <div class="tone-bar-row">
        <span class="tone-bar-label">${tone}</span>
        <div class="tone-bar-track">
          <div class="tone-bar-fill" style="width:0%" data-target="${val}"></div>
        </div>
        <span class="tone-bar-val">${val}%</span>
      </div>
    `).join('');

        // Animate tone bars
        setTimeout(() => {
            document.querySelectorAll('.tone-bar-fill[data-target]').forEach(el => {
                el.style.width = `${el.dataset.target}%`;
            });
        }, 100);

        // Sentence Structure
        const structEl = document.getElementById('struct-score-val');
        structEl.textContent = `${analytics.structVariation.score}%`;
        structEl.style.background = 'linear-gradient(135deg, #06b6d4, #3b82f6)';
        structEl.style.webkitBackgroundClip = 'text';
        structEl.style.webkitTextFillColor = 'transparent';
        structEl.style.backgroundClip = 'text';
        animateBar('struct-score-bar', analytics.structVariation.score);

        const breakdownEl = document.getElementById('struct-breakdown');
        breakdownEl.innerHTML = Object.entries(analytics.structVariation.breakdown).map(([k, v]) => `
      <div class="struct-item">
        <span class="struct-item-label">${k}</span>
        <span class="struct-item-val">${v}</span>
      </div>
    `).join('');

        // Advanced Pro Metrics
        const entVal = document.getElementById('entropy-val');
        const entBar = document.getElementById('entropy-bar');
        const burVal = document.getElementById('burstiness-val');
        const burBar = document.getElementById('burstiness-bar');

        if (entVal) entVal.textContent = `${analytics.entropy}%`;
        if (entBar) {
            entBar.style.width = '0%';
            setTimeout(() => { entBar.style.width = `${analytics.entropy}%`; }, 100);
        }
        if (burVal) burVal.textContent = `${analytics.burstiness}%`;
        if (burBar) {
            burBar.style.width = '0%';
            setTimeout(() => { burBar.style.width = `${analytics.burstiness}%`; }, 100);
        }

        // Smart Writing Insights
        renderInsights(analytics);
    }

    function renderInsights(analytics) {
        const grid = document.getElementById('insights-grid');
        const suggestions = analytics.grammarSuggestions;

        const insights = [
            {
                icon: '📊',
                label: 'Readability Grade',
                val: `Grade ${analytics.afterRead.grade}`,
                sub: analytics.afterRead.level,
            },
            {
                icon: '🎭',
                label: 'Primary Tone',
                val: Object.entries(analytics.toneAnalysis).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral',
                sub: 'Detected writing tone',
            },
            {
                icon: '💬',
                label: 'Engagement Level',
                val: `${analytics.engagementLevel}%`,
                sub: analytics.engagementLevel >= 70 ? 'High engagement' : analytics.engagementLevel >= 40 ? 'Moderate engagement' : 'Low engagement',
            },
            {
                icon: '🔤',
                label: 'Sentence Variety',
                val: `${analytics.structVariation.score}%`,
                sub: analytics.structVariation.score >= 60 ? 'Good variation' : 'Could improve variety',
            },
            {
                icon: '⚠️',
                label: 'Grammar Notes',
                val: suggestions.length > 0 ? `${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''}` : '✅ None',
                sub: suggestions[0]?.msg || 'No issues found',
            },
            {
                icon: '🌟',
                label: 'Originality',
                val: `${analytics.origScore}%`,
                sub: analytics.origScore >= 60 ? 'Highly original' : 'Moderately original',
            },
        ];

        grid.innerHTML = insights.map(ins => `
      <div class="insight-card">
        <div class="insight-icon">${ins.icon}</div>
        <div class="insight-label">${ins.label}</div>
        <div class="insight-val">${ins.val}</div>
        <div class="insight-sub">${ins.sub}</div>
      </div>
    `).join('');
    }

    function animateRing(circleId, pct, color) {
        const circle = document.getElementById(circleId);
        if (!circle) return;
        circle.style.stroke = color;
        const circumference = 251.2;
        const offset = circumference - (pct / 100) * circumference;
        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1s ease';
            circle.style.strokeDashoffset = offset;
        }, 200);
    }

    function animateBar(barId, pct) {
        const bar = document.getElementById(barId);
        if (!bar) return;
        setTimeout(() => { bar.style.width = `${pct}%`; }, 100);
    }

    return {
        showToast,
        updateWordCount,
        updateAIMeterMini,
        initOutputTabs,
        initModeBtns,
        initStylePills,
        initStrengthSlider,
        setProcessing,
        showOutput,
        renderAnalyticsPanel,
        buildWordDiff,
        highlightDiff,
        updateStrengthLabels,
        updateScoreStrip,
    };


})();
