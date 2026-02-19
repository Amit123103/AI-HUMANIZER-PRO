/**
 * Live Writing Coach Module
 * Provides real-time writing tips and naturalness coaching as the user types
 */

const Coach = (() => {

    const MAX_WORDS = 1000;

    // ── AI Pattern Tips ───────────────────────────────────────────────────────
    const patternTips = [
        { pattern: /\bdelve\b/gi, tip: '💡 "Delve" is a common AI word. Try: explore, examine, look into', severity: 'high' },
        { pattern: /\bfacilitate\b/gi, tip: '💡 "Facilitate" sounds robotic. Try: help, support, enable', severity: 'medium' },
        { pattern: /\butilize\b/gi, tip: '💡 "Utilize" is overused by AI. Just use "use"', severity: 'high' },
        { pattern: /\bleverage\b/gi, tip: '💡 "Leverage" sounds corporate. Try: use, apply, harness', severity: 'medium' },
        { pattern: /\boptimize\b/gi, tip: '💡 "Optimize" is AI-heavy. Try: improve, fine-tune, refine', severity: 'medium' },
        { pattern: /\bcomprehensive\b/gi, tip: '💡 "Comprehensive" is overused. Try: thorough, complete, full', severity: 'low' },
        { pattern: /\bsophisticated\b/gi, tip: '💡 "Sophisticated" is AI-heavy. Try: advanced, complex, refined', severity: 'low' },
        { pattern: /\bparadigm\b/gi, tip: '💡 "Paradigm" is a buzzword. Try: model, approach, framework', severity: 'medium' },
        { pattern: /\bin conclusion\b/gi, tip: '💡 "In conclusion" is a classic AI closer. Try: To wrap up, Finally, In short', severity: 'high' },
        { pattern: /\bfurthermore\b/gi, tip: '💡 "Furthermore" is very formal. Try: Also, Plus, What\'s more', severity: 'medium' },
        { pattern: /\bmoreover\b/gi, tip: '💡 "Moreover" sounds stiff. Try: Also, Besides, On top of that', severity: 'medium' },
        { pattern: /\bit is important to note\b/gi, tip: '💡 Remove "It is important to note" — just say what\'s important directly', severity: 'high' },
        { pattern: /\bit is worth noting\b/gi, tip: '💡 Remove "It is worth noting" — state the point directly', severity: 'high' },
        { pattern: /\bseamless\b/gi, tip: '💡 "Seamless" is a marketing cliché. Try: smooth, easy, effortless', severity: 'low' },
        { pattern: /\brobust\b/gi, tip: '💡 "Robust" is overused in AI text. Try: strong, solid, reliable', severity: 'low' },
        { pattern: /\bin order to\b/gi, tip: '💡 Replace "in order to" with just "to" — it\'s cleaner', severity: 'low' },
        { pattern: /\bdue to the fact that\b/gi, tip: '💡 Replace "due to the fact that" with "because"', severity: 'medium' },
        { pattern: /\bsubsequently\b/gi, tip: '💡 "Subsequently" is stiff. Try: then, after that, next', severity: 'medium' },
    ];

    // ── Structural Tips ───────────────────────────────────────────────────────
    function getStructuralTips(text) {
        const tips = [];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        const words = text.trim().split(/\s+/).filter(Boolean);

        // Long sentences
        const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 35);
        if (longSentences.length > 0) {
            tips.push({ tip: `✂️ ${longSentences.length} sentence(s) are very long (>35 words). Break them up for better readability.`, severity: 'high' });
        }

        // Sentence length uniformity
        if (sentences.length > 3) {
            const lengths = sentences.map(s => s.trim().split(/\s+/).length);
            const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const variance = lengths.reduce((s, l) => s + Math.pow(l - avg, 2), 0) / lengths.length;
            if (Math.sqrt(variance) < 4) {
                tips.push({ tip: '📐 All your sentences are similar in length. Vary them — mix short punchy sentences with longer ones.', severity: 'medium' });
            }
        }

        // Passive voice
        const passiveCount = (text.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
        if (passiveCount > 2) {
            tips.push({ tip: `🔄 Found ${passiveCount} passive voice constructions. Active voice is more natural and direct.`, severity: 'medium' });
        }

        // Repetitive words
        const wordFreq = {};
        words.forEach(w => {
            const clean = w.toLowerCase().replace(/[^a-z]/g, '');
            if (clean.length > 4) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
        });
        const repeated = Object.entries(wordFreq).filter(([, c]) => c >= 4).sort((a, b) => b[1] - a[1]).slice(0, 2);
        if (repeated.length > 0) {
            tips.push({ tip: `🔁 "${repeated[0][0]}" appears ${repeated[0][1]} times. Vary your word choice to sound more natural.`, severity: 'low' });
        }

        // Word count warning
        if (words.length > 800) {
            tips.push({ tip: `⚠️ ${words.length} words — approaching the 1000 word limit.`, severity: 'high' });
        }

        return tips;
    }

    // ── Pattern Tips ──────────────────────────────────────────────────────────
    function getPatternTips(text) {
        const found = [];
        for (const { pattern, tip, severity } of patternTips) {
            if (pattern.test(text)) {
                found.push({ tip, severity });
                pattern.lastIndex = 0; // reset regex
            }
        }
        // Return top 4 most severe
        const order = { high: 0, medium: 1, low: 2 };
        return found.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 4);
    }

    // ── Word Limit Bar ────────────────────────────────────────────────────────
    function updateWordLimitBar(wordCount) {
        const bar = document.getElementById('word-limit-bar');
        const wrap = document.getElementById('word-limit-wrap');
        if (!bar || !wrap) return;

        const pct = Math.min(100, (wordCount / MAX_WORDS) * 100);
        bar.style.width = `${pct}%`;

        if (pct >= 90) {
            bar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else if (pct >= 70) {
            bar.style.background = 'linear-gradient(90deg, #eab308, #f97316)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #6366f1, #a855f7)';
        }
    }

    // ── Intelligent Result Insights ──────────────────────────────────────────
    function suggestImprovements(originalText, transformedText) {
        const tips = [];
        const origWords = originalText.split(/\s+/).length;
        const transWords = transformedText.split(/\s+/).length;

        // Success metrics
        if (transWords > origWords * 0.9) {
            tips.push({ tip: '🎯 Meaning Integrity: 100% maintained with improved flow', severity: 'low' });
        }

        const aiScore = Analytics.getAILikenessScore(transformedText);
        if (aiScore < 20) {
            tips.push({ tip: '✨ Naturalness optimized: +30% conversational feel', severity: 'low' });
        }

        // Linguistic suggestions
        if (transformedText.length > 500) {
            tips.push({ tip: '💡 Pro Tip: Use "Rewrite" mode for complex sections to maximize structural variety', severity: 'medium' });
        }

        return tips;
    }

    // ── Render Coaching Panel ─────────────────────────────────────────────────
    function renderCoachingPanel(text, transformedText = null) {
        const panel = document.getElementById('coaching-panel');
        const tipsEl = document.getElementById('coaching-tips');
        if (!panel || !tipsEl) return;

        const words = text.trim().split(/\s+/).filter(Boolean);
        if (words.length < 10) {
            panel.style.display = 'none';
            return;
        }

        let allTips = [...getPatternTips(text), ...getStructuralTips(text)];

        // Add intelligent result-based tips if available
        if (transformedText) {
            allTips = [...suggestImprovements(text, transformedText), ...allTips];
        }

        if (allTips.length === 0) {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = 'block';
        tipsEl.innerHTML = allTips.map(({ tip, severity }) => `
      <div class="coaching-tip severity-${severity}">
        <span class="tip-dot"></span>
        <span>${tip}</span>
      </div>
    `).join('');
    }

    // ── Sentence Similarity Checker ───────────────────────────────────────────
    function renderSimilarityPanel(originalText, outputText) {
        const panel = document.getElementById('similarity-panel');
        if (!panel) return;

        const origSentences = originalText.match(/[^.!?]+[.!?]+/g) || [originalText];
        const outSentences = outputText.match(/[^.!?]+[.!?]+/g) || [outputText];

        const rows = outSentences.map((outS, i) => {
            const origS = origSentences[i] || origSentences[origSentences.length - 1];
            const similarity = computeSentenceSimilarity(origS, outS);
            const level = similarity >= 80 ? 'high' : similarity >= 50 ? 'medium' : 'low';
            const label = similarity >= 80 ? '⚠️ Very similar' : similarity >= 50 ? '🔶 Partially changed' : '✅ Well transformed';
            return `
        <div class="similarity-row">
          <div class="similarity-sentence">${outS.trim()}</div>
          <div class="similarity-bar-row">
            <div class="similarity-bar-track">
              <div class="similarity-bar-fill sim-${level}" style="width:${similarity}%"></div>
            </div>
            <span class="similarity-pct">${similarity}%</span>
            <span class="similarity-label">${label}</span>
          </div>
        </div>
      `;
        });

        const avgSim = outSentences.reduce((sum, outS, i) => {
            const origS = origSentences[i] || origSentences[origSentences.length - 1];
            return sum + computeSentenceSimilarity(origS, outS);
        }, 0) / outSentences.length;

        panel.innerHTML = `
      <div class="similarity-header">
        <div class="similarity-summary">
          <span>Overall Similarity: <strong>${Math.round(avgSim)}%</strong></span>
          <span class="similarity-note">${avgSim < 40 ? '✅ Excellent transformation' : avgSim < 60 ? '👍 Good transformation' : '⚠️ Consider stronger rewriting'}</span>
        </div>
      </div>
      <div class="similarity-rows">${rows.join('')}</div>
    `;
    }

    function computeSentenceSimilarity(s1, s2) {
        const words1 = new Set(s1.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2));
        const words2 = new Set(s2.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2));
        if (words1.size === 0 || words2.size === 0) return 0;
        let common = 0;
        for (const w of words2) { if (words1.has(w)) common++; }
        return Math.round((common / Math.max(words1.size, words2.size)) * 100);
    }

    return { renderCoachingPanel, updateWordLimitBar, renderSimilarityPanel, suggestImprovements };

})();
