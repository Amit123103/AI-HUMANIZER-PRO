/**
 * Analytics & Scoring Engine
 * Calculates AI-likeness, humanization score, readability, originality, tone
 */

const Analytics = (() => {

    // ── AI Pattern Indicators ────────────────────────────────────────────────
    const aiPatterns = [
        /\bdelve\b/gi, /\bfacilitate\b/gi, /\bleverage\b/gi, /\boptimize\b/gi,
        /\butilize\b/gi, /\bparadigm\b/gi, /\bsynergy\b/gi, /\bholistic\b/gi,
        /\brobust\b/gi, /\bseamless\b/gi, /\bscalable\b/gi, /\bproactive\b/gi,
        /\bstreamline\b/gi, /\bcomprehensive\b/gi, /\bsophisticated\b/gi,
        /\bit is worth noting\b/gi, /\bit is important to note\b/gi,
        /\bit should be noted\b/gi, /\bin conclusion\b/gi, /\bin summary\b/gi,
        /\bfirstly\b/gi, /\bsecondly\b/gi, /\bthirdly\b/gi, /\blastly\b/gi,
        /\bfurthermore\b/gi, /\bmoreover\b/gi, /\badditionally\b/gi,
        /\bsubsequently\b/gi, /\bnevertheless\b/gi, /\bnotwithstanding\b/gi,
        /\bin order to\b/gi, /\bdue to the fact that\b/gi,
        /\bwith regard to\b/gi, /\bin terms of\b/gi,
        /\bcertainly\b/gi, /\babsolutely\b/gi, /\bof course\b/gi,
        /\bgreat question\b/gi, /\bas an ai\b/gi,
    ];

    // ── Readability (Flesch-Kincaid approximation) ───────────────────────────
    function countSyllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    function getReadabilityGrade(text) {
        const sentences = NLP.tokenizeSentences(text);
        const words = NLP.tokenizeWords(text);
        if (sentences.length === 0 || words.length === 0) return { grade: 0, level: 'N/A' };

        const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = totalSyllables / words.length;

        // Flesch-Kincaid Grade Level
        const fkGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
        const grade = Math.max(1, Math.min(18, Math.round(fkGrade)));

        let level;
        if (grade <= 6) level = 'Very Easy';
        else if (grade <= 8) level = 'Easy';
        else if (grade <= 10) level = 'Standard';
        else if (grade <= 12) level = 'Fairly Difficult';
        else if (grade <= 14) level = 'Difficult';
        else level = 'Very Difficult';

        return { grade, level };
    }

    // ── AI Likeness Score ─────────────────────────────────────────────────────
    function getAILikenessScore(text) {
        if (!text || text.trim().length < 10) return 0;

        const words = NLP.tokenizeWords(text);
        const sentences = NLP.tokenizeSentences(text);

        let score = 0;

        // Pattern matching (0-40 points)
        let patternHits = 0;
        for (const pattern of aiPatterns) {
            const matches = text.match(pattern);
            if (matches) patternHits += matches.length;
        }
        score += Math.min(40, patternHits * 3);

        // Sentence length uniformity (0-20 points) — AI tends to write uniform lengths
        if (sentences.length > 2) {
            const lengths = sentences.map(s => NLP.tokenizeWords(s).length);
            const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
            const stdDev = Math.sqrt(variance);
            // Low variance = more AI-like
            if (stdDev < 3) score += 20;
            else if (stdDev < 6) score += 12;
            else if (stdDev < 10) score += 5;
        }

        // Lexical diversity (0-20 points) — AI tends to repeat words
        const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
        const diversity = uniqueWords.size / words.length;
        if (diversity < 0.4) score += 20;
        else if (diversity < 0.55) score += 12;
        else if (diversity < 0.7) score += 5;

        // Passive voice detection (0-10 points)
        const passiveMatches = text.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || [];
        score += Math.min(10, passiveMatches.length * 3);

        // Formal connectors (0-10 points)
        const formalConnectors = text.match(/\b(furthermore|moreover|additionally|subsequently|nevertheless|notwithstanding)\b/gi) || [];
        score += Math.min(10, formalConnectors.length * 4);

        return Math.min(100, Math.round(score));
    }

    // ── Humanization Score ────────────────────────────────────────────────────
    function getHumanizationScore(text) {
        const aiScore = getAILikenessScore(text);
        // Humanization is inverse of AI score, with some noise for realism
        const base = 100 - aiScore;
        const noise = Math.floor(Math.random() * 6) - 3;
        return Math.max(0, Math.min(100, base + noise));
    }

    // ── Originality Score ─────────────────────────────────────────────────────
    function getOriginalityScore(originalText, newText) {
        if (!originalText || !newText) return 0;

        const origWords = NLP.tokenizeWords(originalText.toLowerCase());
        const newWords = NLP.tokenizeWords(newText.toLowerCase());

        // Calculate word overlap
        const origSet = new Set(origWords.map(w => w.replace(/[^a-z]/g, '')));
        const newSet = new Set(newWords.map(w => w.replace(/[^a-z]/g, '')));

        let commonWords = 0;
        for (const w of newSet) {
            if (origSet.has(w) && w.length > 3) commonWords++;
        }

        const overlap = commonWords / Math.max(origSet.size, 1);
        const originality = Math.round((1 - overlap) * 100);
        return Math.max(0, Math.min(100, originality));
    }

    // ── Tone Analysis ─────────────────────────────────────────────────────────
    function analyzeTone(text) {
        const lower = text.toLowerCase();
        const tones = {
            'Formal': 0,
            'Analytical': 0,
            'Confident': 0,
            'Conversational': 0,
            'Empathetic': 0,
        };

        // Formal indicators
        const formalWords = ['therefore', 'thus', 'consequently', 'furthermore', 'moreover', 'shall', 'must', 'require', 'obtain', 'demonstrate'];
        tones['Formal'] = Math.min(100, formalWords.filter(w => lower.includes(w)).length * 15);

        // Analytical indicators
        const analyticalWords = ['analyze', 'analysis', 'data', 'evidence', 'research', 'study', 'findings', 'results', 'indicates', 'suggests'];
        tones['Analytical'] = Math.min(100, analyticalWords.filter(w => lower.includes(w)).length * 15);

        // Confident indicators
        const confidentWords = ['will', 'must', 'clearly', 'definitely', 'certainly', 'always', 'proven', 'effective', 'best', 'key'];
        tones['Confident'] = Math.min(100, confidentWords.filter(w => lower.includes(w)).length * 12);

        // Conversational indicators
        const convWords = ["you", "your", "we", "our", "let's", "here's", "don't", "can't", "won't", "it's"];
        tones['Conversational'] = Math.min(100, convWords.filter(w => lower.includes(w)).length * 14);

        // Empathetic indicators
        const empWords = ['understand', 'feel', 'support', 'help', 'care', 'important', 'value', 'appreciate', 'consider', 'together'];
        tones['Empathetic'] = Math.min(100, empWords.filter(w => lower.includes(w)).length * 14);

        // Normalize so at least one is non-zero
        const max = Math.max(...Object.values(tones));
        if (max === 0) {
            tones['Formal'] = 40;
            tones['Confident'] = 30;
        }

        return tones;
    }

    // ── Sentence Structure Variation ──────────────────────────────────────────
    function getSentenceVariationScore(text) {
        const sentences = NLP.tokenizeSentences(text);
        if (sentences.length < 2) return { score: 50, breakdown: {} };

        const lengths = sentences.map(s => NLP.tokenizeWords(s).length);
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        // Higher stdDev = more variation = better score
        const variationScore = Math.min(100, Math.round(stdDev * 8));

        // Breakdown
        const short = lengths.filter(l => l <= 10).length;
        const medium = lengths.filter(l => l > 10 && l <= 20).length;
        const long = lengths.filter(l => l > 20).length;

        return {
            score: variationScore,
            breakdown: {
                'Short sentences (≤10 words)': `${short} (${Math.round(short / sentences.length * 100)}%)`,
                'Medium sentences (11-20 words)': `${medium} (${Math.round(medium / sentences.length * 100)}%)`,
                'Long sentences (>20 words)': `${long} (${Math.round(long / sentences.length * 100)}%)`,
                'Avg sentence length': `${Math.round(avg)} words`,
            }
        };
    }

    // ── Grammar Suggestions ───────────────────────────────────────────────────
    function getGrammarSuggestions(text) {
        const suggestions = [];
        if (text.match(/\bvery unique\b/gi)) suggestions.push({ type: 'redundancy', msg: '"Very unique" is redundant — "unique" already means one-of-a-kind.' });
        if (text.match(/\bmore better\b/gi)) suggestions.push({ type: 'grammar', msg: '"More better" is incorrect — use "better" alone.' });
        if (text.match(/\bless\s+\w+er\b/gi)) suggestions.push({ type: 'grammar', msg: 'Avoid "less + comparative" — use the base form instead.' });
        if (text.match(/\bpassive voice\b/gi)) suggestions.push({ type: 'style', msg: 'Consider using active voice for more direct writing.' });
        const passiveCount = (text.match(/\b(is|are|was|were)\s+\w+ed\b/gi) || []).length;
        if (passiveCount > 3) suggestions.push({ type: 'style', msg: `Found ${passiveCount} passive constructions — consider converting some to active voice.` });
        const longSentences = NLP.tokenizeSentences(text).filter(s => NLP.tokenizeWords(s).length > 35);
        if (longSentences.length > 0) suggestions.push({ type: 'clarity', msg: `${longSentences.length} sentence(s) are very long (>35 words) — consider breaking them up.` });
        return suggestions;
    }

    // ── Engagement Level ──────────────────────────────────────────────────────
    function getEngagementLevel(text) {
        const words = NLP.tokenizeWords(text);
        const sentences = NLP.tokenizeSentences(text);

        let score = 50; // base

        // Questions increase engagement
        const questions = (text.match(/\?/g) || []).length;
        score += Math.min(20, questions * 8);

        // Exclamations
        const exclamations = (text.match(/!/g) || []).length;
        score += Math.min(10, exclamations * 5);

        // Second person (you/your) increases engagement
        const secondPerson = (text.match(/\b(you|your|you're|you'll|you've)\b/gi) || []).length;
        score += Math.min(15, secondPerson * 3);

        // Very long text can reduce engagement
        if (words.length > 500) score -= 10;

        // Short sentences are more engaging
        const shortSentences = sentences.filter(s => NLP.tokenizeWords(s).length <= 12).length;
        score += Math.min(10, shortSentences * 2);

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // ── Linguistic Metrics (Entropy & Burstiness) ───────────────────────────
    function calculateEntropy(text) {
        const cleaned = text.toLowerCase().replace(/[^a-z\s]/g, '');
        const words = cleaned.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) return 0;

        const counts = {};
        words.forEach(w => counts[w] = (counts[w] || 0) + 1);

        const probs = Object.values(counts).map(c => c / words.length);
        const entropy = -probs.reduce((sum, p) => sum + p * Math.log2(p), 0);

        // Typical text entropy is between 3 and 7. Map to 0-100.
        const score = Math.min(100, Math.max(0, (entropy / 6) * 100));
        return Math.round(score);
    }

    function calculateBurstiness(text) {
        const sentences = NLP.tokenizeSentences(text);
        if (sentences.length < 3) return 50;

        const lengths = sentences.map(s => NLP.tokenizeWords(s).length);
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;

        // Variation coefficient (stdDev / mean) is a good proxy for burstiness
        const burstiness = (Math.sqrt(variance) / (avg || 1)) * 100;
        return Math.min(100, Math.round(burstiness * 1.5));
    }

    // ── Full Analysis ─────────────────────────────────────────────────────────
    function analyzeText(originalText, processedText) {
        const beforeAI = getAILikenessScore(originalText);
        const afterAI = getAILikenessScore(processedText);
        const humanScore = getHumanizationScore(processedText);
        const origScore = getOriginalityScore(originalText, processedText);
        const beforeRead = getReadabilityGrade(originalText);
        const afterRead = getReadabilityGrade(processedText);
        const toneAnalysis = analyzeTone(processedText);
        const structVariation = getSentenceVariationScore(processedText);
        const grammarSuggestions = getGrammarSuggestions(processedText);
        const engagementLevel = getEngagementLevel(processedText);

        // New Pro Metrics
        const entropy = calculateEntropy(processedText);
        const burstiness = calculateBurstiness(processedText);

        const readImprovement = beforeRead.grade > 0
            ? Math.round(((beforeRead.grade - afterRead.grade) / beforeRead.grade) * 100)
            : 0;

        return {
            beforeAI,
            afterAI,
            aiReduction: Math.max(0, beforeAI - afterAI),
            humanScore,
            origScore,
            beforeRead,
            afterRead,
            readImprovement,
            toneAnalysis,
            structVariation,
            grammarSuggestions,
            engagementLevel,
            entropy,
            burstiness,
        };
    }

    return {
        analyzeText,
        getAILikenessScore,
        getHumanizationScore,
        getReadabilityGrade,
        getOriginalityScore,
    };

})();
