# AI Humanizer Pro

AI Humanizer Pro is an advanced, client-side web application designed to transform AI-generated text into natural, human-like writing. It features a powerful NLP engine that paraphrases, humanizes, and rewrites content while preserving the original meaning, helping users bypass AI detection systems.

![AI Humanizer Interface](https://via.placeholder.com/800x400?text=AI+Humanizer+Pro+Interface)

## 🚀 Key Features

-   **Three Transformation Modes**:
    -   **Humanize**: Subtle adjustments to improve natural flow.
    -   **Paraphrase**: Structural changes to rephrase sentences.
    -   **Rewrite**: Deep transformation for maximum uniqueness.
-   **Advanced Mode**:
    -   **Maximum Strength (⭐)**: activates "Hyper-Advanced" multi-pass rewriting for drastic text changes.
-   **Smart Analytics**:
    -   Real-time AI Likeness score.
    -   Readability grading (Gunning Fog, Flesch-Kincaid).
    -   Tone analysis and sentence structure breakdown.
-   **Live Writing Coach**:
    -   Real-time tips to avoid "AI patterns" (e.g., overuse of "delve", "utilize").
    -   Structural suggestions for sentence variety.
-   **Integration Tools**:
    -   One-click export to Word (.docx) and PDF.
    -   Email formatter, Twitter thread splitter, and Citation generator.
-   **Local Processing**:
    -   All NLP logic runs directly in your browser. No data is sent to external servers for processing, ensuring privacy.

## 🛠️ Technology Stack

-   **Frontend**: HTML5, CSS3 (Custom properties, Flexbox/Grid)
-   **Logic**: Vanilla JavaScript (ES6+)
-   **Libraries**:
    -   `mammoth.js` (Docx support)
    -   `jspdf` (PDF generation)
    -   `chart.js` (Analytics visualization)

## 📦 Installation & Usage

Since this is a client-side application, no backend server setup is required.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/ai-humanizer-pro.git
    cd ai-humanizer-pro
    ```

2.  **Run the application**:
    -   Simply open `index.html` in any modern web browser.
    -   *Optional*: Use a local server like `Live Server` (VS Code extension) or `python -m http.server` for a better experience with module loading.

3.  **Deploy**:
    -   Upload the files to any static host (GitHub Pages, Vercel, Netlify).

## 💡 How It Works

The core logic resides in `js/nlp.js`. It uses a combination of:
-   **Synonym Replacement**: Context-aware swapping of words.
-   **Sentence Restructuring**: Flipping active/passive voice, moving clauses, and splitting long sentences.
-   **AI Pattern Removal**: Identifying and replacing common "AI words" and phrases.
-   **Multi-Pass Engine**: At maximum strength, the text undergoes multiple transformation passes for deeper rewriting.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
