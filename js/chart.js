/**
 * Progress Chart Module — Line chart of AI score over sessions using Canvas
 */
const ProgressChart = (() => {

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem('aih-history') || '[]');
        } catch { return []; }
    }

    function render() {
        const section = document.getElementById('progress-chart-section');
        if (!section) return;

        const history = getHistory();
        if (history.length < 2) {
            section.style.display = 'none';
            return;
        }
        section.style.display = 'block';

        const canvas = document.getElementById('progress-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const PAD = { top: 20, right: 20, bottom: 40, left: 50 };

        ctx.clearRect(0, 0, W, H);

        // Data points — last 20 sessions
        const data = history.slice(-20).map((h, i) => ({
            x: i,
            before: h.analytics?.beforeAI ?? 80,
            after: h.analytics?.afterAI ?? 30,
            human: h.analytics?.humanScore ?? 70,
        }));

        const n = data.length;
        const chartW = W - PAD.left - PAD.right;
        const chartH = H - PAD.top - PAD.bottom;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = PAD.top + (chartH / 5) * i;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
            ctx.fillStyle = 'rgba(148,148,176,0.5)';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${100 - i * 20}%`, PAD.left - 6, y + 4);
        }

        // X labels
        ctx.fillStyle = 'rgba(148,148,176,0.5)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        data.forEach((d, i) => {
            const x = PAD.left + (i / Math.max(n - 1, 1)) * chartW;
            ctx.fillText(`#${i + 1}`, x, H - 8);
        });

        function drawLine(key, color, dash = []) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.setLineDash(dash);
            ctx.lineJoin = 'round';
            data.forEach((d, i) => {
                const x = PAD.left + (i / Math.max(n - 1, 1)) * chartW;
                const y = PAD.top + chartH - (d[key] / 100) * chartH;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.setLineDash([]);

            // Dots
            data.forEach((d, i) => {
                const x = PAD.left + (i / Math.max(n - 1, 1)) * chartW;
                const y = PAD.top + chartH - (d[key] / 100) * chartH;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });
        }

        drawLine('before', '#ef4444');
        drawLine('after', '#22c55e');
        drawLine('human', '#6366f1', [6, 3]);

        // Legend
        const legend = [
            { color: '#ef4444', label: 'AI Score Before' },
            { color: '#22c55e', label: 'AI Score After' },
            { color: '#6366f1', label: 'Humanization' },
        ];
        let lx = PAD.left;
        legend.forEach(({ color, label }) => {
            ctx.fillStyle = color;
            ctx.fillRect(lx, 4, 16, 3);
            ctx.fillStyle = 'rgba(200,200,220,0.8)';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(label, lx + 20, 10);
            lx += ctx.measureText(label).width + 40;
        });
    }

    return { render };
})();
