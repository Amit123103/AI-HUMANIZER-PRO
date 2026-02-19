/**
 * Extras Module — Email format, Twitter thread splitter, Citation generator,
 *                 Grammar fixer, Paragraph-by-paragraph, Plagiarism highlighter,
 *                 Auto-retry, Typing animation, Session report
 */
const Extras = (() => {

  // ── Typing Animation ──────────────────────────────────────────────────────
  function typeText(el, text, speed = 18) {
    el.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
  }

  // ── Grammar Fixer ─────────────────────────────────────────────────────────
  const grammarRules = [
    [/\bi\b/g, 'I'],
    [/\s{2,}/g, ' '],
    [/([.!?])\s*([a-z])/g, (_, p, c) => `${p} ${c.toUpperCase()}`],
    [/\b(dont|cant|wont|isnt|arent|wasnt|werent|hasnt|havent|hadnt|doesnt|didnt|wouldnt|couldnt|shouldnt)\b/gi,
      m => m.replace(/nt$/i, "n't").replace(/^(.)/, c => c.toUpperCase())],
    [/ ,/g, ','],
    [/ \./g, '.'],
    [/\ba\s+([aeiou])/gi, 'an $1'],
  ];

  function fixGrammar(text) {
    let result = text;
    grammarRules.forEach(([pattern, replacement]) => {
      result = result.replace(pattern, replacement);
    });
    // Capitalize first letter of each sentence
    result = result.replace(/(^|[.!?]\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase());
    return result;
  }

  // ── Plagiarism Highlighter ────────────────────────────────────────────────
  const GENERIC_PHRASES = [
    'in conclusion', 'it is important to note', 'it should be noted', 'as mentioned above',
    'in today\'s world', 'in the modern era', 'needless to say', 'it goes without saying',
    'at the end of the day', 'in a nutshell', 'to sum up', 'first and foremost',
    'last but not least', 'in other words', 'as a result', 'due to the fact that',
    'in order to', 'with regard to', 'in terms of', 'it is worth noting',
  ];

  function highlightGenericPhrases(text) {
    let html = text;
    GENERIC_PHRASES.forEach(phrase => {
      const re = new RegExp(`(${phrase})`, 'gi');
      html = html.replace(re, '<mark class="generic-highlight" title="Generic/overused phrase">$1</mark>');
    });
    return html;
  }

  function renderPlagiarismHighlight(text, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const highlighted = highlightGenericPhrases(text);
    const count = (highlighted.match(/generic-highlight/g) || []).length;
    el.innerHTML = highlighted;
    const badge = document.getElementById('plagiarism-count');
    if (badge) badge.textContent = count > 0 ? `${count} generic phrase${count > 1 ? 's' : ''} found` : '✅ No generic phrases';
  }

  // ── Paragraph-by-Paragraph ────────────────────────────────────────────────
  function processByParagraph(text, style, strength) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    return paragraphs.map(p => ({
      original: p,
      humanized: NLP.humanize(p, style, strength),
      score: Analytics.getAILikenessScore(NLP.humanize(p, style, strength)),
    }));
  }

  function renderParagraphPanel(paragraphs) {
    const panel = document.getElementById('paragraph-panel');
    if (!panel) return;
    panel.style.display = 'block';
    panel.innerHTML = `
      <div class="para-header">
        <span class="para-icon">🧩</span>
        <h3>Paragraph-by-Paragraph Analysis</h3>
        <span class="para-count">${paragraphs.length} paragraph${paragraphs.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="para-list">
        ${paragraphs.map((p, i) => `
          <div class="para-item">
            <div class="para-item-header">
              <span class="para-num">¶${i + 1}</span>
              <div class="para-ai-bar-wrap">
                <div class="para-ai-bar" style="width:${p.score}%;background:${p.score > 50 ? '#ef4444' : p.score > 25 ? '#eab308' : '#22c55e'}"></div>
              </div>
              <span class="para-ai-val">${p.score}% AI</span>
            </div>
            <div class="para-text">${p.humanized}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── Auto-Retry ────────────────────────────────────────────────────────────
  async function autoRetry(text, style, maxAttempts = 5, targetScore = 20) {
    let best = text;
    let bestScore = Analytics.getAILikenessScore(text);
    let attempts = 0;

    const statusEl = document.getElementById('retry-status');
    if (statusEl) statusEl.style.display = 'flex';

    while (bestScore > targetScore && attempts < maxAttempts) {
      attempts++;
      if (statusEl) statusEl.querySelector('.retry-text').textContent =
        `Attempt ${attempts}/${maxAttempts} — AI score: ${bestScore}%`;
      await new Promise(r => setTimeout(r, 300));
      const candidate = NLP.humanize(best, style, 3);
      const score = Analytics.getAILikenessScore(candidate);
      if (score < bestScore) { best = candidate; bestScore = score; }
    }

    if (statusEl) {
      statusEl.querySelector('.retry-text').textContent =
        `✅ Done in ${attempts} attempt${attempts > 1 ? 's' : ''} — Final AI score: ${bestScore}%`;
      setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
    }

    return { text: best, score: bestScore, attempts };
  }

  // ── Email Format ──────────────────────────────────────────────────────────
  function formatAsEmail(text, subject = 'Regarding Your Request') {
    const lines = text.split(/\n+/).filter(l => l.trim());
    const body = lines.join('\n\n');
    return `Subject: ${subject}

Dear [Recipient],

${body}

Best regards,
[Your Name]`;
  }

  // ── Twitter Thread Splitter ───────────────────────────────────────────────
  function splitToThread(text, maxChars = 280) {
    const words = text.split(/\s+/);
    const tweets = [];
    let current = '';

    words.forEach(word => {
      const test = current ? `${current} ${word}` : word;
      if (test.length <= maxChars - 10) {
        current = test;
      } else {
        if (current) tweets.push(current);
        current = word;
      }
    });
    if (current) tweets.push(current);

    // Add numbering
    return tweets.map((t, i) => `${i + 1}/${tweets.length} ${t}`);
  }

  function renderThreadPanel(tweets) {
    const panel = document.getElementById('thread-panel');
    if (!panel) return;
    panel.style.display = 'block';
    panel.innerHTML = `
      <div class="thread-header">
        <span>🐦</span>
        <h3>Twitter/X Thread — ${tweets.length} tweets</h3>
        <button class="thread-copy-all" id="thread-copy-all">Copy All</button>
      </div>
      <div class="thread-list">
        ${tweets.map((t, i) => `
          <div class="thread-tweet">
            <div class="thread-tweet-num">${i + 1}</div>
            <div class="thread-tweet-text">${t}</div>
            <div class="thread-tweet-chars">${t.length}/280</div>
            <button class="thread-tweet-copy" data-text="${t.replace(/"/g, '&quot;')}">Copy</button>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('thread-copy-all')?.addEventListener('click', () => {
      navigator.clipboard.writeText(tweets.join('\n\n'));
      if (typeof UI !== 'undefined') UI.showToast('✅ Thread copied!', 'success');
    });
    panel.querySelectorAll('.thread-tweet-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.text);
        if (typeof UI !== 'undefined') UI.showToast('✅ Tweet copied!', 'success');
      });
    });
  }

  // ── Citation Generator ────────────────────────────────────────────────────
  function generateCitation(format = 'apa') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString('default', { month: 'long' });
    const day = now.getDate();

    if (format === 'apa') {
      return `Author, A. A. (${year}, ${month} ${day}). [Title of work]. AI Humanizer Pro. https://ai-humanizer.pro`;
    } else if (format === 'mla') {
      return `Author Last, First. "[Title of Work]." AI Humanizer Pro, ${day} ${month} ${year}, https://ai-humanizer.pro.`;
    } else {
      return `[${year}] Author. Title. AI Humanizer Pro. Available at: https://ai-humanizer.pro [Accessed: ${month} ${day}, ${year}]`;
    }
  }

  function renderCitationPanel(text) {
    const panel = document.getElementById('citation-panel');
    if (!panel) return;
    panel.style.display = 'block';

    const wordCount = text.split(/\s+/).length;
    const apa = generateCitation('apa');
    const mla = generateCitation('mla');
    const chicago = generateCitation('chicago');

    panel.innerHTML = `
      <div class="citation-header">
        <span>📚</span>
        <h3>Citation Generator</h3>
        <span class="citation-meta">${wordCount} words · Generated ${new Date().toLocaleDateString()}</span>
      </div>
      <div class="citation-list">
        ${[['APA', apa], ['MLA', mla], ['Chicago', chicago]].map(([fmt, cite]) => `
          <div class="citation-item">
            <div class="citation-format">${fmt}</div>
            <div class="citation-text" id="cite-${fmt.toLowerCase()}">${cite}</div>
            <button class="citation-copy" data-text="${cite.replace(/"/g, '&quot;')}">Copy</button>
          </div>
        `).join('')}
      </div>
    `;

    panel.querySelectorAll('.citation-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.text);
        if (typeof UI !== 'undefined') UI.showToast('✅ Citation copied!', 'success');
      });
    });
  }

  // ── Session Report ────────────────────────────────────────────────────────
  function generateSessionReport(history) {
    if (!history.length) return;
    const total = history.length;
    const avgAfterAI = Math.round(history.reduce((s, h) => s + (h.analytics?.afterAI || 0), 0) / total);
    const avgHuman = Math.round(history.reduce((s, h) => s + (h.analytics?.humanScore || 0), 0) / total);
    const best = history.reduce((b, h) => (h.analytics?.afterAI || 99) < (b.analytics?.afterAI || 99) ? h : b, history[0]);

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>AI Humanizer Pro — Session Report</title>
    <style>
      body{font-family:Georgia,serif;max-width:900px;margin:40px auto;color:#111;line-height:1.7;background:#fff}
      h1{color:#4f46e5;border-bottom:3px solid #4f46e5;padding-bottom:10px}
      h2{color:#333;margin-top:30px;font-size:1.1rem}
      .stats{display:flex;gap:20px;flex-wrap:wrap;margin:20px 0}
      .stat{background:#f0f0ff;border-radius:8px;padding:14px 20px;flex:1;min-width:140px}
      .sv{font-size:1.8rem;font-weight:700;color:#4f46e5}
      .sl{font-size:.8rem;color:#666}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th{background:#4f46e5;color:#fff;padding:10px 14px;text-align:left;font-size:.85rem}
      td{padding:9px 14px;border-bottom:1px solid #eee;font-size:.82rem}
      tr:nth-child(even){background:#f9f9f9}
      footer{margin-top:40px;font-size:.75rem;color:#aaa;text-align:center}
    </style></head><body>
    <h1>📊 AI Humanizer Pro — Session Report</h1>
    <p>Generated: <strong>${new Date().toLocaleString()}</strong> · Total transformations: <strong>${total}</strong></p>
    <div class="stats">
      <div class="stat"><div class="sv">${total}</div><div class="sl">Transformations</div></div>
      <div class="stat"><div class="sv">${avgAfterAI}%</div><div class="sl">Avg AI Score After</div></div>
      <div class="stat"><div class="sv">${avgHuman}%</div><div class="sl">Avg Humanization</div></div>
      <div class="stat"><div class="sv">${best.analytics?.afterAI ?? '—'}%</div><div class="sl">Best AI Score</div></div>
    </div>
    <h2>All Transformations</h2>
    <table>
      <tr><th>#</th><th>Mode</th><th>Style</th><th>AI Before</th><th>AI After</th><th>Human Score</th><th>Words</th></tr>
      ${history.map((h, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${h.mode}</td>
          <td>${h.style}</td>
          <td>${h.analytics?.beforeAI ?? '—'}%</td>
          <td>${h.analytics?.afterAI ?? '—'}%</td>
          <td>${h.analytics?.humanScore ?? '—'}%</td>
          <td>${h.inputText?.split(/\s+/).length ?? '—'}</td>
        </tr>
      `).join('')}
    </table>
    <footer>AI Humanizer Pro — Session Report</footer>
    </body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  function downloadAsWord(text, metadata = {}) {
    const { mode = 'Humanize', style = 'Standard', lang = 'English' } = metadata;
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>AI Humanizer Pro Output</title>
      <style>
        body { font-family: "Georgia", serif; line-height: 1.6; color: #333; }
        h1 { color: #4f46e5; font-size: 24pt; border-bottom: 2px solid #4f46e5; margin-bottom: 15pt; }
        .meta { color: #888; font-size: 10pt; margin-bottom: 20pt; border-bottom: 1px solid #eee; padding-bottom: 10pt; }
        .content { font-size: 12pt; white-space: pre-wrap; }
        footer { margin-top: 40pt; font-size: 9pt; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 10pt; }
      </style>
      </head>
      <body>
        <h1>AI Humanizer Pro — Transformed Output</h1>
        <div class="meta">
          Mode: <b>${mode}</b> | Style: <b>${style}</b> | Language: <b>${lang}</b> | Date: <b>${new Date().toLocaleString()}</b>
        </div>
        <div class="content">${text.replace(/\n/g, '<br/>')}</div>
        <footer>Generated by AI Humanizer Pro - https://ai-humanizer.pro</footer>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-humanizer-pro-${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    typeText,
    fixGrammar,
    highlightGenericPhrases,
    renderPlagiarismHighlight,
    processByParagraph,
    renderParagraphPanel,
    autoRetry,
    formatAsEmail,
    splitToThread,
    renderThreadPanel,
    generateCitation,
    renderCitationPanel,
    generateSessionReport,
    downloadAsWord,
  };
})();
