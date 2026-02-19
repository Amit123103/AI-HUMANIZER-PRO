/**
 * Text-to-Speech Module — v2.0
 * Bug 2 Fix: proper multi-language voice selection
 * Upgrade 2: full BCP-47 language map for all 8 supported languages
 */

const TTS = (() => {
    let utterance = null;
    let isSpeaking = false;
    let isPaused = false;
    const synth = window.speechSynthesis;

    // ✅ Upgrade 2: BCP-47 language map for all 8 supported languages
    const LANG_MAP = {
        en: 'en-US', es: 'es-ES', fr: 'fr-FR',
        de: 'de-DE', hi: 'hi-IN', pt: 'pt-BR',
        it: 'it-IT', ar: 'ar-SA',
    };

    function isSupported() {
        return 'speechSynthesis' in window;
    }

    // ✅ Bug 2 Fix: filter voices by the actual selected language
    function getBestVoice(langCode) {
        const bcp47 = LANG_MAP[langCode] || langCode || 'en-US';
        const voices = synth.getVoices();
        if (!voices.length) return null;

        // Priority 1: exact locale match with Google/Natural voice
        const premium = voices.find(v =>
            v.lang === bcp47 && (v.name.includes('Google') || v.name.includes('Natural'))
        );
        if (premium) return premium;

        // Priority 2: exact locale match
        const exact = voices.find(v => v.lang === bcp47);
        if (exact) return exact;

        // Priority 3: language prefix match (e.g. 'es' matches 'es-MX')
        const prefix = langCode.split('-')[0];
        const partial = voices.find(v => v.lang.startsWith(prefix));
        if (partial) return partial;

        // Fallback: first available voice
        return voices[0];
    }

    function speak(text, options = {}) {
        if (!isSupported()) return;
        stop();

        utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || 0.95;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;
        utterance.lang = LANG_MAP[options.lang] || options.lang || 'en-US';

        // Voices may not be loaded yet — wait if needed
        const setVoiceAndSpeak = () => {
            const voice = getBestVoice(options.lang || 'en');
            if (voice) utterance.voice = voice;
            synth.speak(utterance);
        };

        if (synth.getVoices().length === 0) {
            synth.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
        } else {
            setVoiceAndSpeak();
        }

        utterance.onstart = () => { isSpeaking = true; isPaused = false; updateBtn('pause'); };
        utterance.onend = () => { isSpeaking = false; isPaused = false; updateBtn('play'); };
        utterance.onerror = () => { isSpeaking = false; isPaused = false; updateBtn('play'); };
        utterance.onpause = () => { isPaused = true; updateBtn('resume'); };
        utterance.onresume = () => { isPaused = false; updateBtn('pause'); };
    }

    function pause() { if (synth.speaking && !synth.paused) synth.pause(); }
    function resume() { if (synth.paused) synth.resume(); }
    function stop() {
        synth.cancel();
        isSpeaking = false; isPaused = false;
        updateBtn('play');
    }

    function toggle(text, options) {
        if (!isSpeaking) speak(text, options);
        else if (isPaused) resume();
        else pause();
    }

    function updateBtn(state) {
        const btn = document.getElementById('tts-btn');
        const icon = document.getElementById('tts-icon');
        const label = document.getElementById('tts-label');
        if (!btn) return;
        if (state === 'pause') {
            if (icon) icon.textContent = '⏸';
            if (label) label.textContent = 'Pause';
            btn.classList.add('active');
        } else if (state === 'resume') {
            if (icon) icon.textContent = '▶';
            if (label) label.textContent = 'Resume';
        } else {
            if (icon) icon.textContent = '🔊';
            if (label) label.textContent = 'Listen';
            btn.classList.remove('active');
        }
    }

    function getState() { return { isSpeaking, isPaused }; }

    return { speak, pause, resume, stop, toggle, isSupported, getState, updateBtn };
})();
