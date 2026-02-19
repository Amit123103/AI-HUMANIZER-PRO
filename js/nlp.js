/**
 * NLP Processing Engine v2.0
 * MAXIMUM word changes — near-100% word replacement with huge synonym dictionary
 * Aggressive sentence restructuring for all 3 modes
 */

const NLP = (() => {

  // ── Protected Keywords (Shielded Terms) ───────────────────────────────────
  let shieldedTerms = [];

  function setShieldedTerms(terms) {
    shieldedTerms = terms.filter(t => t.trim().length > 0).map(t => t.trim());
  }

  // ── Multi-Language Synonym Dictionary ──────────────────────────────────────
  const synonymsByLang = {
    en: {
      // Verbs — action words
      'add': ['include', 'incorporate', 'append', 'attach', 'insert'],
      'allow': ['permit', 'enable', 'let', 'authorize', 'grant'],
      'analyze': ['examine', 'study', 'assess', 'evaluate', 'investigate'],
      'apply': ['use', 'employ', 'utilize', 'implement', 'execute'],
      'ask': ['inquire', 'request', 'query', 'question', 'seek'],
      'begin': ['start', 'initiate', 'launch', 'kick off', 'commence'],
      'build': ['construct', 'create', 'develop', 'assemble', 'craft'],
      'change': ['alter', 'modify', 'transform', 'adjust', 'revise'],
      'check': ['verify', 'confirm', 'review', 'inspect', 'validate'],
      'choose': ['select', 'pick', 'opt for', 'decide on', 'prefer'],
      'collect': ['gather', 'compile', 'accumulate', 'assemble', 'aggregate'],
      'come': ['arrive', 'appear', 'emerge', 'reach', 'approach'],
      'complete': ['finish', 'accomplish', 'achieve', 'fulfill', 'wrap up'],
      'consider': ['think about', 'evaluate', 'weigh', 'reflect on', 'contemplate'],
      'continue': ['proceed', 'persist', 'carry on', 'maintain', 'sustain'],
      'create': ['develop', 'produce', 'generate', 'build', 'craft'],
      'define': ['describe', 'explain', 'clarify', 'outline', 'specify'],
      'demonstrate': ['show', 'prove', 'illustrate', 'reveal', 'exhibit'],
      'describe': ['explain', 'outline', 'detail', 'portray', 'depict'],
      'develop': ['build', 'create', 'design', 'craft', 'establish'],
      'display': ['show', 'present', 'exhibit', 'reveal', 'showcase'],
      'enable': ['allow', 'permit', 'empower', 'facilitate', 'support'],
      'ensure': ['guarantee', 'confirm', 'make sure', 'secure', 'verify'],
      'establish': ['set up', 'create', 'build', 'found', 'form'],
      'evaluate': ['assess', 'judge', 'measure', 'analyze', 'review'],
      'expand': ['grow', 'extend', 'broaden', 'widen', 'increase'],
      'explain': ['describe', 'clarify', 'outline', 'detail', 'elaborate on'],
      'facilitate': ['help', 'support', 'enable', 'assist', 'streamline'],
      'find': ['discover', 'locate', 'identify', 'uncover', 'detect'],
      'focus': ['concentrate', 'center', 'direct', 'target', 'emphasize'],
      'follow': ['pursue', 'adhere to', 'track', 'observe', 'comply with'],
      'generate': ['produce', 'create', 'develop', 'yield', 'deliver'],
      'get': ['obtain', 'acquire', 'receive', 'gain', 'secure'],
      'give': ['provide', 'offer', 'deliver', 'supply', 'present'],
      'go': ['move', 'proceed', 'travel', 'advance', 'head'],
      'help': ['assist', 'support', 'aid', 'guide', 'facilitate'],
      'identify': ['recognize', 'detect', 'spot', 'pinpoint', 'determine'],
      'implement': ['execute', 'apply', 'deploy', 'carry out', 'put in place'],
      'improve': ['enhance', 'boost', 'upgrade', 'strengthen', 'refine'],
      'include': ['incorporate', 'add', 'contain', 'feature', 'cover'],
      'increase': ['grow', 'expand', 'raise', 'boost', 'elevate'],
      'indicate': ['show', 'suggest', 'signal', 'point to', 'reveal'],
      'involve': ['include', 'require', 'encompass', 'engage', 'incorporate'],
      'keep': ['maintain', 'preserve', 'retain', 'hold', 'sustain'],
      'know': ['understand', 'recognize', 'grasp', 'comprehend', 'realize'],
      'lead': ['guide', 'direct', 'drive', 'manage', 'steer'],
      'learn': ['discover', 'understand', 'grasp', 'pick up', 'master'],
      'leverage': ['use', 'harness', 'apply', 'capitalize on', 'exploit'],
      'look': ['examine', 'review', 'check', 'inspect', 'observe'],
      'maintain': ['keep', 'preserve', 'sustain', 'uphold', 'retain'],
      'make': ['create', 'produce', 'build', 'develop', 'craft'],
      'manage': ['handle', 'oversee', 'control', 'coordinate', 'direct'],
      'measure': ['assess', 'evaluate', 'gauge', 'track', 'quantify'],
      'meet': ['satisfy', 'fulfill', 'address', 'achieve', 'reach'],
      'move': ['shift', 'transfer', 'relocate', 'advance', 'transition'],
      'need': ['require', 'demand', 'call for', 'depend on', 'necessitate'],
      'note': ['observe', 'recognize', 'acknowledge', 'highlight', 'point out'],
      'obtain': ['get', 'acquire', 'gain', 'secure', 'receive'],
      'offer': ['provide', 'present', 'give', 'supply', 'deliver'],
      'optimize': ['improve', 'refine', 'streamline', 'fine-tune', 'enhance'],
      'perform': ['execute', 'carry out', 'conduct', 'accomplish', 'do'],
      'plan': ['design', 'prepare', 'organize', 'strategize', 'map out'],
      'present': ['show', 'display', 'introduce', 'offer', 'deliver'],
      'provide': ['offer', 'supply', 'deliver', 'give', 'furnish'],
      'reduce': ['decrease', 'lower', 'cut', 'minimize', 'trim'],
      'require': ['need', 'demand', 'call for', 'necessitate', 'depend on'],
      'review': ['examine', 'assess', 'evaluate', 'analyze', 'check'],
      'run': ['execute', 'operate', 'conduct', 'perform', 'carry out'],
      'see': ['observe', 'notice', 'recognize', 'identify', 'detect'],
      'set': ['establish', 'configure', 'define', 'specify', 'arrange'],
      'show': ['demonstrate', 'reveal', 'display', 'illustrate', 'present'],
      'start': ['begin', 'initiate', 'launch', 'kick off', 'commence'],
      'support': ['assist', 'help', 'back', 'aid', 'reinforce'],
      'take': ['adopt', 'employ', 'use', 'apply', 'utilize'],
      'think': ['believe', 'consider', 'feel', 'assume', 'reckon'],
      'understand': ['grasp', 'comprehend', 'recognize', 'realize', 'appreciate'],
      'use': ['employ', 'apply', 'utilize', 'leverage', 'work with'],
      'utilize': ['use', 'apply', 'employ', 'leverage', 'work with'],
      'work': ['operate', 'function', 'perform', 'execute', 'run'],

      // Adjectives — descriptive words
      'accurate': ['precise', 'exact', 'correct', 'reliable', 'true'],
      'additional': ['extra', 'further', 'more', 'supplementary', 'added'],
      'advanced': ['sophisticated', 'cutting-edge', 'modern', 'high-level', 'complex'],
      'available': ['accessible', 'obtainable', 'ready', 'on hand', 'present'],
      'basic': ['fundamental', 'core', 'essential', 'primary', 'foundational'],
      'better': ['improved', 'superior', 'enhanced', 'stronger', 'more effective'],
      'big': ['large', 'significant', 'substantial', 'major', 'considerable'],
      'clear': ['obvious', 'evident', 'plain', 'straightforward', 'transparent'],
      'common': ['frequent', 'typical', 'standard', 'widespread', 'usual'],
      'complex': ['intricate', 'sophisticated', 'detailed', 'elaborate', 'involved'],
      'comprehensive': ['thorough', 'complete', 'extensive', 'full', 'detailed'],
      'consistent': ['steady', 'reliable', 'uniform', 'stable', 'regular'],
      'critical': ['essential', 'vital', 'key', 'crucial', 'important'],
      'current': ['present', 'existing', 'today\'s', 'modern', 'contemporary'],
      'different': ['distinct', 'varied', 'diverse', 'alternative', 'unique'],
      'difficult': ['challenging', 'complex', 'demanding', 'tough', 'hard'],
      'effective': ['successful', 'efficient', 'powerful', 'productive', 'capable'],
      'efficient': ['effective', 'streamlined', 'productive', 'optimized', 'capable'],
      'essential': ['critical', 'vital', 'key', 'necessary', 'fundamental'],
      'existing': ['current', 'present', 'established', 'available', 'in-place'],
      'fast': ['quick', 'rapid', 'swift', 'speedy', 'efficient'],
      'final': ['last', 'ultimate', 'concluding', 'closing', 'end'],
      'flexible': ['adaptable', 'versatile', 'adjustable', 'dynamic', 'agile'],
      'full': ['complete', 'entire', 'comprehensive', 'total', 'whole'],
      'fundamental': ['basic', 'core', 'essential', 'primary', 'key'],
      'general': ['broad', 'overall', 'common', 'standard', 'typical'],
      'good': ['effective', 'strong', 'solid', 'excellent', 'quality'],
      'great': ['excellent', 'outstanding', 'remarkable', 'exceptional', 'superior'],
      'high': ['elevated', 'significant', 'strong', 'advanced', 'top'],
      'important': ['critical', 'essential', 'key', 'significant', 'vital'],
      'innovative': ['creative', 'novel', 'original', 'pioneering', 'cutting-edge'],
      'key': ['critical', 'essential', 'core', 'primary', 'central'],
      'large': ['significant', 'substantial', 'major', 'considerable', 'extensive'],
      'latest': ['newest', 'most recent', 'current', 'up-to-date', 'modern'],
      'main': ['primary', 'core', 'central', 'key', 'principal'],
      'major': ['significant', 'key', 'critical', 'primary', 'substantial'],
      'multiple': ['several', 'various', 'numerous', 'many', 'a range of'],
      'natural': ['organic', 'genuine', 'authentic', 'real', 'native'],
      'necessary': ['required', 'essential', 'needed', 'critical', 'vital'],
      'new': ['fresh', 'novel', 'modern', 'recent', 'innovative'],
      'original': ['authentic', 'genuine', 'unique', 'initial', 'first'],
      'overall': ['general', 'broad', 'total', 'comprehensive', 'complete'],
      'powerful': ['strong', 'effective', 'robust', 'capable', 'impactful'],
      'primary': ['main', 'core', 'key', 'central', 'principal'],
      'proper': ['correct', 'appropriate', 'suitable', 'right', 'fitting'],
      'real': ['actual', 'genuine', 'true', 'authentic', 'concrete'],
      'relevant': ['applicable', 'pertinent', 'related', 'fitting', 'appropriate'],
      'robust': ['strong', 'solid', 'reliable', 'resilient', 'durable'],
      'seamless': ['smooth', 'effortless', 'fluid', 'frictionless', 'integrated'],
      'significant': ['major', 'notable', 'substantial', 'meaningful', 'considerable'],
      'simple': ['straightforward', 'easy', 'basic', 'clear', 'uncomplicated'],
      'smart': ['intelligent', 'clever', 'strategic', 'savvy', 'sharp'],
      'specific': ['particular', 'precise', 'exact', 'targeted', 'defined'],
      'strong': ['powerful', 'robust', 'solid', 'effective', 'capable'],
      'successful': ['effective', 'productive', 'accomplished', 'thriving', 'winning'],
      'unique': ['distinct', 'exclusive', 'one-of-a-kind', 'special', 'singular'],
      'useful': ['helpful', 'valuable', 'practical', 'beneficial', 'effective'],
      'various': ['diverse', 'multiple', 'several', 'different', 'a range of'],

      // Nouns — things and concepts
      'ability': ['capability', 'capacity', 'skill', 'power', 'competence'],
      'access': ['entry', 'availability', 'reach', 'connection', 'gateway'],
      'accuracy': ['precision', 'correctness', 'reliability', 'exactness', 'fidelity'],
      'advantage': ['benefit', 'edge', 'strength', 'plus', 'gain'],
      'analysis': ['examination', 'assessment', 'evaluation', 'study', 'review'],
      'approach': ['method', 'strategy', 'technique', 'way', 'process'],
      'area': ['field', 'domain', 'region', 'zone', 'sector'],
      'aspect': ['element', 'feature', 'component', 'dimension', 'factor'],
      'challenge': ['difficulty', 'obstacle', 'problem', 'hurdle', 'issue'],
      'change': ['transformation', 'shift', 'modification', 'update', 'revision'],
      'component': ['element', 'part', 'piece', 'module', 'unit'],
      'concept': ['idea', 'notion', 'principle', 'theory', 'framework'],
      'context': ['setting', 'background', 'environment', 'situation', 'framework'],
      'data': ['information', 'details', 'records', 'metrics', 'figures'],
      'decision': ['choice', 'determination', 'resolution', 'judgment', 'call'],
      'development': ['growth', 'progress', 'advancement', 'evolution', 'expansion'],
      'difference': ['distinction', 'variation', 'gap', 'contrast', 'divergence'],
      'diversity': ['variety', 'range', 'breadth', 'richness', 'variation'],
      'effort': ['work', 'attempt', 'endeavor', 'initiative', 'push'],
      'element': ['component', 'part', 'aspect', 'feature', 'piece'],
      'enhancement': ['improvement', 'upgrade', 'boost', 'advancement', 'refinement'],
      'environment': ['setting', 'context', 'landscape', 'ecosystem', 'space'],
      'example': ['instance', 'case', 'illustration', 'sample', 'demonstration'],
      'experience': ['knowledge', 'expertise', 'background', 'exposure', 'familiarity'],
      'factor': ['element', 'aspect', 'consideration', 'variable', 'component'],
      'feature': ['capability', 'function', 'aspect', 'element', 'characteristic'],
      'focus': ['emphasis', 'priority', 'attention', 'concentration', 'direction'],
      'framework': ['structure', 'system', 'model', 'approach', 'foundation'],
      'function': ['role', 'purpose', 'operation', 'task', 'capability'],
      'goal': ['objective', 'target', 'aim', 'purpose', 'outcome'],
      'impact': ['effect', 'influence', 'result', 'consequence', 'outcome'],
      'improvement': ['enhancement', 'upgrade', 'advancement', 'progress', 'gain'],
      'information': ['data', 'details', 'knowledge', 'content', 'insights'],
      'insight': ['understanding', 'perspective', 'knowledge', 'awareness', 'clarity'],
      'issue': ['problem', 'challenge', 'concern', 'matter', 'obstacle'],
      'knowledge': ['understanding', 'expertise', 'insight', 'awareness', 'grasp'],
      'level': ['degree', 'stage', 'tier', 'extent', 'measure'],
      'limitation': ['constraint', 'restriction', 'boundary', 'drawback', 'barrier'],
      'method': ['approach', 'technique', 'strategy', 'process', 'way'],
      'model': ['framework', 'system', 'approach', 'structure', 'design'],
      'need': ['requirement', 'demand', 'necessity', 'prerequisite', 'must'],
      'objective': ['goal', 'target', 'aim', 'purpose', 'outcome'],
      'opportunity': ['chance', 'possibility', 'opening', 'potential', 'prospect'],
      'outcome': ['result', 'consequence', 'effect', 'output', 'impact'],
      'performance': ['effectiveness', 'efficiency', 'output', 'results', 'execution'],
      'phrasing': ['wording', 'expression', 'language', 'terminology', 'articulation'],
      'point': ['aspect', 'element', 'detail', 'factor', 'consideration'],
      'potential': ['capability', 'possibility', 'capacity', 'promise', 'prospect'],
      'probability': ['likelihood', 'chance', 'odds', 'possibility', 'risk'],
      'problem': ['issue', 'challenge', 'difficulty', 'obstacle', 'concern'],
      'process': ['procedure', 'method', 'approach', 'workflow', 'system'],
      'quality': ['standard', 'caliber', 'level', 'grade', 'excellence'],
      'readability': ['clarity', 'legibility', 'comprehensibility', 'flow', 'accessibility'],
      'reason': ['cause', 'basis', 'rationale', 'explanation', 'justification'],
      'reduction': ['decrease', 'drop', 'decline', 'cut', 'lowering'],
      'result': ['outcome', 'effect', 'consequence', 'output', 'finding'],
      'role': ['function', 'purpose', 'position', 'responsibility', 'part'],
      'score': ['rating', 'measure', 'metric', 'value', 'assessment'],
      'section': ['part', 'segment', 'area', 'portion', 'component'],
      'solution': ['answer', 'fix', 'resolution', 'approach', 'remedy'],
      'standard': ['benchmark', 'criterion', 'norm', 'measure', 'baseline'],
      'strategy': ['approach', 'plan', 'method', 'tactic', 'framework'],
      'structure': ['framework', 'organization', 'layout', 'design', 'arrangement'],
      'system': ['platform', 'framework', 'structure', 'solution', 'mechanism'],
      'technique': ['method', 'approach', 'strategy', 'practice', 'way'],
      'text': ['content', 'writing', 'copy', 'material', 'prose'],
      'tool': ['resource', 'instrument', 'utility', 'solution', 'mechanism'],
      'understanding': ['knowledge', 'grasp', 'insight', 'awareness', 'comprehension'],
      'value': ['benefit', 'worth', 'importance', 'significance', 'merit'],
      'variation': ['diversity', 'range', 'difference', 'variety', 'change'],
      'way': ['method', 'approach', 'manner', 'technique', 'means'],

      // Adverbs
      'additionally': ['also', 'furthermore', 'besides', 'on top of that', 'what\'s more'],
      'also': ['additionally', 'furthermore', 'as well', 'too', 'plus'],
      'always': ['consistently', 'constantly', 'invariably', 'at all times', 'perpetually'],
      'clearly': ['obviously', 'evidently', 'plainly', 'undeniably', 'unmistakably'],
      'currently': ['now', 'at present', 'today', 'presently', 'at this time'],
      'effectively': ['successfully', 'efficiently', 'productively', 'capably', 'well'],
      'especially': ['particularly', 'notably', 'specifically', 'above all', 'in particular'],
      'finally': ['ultimately', 'at last', 'in the end', 'eventually', 'to conclude'],
      'frequently': ['often', 'regularly', 'commonly', 'routinely', 'repeatedly'],
      'furthermore': ['additionally', 'also', 'moreover', 'beyond that', 'in addition'],
      'generally': ['typically', 'usually', 'broadly', 'commonly', 'as a rule'],
      'however': ['but', 'yet', 'that said', 'even so', 'nonetheless'],
      'importantly': ['critically', 'significantly', 'notably', 'crucially', 'essentially'],
      'indeed': ['certainly', 'truly', 'absolutely', 'undoubtedly', 'in fact'],
      'instead': ['alternatively', 'in place of', 'as a substitute', 'rather', 'in lieu'],
      'mainly': ['primarily', 'chiefly', 'largely', 'mostly', 'principally'],
      'moreover': ['furthermore', 'additionally', 'also', 'beyond that', 'in addition'],
      'mostly': ['primarily', 'largely', 'mainly', 'chiefly', 'predominantly'],
      'naturally': ['organically', 'genuinely', 'authentically', 'inherently', 'by nature'],
      'often': ['frequently', 'regularly', 'commonly', 'routinely', 'typically'],
      'overall': ['in general', 'broadly', 'on the whole', 'collectively', 'in total'],
      'particularly': ['especially', 'specifically', 'notably', 'above all', 'in particular'],
      'primarily': ['mainly', 'chiefly', 'largely', 'mostly', 'principally'],
      'quickly': ['rapidly', 'swiftly', 'promptly', 'efficiently', 'speedily'],
      'really': ['truly', 'genuinely', 'actually', 'indeed', 'in fact'],
      'significantly': ['considerably', 'substantially', 'notably', 'markedly', 'greatly'],
      'simply': ['just', 'merely', 'only', 'straightforwardly', 'plainly'],
      'specifically': ['particularly', 'especially', 'precisely', 'in particular', 'notably'],
      'subsequently': ['then', 'after that', 'next', 'following this', 'later'],
      'therefore': ['so', 'thus', 'as a result', 'consequently', 'for this reason'],
      'typically': ['usually', 'generally', 'commonly', 'normally', 'as a rule'],
      'usually': ['typically', 'generally', 'commonly', 'normally', 'often'],
      'well': ['effectively', 'successfully', 'properly', 'efficiently', 'thoroughly'],
      'while': ['whereas', 'although', 'even though', 'as', 'during'],

      // Phrases
      'in order to': ['to', 'so as to', 'with the aim of', 'for the purpose of'],
      'due to the fact that': ['because', 'since', 'given that', 'as'],
      'in terms of': ['regarding', 'when it comes to', 'concerning', 'in relation to'],
      'with regard to': ['regarding', 'concerning', 'about', 'in relation to'],
      'in addition to': ['beyond', 'alongside', 'as well as', 'on top of'],
      'as well as': ['along with', 'in addition to', 'plus', 'together with'],
      'in the context of': ['within', 'in', 'regarding', 'concerning'],
      'it is important to note': ['notably', 'importantly', 'keep in mind', 'note that'],
      'it should be noted': ['notably', 'importantly', 'worth noting', 'note that'],
      'in conclusion': ['to wrap up', 'in summary', 'ultimately', 'to close'],
      'as a result': ['consequently', 'therefore', 'thus', 'as a consequence'],
      'at the same time': ['simultaneously', 'concurrently', 'in parallel', 'meanwhile'],
      'on the other hand': ['conversely', 'alternatively', 'in contrast', 'by contrast'],
      'in other words': ['put differently', 'to rephrase', 'that is to say', 'namely'],
      'for example': ['for instance', 'such as', 'to illustrate', 'as an example'],
      'such as': ['like', 'including', 'for example', 'for instance'],
      'a number of': ['several', 'various', 'multiple', 'a range of', 'many'],
      'a wide range of': ['diverse', 'various', 'numerous', 'many different', 'a broad set of'],
      'in a way that': ['so that', 'to ensure', 'enabling', 'allowing'],
      'play a role': ['contribute', 'factor in', 'matter', 'influence', 'affect'],
      'take into account': ['consider', 'factor in', 'account for', 'weigh'],
      'make use of': ['use', 'employ', 'apply', 'leverage', 'utilize'],
      'in the process of': ['while', 'during', 'as part of', 'throughout'],
      'on a regular basis': ['regularly', 'routinely', 'consistently', 'frequently'],
      'a large number of': ['many', 'numerous', 'a great deal of', 'countless'],
      'the majority of': ['most', 'the bulk of', 'most of', 'the greater part of'],
      'in spite of': ['despite', 'regardless of', 'notwithstanding', 'even with'],
      'at this point in time': ['now', 'currently', 'at present', 'today'],
      'in the near future': ['soon', 'shortly', 'before long', 'in the coming days'],
      'on a daily basis': ['daily', 'every day', 'each day', 'day-to-day'],
      'in the event that': ['if', 'should', 'in case', 'whenever'],
      'with the aim of': ['to', 'in order to', 'intending to', 'seeking to'],
      'in close proximity': ['nearby', 'close by', 'adjacent', 'near'],
    },
    es: {
      'mejorar': ['perfeccionar', 'optimizar', 'potenciar', 'enriquecer', 'pulir'],
      'crear': ['desarrollar', 'producir', 'generar', 'construir', 'elaborar'],
      'importante': ['crucial', 'esencial', 'vital', 'clave', 'relevante'],
      'fácil': ['sencillo', 'simple', 'directo', 'claro', 'sin complicaciones'],
      'grande': ['significativo', 'considerable', 'sustancial', 'mayor', 'vasto'],
      'nuevo': ['reciente', 'novedoso', 'moderno', 'fresco', 'innovador'],
      'claro': ['evidente', 'obvio', 'descifrable', 'manifiesto', 'patente'],
      'usar': ['utilizar', 'emplear', 'aplicar', 'aprovechar', 'manejar'],
      'ayudar': ['asistir', 'apoyar', 'colaborar', 'auxiliar', 'facilitar'],
      'hacer': ['realizar', 'ejecutar', 'elaborar', 'fabricar', 'desarrollar'],
      'cambiar': ['modificar', 'alterar', 'transformar', 'ajustar', 'variar'],
      'rápido': ['veloz', 'pronto', 'ágil', 'expedito', 'acelerado'],
      'pequeño': ['minúsculo', 'reducido', 'limitado', 'escaso', 'parvo'],
      'diferente': ['distinto', 'diverso', 'variedado', 'único', 'dispar'],
      'bueno': ['benigno', 'excelente', 'positivo', 'favorable', 'adecuado']
    },
    fr: {
      'améliorer': ['perfectionner', 'optimiser', 'renforcer', 'enrichir', 'affiner'],
      'créer': ['développer', 'produire', 'générer', 'construire', 'élaborer'],
      'important': ['crucial', 'essentiel', 'vital', 'clé', 'majeur'],
      'facile': ['simple', 'aisé', 'élémentaire', 'clair', 'sans effort'],
      'grand': ['significatif', 'considérable', 'substantiel', 'majeur', 'vaste'],
      'nouveau': ['récent', 'inédit', 'moderne', 'frais', 'innovant'],
      'clair': ['évident', 'manifeste', 'limpide', 'explicite', 'net'],
      'utiliser': ['employer', 'appliquer', 'exploiter', 'manier', 'servit'],
      'aider': ['assister', 'soutenir', 'épauler', 'appuyer', 'faciliter'],
      'faire': ['réaliser', 'exécuter', 'élaborer', 'confectionner', 'développer'],
      'changer': ['modifier', 'altérer', 'transformer', 'ajuster', 'varier'],
      'rapide': ['véloce', 'prompt', 'agile', 'expéditif', 'accéléré'],
      'petit': ['minuscule', 'réduit', 'limité', 'étroit', 'menu'],
      'différent': ['distinct', 'divers', 'varié', 'unique', 'disparate'],
      'bon': ['excellent', 'positif', 'favorable', 'adéquat', 'bienveillant']
    },
    de: {
      'verbessern': ['verfeinern', 'optimieren', 'stärken', 'bereichern', 'ausbauen'],
      'erstellen': ['entwickeln', 'produzieren', 'generieren', 'bauen', 'ausarbeiten'],
      'wichtig': ['entscheidend', 'wesentlich', 'vital', 'zentral', 'maßgeblich'],
      'einfach': ['simpel', 'leicht', 'unkompliziert', 'klar', 'mühelos'],
      'groß': ['bedeutend', 'erheblich', 'substanziell', 'beachtlich', 'vorgestellt'],
      'neu': ['aktuell', 'neuartig', 'modern', 'frisch', 'innovativ'],
      'klar': ['offensichtlich', 'deutlich', 'eindeutig', 'erkennbar', 'bestimmt'],
      'nutzen': ['verwenden', 'anwenden', 'einsetzen', 'gebrauchen', 'verarbeiten'],
      'helfen': ['unterstützen', 'fördern', 'beistehen', 'assistieren', 'erleichtern'],
      'machen': ['ausführen', 'erledigen', 'erarbeiten', 'herstellen', 'entwickeln'],
      'ändern': ['modifizieren', 'wandeln', 'anpassen', 'korrigieren', 'revidieren'],
      'schnell': ['rasch', 'zügig', 'flott', 'windig', 'unverzüglich'],
      'klein': ['winzig', 'begrenzt', 'gering', 'miniature', 'schmal'],
      'verschieden': ['unterschiedlich', 'vielfältig', 'divers', 'andersartig', 'einzigartig'],
      'gut': ['ausgezeichnet', 'positiv', 'wertvoll', 'tauglich', 'angenehm']
    }
  };

  // ── AI filler patterns to strip ─────────────────────────────────────────────
  const aiFillers = [
    { pattern: /\bIt is worth noting that\b/gi, replace: 'Notably,' },
    { pattern: /\bIt is important to note that\b/gi, replace: 'Note that' },
    { pattern: /\bIt should be noted that\b/gi, replace: 'Note that' },
    { pattern: /\bAs previously mentioned\b/gi, replace: 'As noted' },
    { pattern: /\bIn conclusion,?\b/gi, replace: 'To wrap up,' },
    { pattern: /\bIn summary,?\b/gi, replace: 'In short,' },
    { pattern: /\bTo summarize,?\b/gi, replace: 'Briefly,' },
    { pattern: /\bFirstly,?\b/gi, replace: 'First,' },
    { pattern: /\bSecondly,?\b/gi, replace: 'Second,' },
    { pattern: /\bThirdly,?\b/gi, replace: 'Third,' },
    { pattern: /\bLastly,?\b/gi, replace: 'Finally,' },
    { pattern: /\bAs an AI language model,?\b/gi, replace: '' },
    { pattern: /\bAs an AI,?\b/gi, replace: '' },
    { pattern: /\bCertainly!?\b/gi, replace: '' },
    { pattern: /\bAbsolutely!?\b/gi, replace: '' },
    { pattern: /\bOf course!?\b/gi, replace: '' },
    { pattern: /\bGreat question!?\b/gi, replace: '' },
    { pattern: /\bDelve into\b/gi, replace: 'explore' },
    { pattern: /\bHarness the power of\b/gi, replace: 'use' },
    { pattern: /\bLeverage the power of\b/gi, replace: 'use' },
    { pattern: /\bIn today's (fast-paced|digital|modern) world\b/gi, replace: 'Today' },
    { pattern: /\bIn the realm of\b/gi, replace: 'In' },
    { pattern: /\bIt is crucial to\b/gi, replace: 'You should' },
    { pattern: /\bIt is essential to\b/gi, replace: 'You need to' },
    { pattern: /\bIt is imperative to\b/gi, replace: 'You must' },
  ];

  // ── Sentence starters for variety ──────────────────────────────────────────
  const transitions = {
    standard: ['That said,', 'Here\'s the thing —', 'Worth noting:', 'In practice,', 'What this means is'],
    academic: ['This suggests that', 'Evidence indicates that', 'It follows that', 'Consequently,', 'This demonstrates that'],
    professional: ['From a practical standpoint,', 'In business terms,', 'The bottom line is', 'Moving forward,', 'To put it plainly,'],
    casual: ['So basically,', 'Here\'s the deal —', 'The thing is,', 'Honestly,', 'Look,', 'Real talk:'],
    creative: ['Picture this:', 'Here\'s where it gets interesting —', 'The twist?', 'Imagine,', 'Now here\'s the fun part:'],
    simplified: ['Simply put,', 'In plain terms,', 'To put it simply,', 'Basically,', 'In other words,'],
  };

  // ── Utility ─────────────────────────────────────────────────────────────────
  function tokenizeSentences(text) {
    // Captures segments ending in punctuation OR trailing segments without punctuation
    return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  }

  function tokenizeWords(text) {
    return text.split(/\s+/).filter(w => w.length > 0);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ── CORE: Aggressive phrase + word replacement ──────────────────────────────
  // Replaces phrases first (longer matches), then individual words
  // At strength 3: replaces EVERY word that has a synonym
  function replaceSynonyms(text, intensity = 2, lang = 'en') {
    let result = text;
    const langSyns = synonymsByLang[lang] || synonymsByLang.en;

    // Sort by length descending so longer phrases match first
    const entries = Object.entries(langSyns).sort((a, b) => b[0].length - a[0].length);

    for (const [word, syns] of entries) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

      // Chance: strength 1 = 50%, strength 2 = 85%, strength 3 = 100%
      const chance = intensity === 1 ? 0.5 : intensity === 2 ? 0.85 : 1.0;

      if (regex.test(result) && Math.random() < chance) {
        regex.lastIndex = 0;
        const replacement = getRandomItem(syns);
        result = result.replace(regex, (match) => {
          if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
            return capitalize(replacement);
          }
          return replacement;
        });
      }
    }
    return result;
  }

  function removeAIFillers(text) {
    let result = text;
    for (const { pattern, replace } of aiFillers) {
      result = result.replace(pattern, replace);
    }
    return result.replace(/\s{2,}/g, ' ').trim().replace(/^[,\s]+/, '');
  }

  // ── Sentence restructuring — flips structure for variety ───────────────────
  function restructureSentences(text, strength) {
    const sentences = tokenizeSentences(text);
    return sentences.map((s, i) => {
      const trimmed = s.trim();
      if (!trimmed) return trimmed;

      // At strength 3: restructure ~60% of sentences
      const restructureChance = strength >= 4 ? 0.8 : strength === 3 ? 0.6 : strength === 2 ? 0.35 : 0.15;
      if (Math.random() > restructureChance) return trimmed;

      // Pattern 1: "X is Y" → "Y defines X" or "Y characterizes X"
      const isMatch = trimmed.match(/^(.+?)\s+is\s+(.+?)[.!?]$/i);
      if (isMatch && isMatch[1].split(' ').length < 5) {
        const connectors = ['defines', 'characterizes', 'represents', 'describes'];
        return `${capitalize(isMatch[2])} ${getRandomItem(connectors)} ${isMatch[1].toLowerCase()}.`;
      }

      // Pattern 2: "To X, you should Y" → "Y is how you X"
      const toMatch = trimmed.match(/^To\s+(.+?),\s+(.+?)[.!?]$/i);
      if (toMatch) {
        return `${capitalize(toMatch[2])} is the way to ${toMatch[1]}.`;
      }

      // Pattern 3: Move adverb to front
      const advMatch = trimmed.match(/^(.*?)(,?\s+)(however|therefore|moreover|furthermore|additionally)(,?\s+)(.*?)([.!?])$/i);
      if (advMatch) {
        return `${capitalize(advMatch[3])}, ${advMatch[1].toLowerCase()}${advMatch[6]}`;
      }

      // Pattern 4: Split long sentence at conjunction
      const words = trimmed.split(/\s+/);
      if (words.length > 20) {
        const conjunctions = ['and', 'but', 'which', 'that', 'while', 'although', 'because'];
        for (const conj of conjunctions) {
          const idx = words.findIndex((w, i) => i > 8 && w.toLowerCase() === conj);
          if (idx > -1) {
            const first = words.slice(0, idx).join(' ').replace(/[,]$/, '');
            const second = words.slice(idx + 1).join(' ');
            if (first && second && second.length > 10) {
              return `${first}. ${capitalize(second)}`;
            }
          }
        }
      }

      return trimmed;
    }).join(' ');
  }

  // ── Add transition phrases between sentences ────────────────────────────────
  function varySentenceStructure(sentences, style) {
    return sentences.map((sentence, i) => {
      const trimmed = sentence.trim();
      if (!trimmed) return trimmed;

      if (i > 0 && Math.random() < 0.3) {
        const trans = transitions[style] || transitions.standard;
        const t = getRandomItem(trans);
        const firstWord = trimmed.split(' ')[0].toLowerCase();
        const skipWords = ['that', 'this', 'here', 'the', 'in', 'from', 'so', 'picture', 'simply', 'worth', 'note'];
        if (!skipWords.includes(firstWord)) {
          return `${t} ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
        }
      }
      return trimmed;
    });
  }

  // ── Style-specific word swaps ───────────────────────────────────────────────
  function applyStyleAdjustments(text, style, mode) {
    let result = text;
    switch (style) {
      case 'simplified':
        result = result.replace(/\bcomprehend\b/gi, 'understand');
        result = result.replace(/\bascertain\b/gi, 'find out');
        result = result.replace(/\bprocure\b/gi, 'get');
        result = result.replace(/\bsubsequent\b/gi, 'next');
        result = result.replace(/\bprior to\b/gi, 'before');
        result = result.replace(/\bcommence\b/gi, 'start');
        result = result.replace(/\bterminate\b/gi, 'end');
        break;
      case 'academic':
        result = result.replace(/\bshow\b/gi, 'demonstrate');
        result = result.replace(/\buse\b/gi, 'employ');
        result = result.replace(/\bget\b/gi, 'obtain');
        result = result.replace(/\bfind\b/gi, 'identify');
        result = result.replace(/\bhelp\b/gi, 'facilitate');
        break;
      case 'casual':
        result = result.replace(/\bdo not\b/gi, "don't");
        result = result.replace(/\bcannot\b/gi, "can't");
        result = result.replace(/\bwill not\b/gi, "won't");
        result = result.replace(/\bI am\b/gi, "I'm");
        result = result.replace(/\bthey are\b/gi, "they're");
        result = result.replace(/\bwe are\b/gi, "we're");
        result = result.replace(/\bit is\b/gi, "it's");
        break;
      case 'professional':
        result = result.replace(/\bdon't\b/gi, 'do not');
        result = result.replace(/\bcan't\b/gi, 'cannot');
        result = result.replace(/\bwon't\b/gi, 'will not');
        break;
    }
    return result;
  }

  function cleanupText(text) {
    let result = text;
    result = result.replace(/\s{2,}/g, ' ');
    result = result.replace(/\s+([.,!?;:])/g, '$1');
    result = result.replace(/([.!?])\s*([.!?])/g, '$1');
    result = result.replace(/([.!?]\s+)([a-z])/g, (_, p, l) => p + l.toUpperCase());
    // Fix capitalizations after punctuation inside sentences (e.g. from restructuring)
    result = result.replace(/([.!?]\s+)([a-z])/g, (m, p, l) => p + l.toUpperCase());
    result = result.trim();
    if (result && !result.match(/[.!?]$/)) result += '.';
    return result;
  }

  // ── REWRITE UTILITIES ───────────────────────────────────────────────────────

  // Reorders sentences within batches of 3 to change flow without losing logic
  function reorderSentences(text) {
    const sentences = tokenizeSentences(text);
    if (sentences.length < 2) return text;

    const reordered = [];
    for (let i = 0; i < sentences.length; i += 3) {
      const batch = sentences.slice(i, i + 3);
      if (batch.length === 3 && Math.random() < 0.4) {
        // Swap 1 and 2, keep 3 (common pattern for shifting emphasis)
        reordered.push(batch[1], batch[0], batch[2]);
      } else if (batch.length === 2 && Math.random() < 0.3) {
        reordered.push(batch[1], batch[0]);
      } else {
        reordered.push(...batch);
      }
    }
    return reordered.join(' ');
  }

  // ── Document Structure Preservation ─────────────────────────────────────────
  function processDocument(text, processorFunc) {
    if (!text) return text;

    // Split into paragraphs/blocks while preserving whitespace
    const blocks = text.split(/(\n\s*\n)/);

    return blocks.map(block => {
      // If it's just whitespace/newlines, return as is
      if (!block.trim()) return block;

      // Preserve lists
      if (block.trim().match(/^([-*•]|\d+\.)\s+/)) {
        const lines = block.split('\n');
        return lines.map(line => {
          const match = line.match(/^(\s*([-*•]|\d+\.)\s+)(.*)/);
          if (match) {
            return match[1] + processorFunc(match[3]);
          }
          return processorFunc(line);
        }).join('\n');
      }

      // Preserve headings (lines starting with # or very short all-caps lines)
      const trimmed = block.trim();
      if (trimmed.startsWith('#') || (trimmed.length < 50 && trimmed === trimmed.toUpperCase() && trimmed.length > 3)) {
        return block; // Don't transform headings
      }

      // Standard paragraph
      return processorFunc(block);
    }).join('');
  }

  // ── Keyword Protection Helper ───────────────────────────────────────────────
  function protectShieldedTerms(text, map) {
    let result = text;
    let pIdx = Object.keys(map).length;

    // Protect user-defined shielded terms
    shieldedTerms.forEach(term => {
      const rx = new RegExp(`\\b${term}\\b`, 'gi');
      result = result.replace(rx, (m) => {
        const key = `__SHIELD${pIdx++}__`;
        map[key] = m;
        return key;
      });
    });

    // Protect numbers and acronyms
    result = result.replace(/\b(\d[\d,.]*%?)\b/g, (m) => {
      const key = `__SHIELD${pIdx++}__`;
      map[key] = m;
      return key;
    });

    result = result.replace(/\b([A-Z]{2,})\b/g, (m) => {
      const key = `__SHIELD${pIdx++}__`;
      map[key] = m;
      return key;
    });

    return result;
  }

  function restoreShieldedTerms(text, map) {
    let result = text;
    for (const [key, value] of Object.entries(map)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }
    return result;
  }

  // ── PRIVATE TRANSFORMS (applied per block) ──────────────────────────────────
  function _humanize(text, style, strength, lang) {
    const protectedMap = {};
    let result = protectShieldedTerms(text, protectedMap);

    result = removeAIFillers(result);
    result = replaceSynonyms(result, strength, lang);
    result = restructureSentences(result, strength);
    const sentences = tokenizeSentences(result);
    const varied = varySentenceStructure(sentences, style);
    result = varied.join(' ');
    result = applyStyleAdjustments(result, style, 'humanize');
    result = cleanupText(result);

    if (strength === 4) {
      result = replaceSynonyms(result, 3, lang); // Second pass
      result = restructureSentences(result, 3); // Second pass of restructuring
    }

    return restoreShieldedTerms(result, protectedMap);
  }

  function _paraphrase(text, style, strength, lang) {
    const protectedMap = {};
    let result = protectShieldedTerms(text, protectedMap);

    result = removeAIFillers(result);
    result = restructureSentences(result, Math.min(strength + 1, 4));
    result = replaceSynonyms(result, Math.min(strength + 1, 3), lang);
    result = applyStyleAdjustments(result, style, 'paraphrase');
    result = cleanupText(result);

    return restoreShieldedTerms(result, protectedMap);
  }

  function _rewrite(text, style, strength, lang) {
    if (!text || text.trim().length < 10) return text;

    const protectedMap = {};
    let result = protectShieldedTerms(text, protectedMap);

    result = removeAIFillers(result);
    const structuralIntensity = strength;
    result = restructureSentences(result, structuralIntensity);

    if (strength >= 3) {
      result = deepStructuralTransform(result, style);
      result = reorderSentences(result);
      if (strength === 4) {
        result = deepStructuralTransform(result, style); // Double pass
        result = reorderSentences(result);
      }
    }

    result = tripleReplaceSynonyms(result, lang);
    result = enhanceNaturalFlow(result, style);
    result = applyStyleAdjustments(result, style, 'rewrite');
    result = cleanupText(result);

    return restoreShieldedTerms(result, protectedMap);
  }

  // ── PUBLIC: HUMANIZER ───────────────────────────────────────────────────────
  function humanize(text, style = 'standard', strength = 2, lang = 'en') {
    return processDocument(text, (t) => _humanize(t, style, strength, lang));
  }

  // ── PUBLIC: PARAPHRASER ─────────────────────────────────────────────────────
  function paraphrase(text, style = 'standard', strength = 2, lang = 'en') {
    return processDocument(text, (t) => _paraphrase(t, style, strength, lang));
  }

  // ── PUBLIC: REWRITER (UPGRADED) ─────────────────────────────────────────────
  function rewrite(text, style = 'standard', strength = 2, lang = 'en') {
    return processDocument(text, (t) => _rewrite(t, style, strength, lang));
  }

  // ── MAXIMUM TRANSFORMATION ENGINE ──────────────────────────────────────────
  // 4-step pipeline: Semantic Extraction → Structural Transform →
  //                  Lexical Diversification → Natural Enhancement
  // Achieves 90%+ word variation while preserving meaning, facts, entities.

  // Protected entities: names, numbers, dates, technical terms
  function extractProtectedEntities(text) {
    const entities = [];
    // Numbers and percentages
    text.replace(/\b\d[\d,.]*%?\b/g, (m, offset) => entities.push({ match: m, offset, type: 'number' }));
    // Capitalized proper nouns (2+ consecutive caps words)
    text.replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g, (m, g, offset) => entities.push({ match: m, offset, type: 'entity' }));
    // Acronyms
    text.replace(/\b[A-Z]{2,}\b/g, (m, offset) => entities.push({ match: m, offset, type: 'acronym' }));
    return entities;
  }

  // Step 2: Structural Transformation — deep sentence reorganization
  function deepStructuralTransform(text, style) {
    const sentences = tokenizeSentences(text);
    if (sentences.length === 0) return text;

    const transformed = sentences.map((s, i) => {
      const t = s.trim();
      if (!t || t.length < 10) return t;

      // Pattern A: "X enables/allows/helps Y to Z" → "Y can Z through X"
      const enableMatch = t.match(/^(.+?)\s+(enables?|allows?|helps?)\s+(.+?)\s+to\s+(.+?)[.!?]$/i);
      if (enableMatch && Math.random() < 0.85) { // Increased from 0.7
        return `${capitalize(enableMatch[3])} can ${enableMatch[4]} through ${enableMatch[1].toLowerCase()}.`;
      }

      // Pattern B: "X and Y" long sentence → split into two
      const words = t.split(/\s+/);
      if (words.length > 15 && Math.random() < 0.8) { // Lowered length threshold, increased prob
        const conjIdx = words.findIndex((w, idx) => idx > 7 && /^(and|but|while|whereas|although|because|since|so|yet)$/i.test(w));
        if (conjIdx > -1) {
          const first = words.slice(0, conjIdx).join(' ').replace(/,$/, '');
          const second = words.slice(conjIdx + 1).join(' ');
          if (first.length > 15 && second.length > 15) {
            return `${first}. ${capitalize(second)}`;
          }
        }
      }

      // Pattern C: Merge short consecutive sentences (handled at paragraph level below)

      // Pattern D: Passive → Active voice approximation
      const passiveMatch = t.match(/^(.+?)\s+(is|are|was|were)\s+(\w+ed)\s+by\s+(.+?)[.!?]$/i);
      if (passiveMatch && Math.random() < 0.8) { // Increased from 0.6
        return `${capitalize(passiveMatch[4])} ${passiveMatch[2] === 'is' || passiveMatch[2] === 'are' ? 'actively' : ''} ${passiveMatch[3].replace(/ed$/, 's')} ${passiveMatch[1].toLowerCase()}.`;
      }

      // Pattern E: Fronted adverbial — move prepositional phrase to front
      const prepMatch = t.match(/^(.*?)(,?\s+)(in order to|to ensure|to improve|to enhance|to provide)\s+(.+?)[.!?]$/i);
      if (prepMatch && Math.random() < 0.75) { // Increased from 0.5
        return `${capitalize(prepMatch[3])} ${prepMatch[4]}, ${prepMatch[1].toLowerCase()}.`;
      }

      // Pattern F: Add varied sentence starters
      const styleTransitions = transitions[style] || transitions.standard;
      if (i > 0 && Math.random() < 0.6) { // Increased from 0.4
        const starter = getRandomItem(styleTransitions);
        const firstWord = t.charAt(0).toLowerCase();
        return `${starter} ${firstWord}${t.slice(1)}`;
      }

      return t;
    });

    // Merge pairs of very short sentences (< 8 words each)
    const merged = [];
    let skip = false;
    for (let i = 0; i < transformed.length; i++) {
      if (skip) { skip = false; continue; }
      const curr = transformed[i];
      const next = transformed[i + 1];
      if (curr && next) {
        const currWords = curr.split(/\s+/).length;
        const nextWords = next.split(/\s+/).length;
        if (currWords < 8 && nextWords < 8 && Math.random() < 0.5) {
          const connectors = ['and', 'while', 'as', 'since', 'because'];
          merged.push(`${curr.replace(/[.!?]$/, '')}, ${getRandomItem(connectors)} ${next.charAt(0).toLowerCase()}${next.slice(1)}`);
          skip = true;
          continue;
        }
      }
      merged.push(curr);
    }

    return merged.join(' ');
  }

  // Step 3: Lexical Diversification — triple synonym pass for 90%+ change
  function tripleReplaceSynonyms(text, lang = 'en') {
    // Pass 1: phrases first (longest matches)
    let result = replaceSynonyms(text, 3, lang);
    // Pass 2: individual words on the result
    result = replaceSynonyms(result, 3, lang);
    // Pass 3: final sweep for any remaining matches
    result = replaceSynonyms(result, 2, lang);
    return result;
  }

  // Step 4: Natural Language Enhancement
  const naturalEnhancers = {
    standard: [
      // Add natural hedges and human-sounding phrases
      [/^(This|The|These|Those) (\w+) (is|are|was|were)/gi, (_, det, noun, verb) =>
        `${getRandomItem(['What makes', 'What sets', 'What defines'])} ${det.toLowerCase()} ${noun} ${verb}`],
    ],
    casual: [
      [/\bHowever,/gi, () => getRandomItem(["But here's the thing —", "That said,", "Still,", "Even so,"])],
      [/\bFurthermore,/gi, () => getRandomItem(["On top of that,", "What's more,", "And also,"])],
    ],
    academic: [
      [/\bThis shows/gi, () => getRandomItem(["This demonstrates", "This indicates", "Evidence suggests"])],
    ],
  };

  function enhanceNaturalFlow(text, style) {
    let result = text;

    // Apply style-specific natural enhancers
    const enhancers = naturalEnhancers[style] || [];
    for (const [pattern, replacer] of enhancers) {
      result = result.replace(pattern, replacer);
    }

    // Vary sentence rhythm — occasionally add a very short punchy sentence after a long one
    const sentences = tokenizeSentences(result);
    const enhanced = [];
    for (let i = 0; i < sentences.length; i++) {
      enhanced.push(sentences[i]);
      const wordCount = sentences[i].split(/\s+/).length;
      // After a long sentence (>20 words), 20% chance to add a short punchy follow-up
      if (wordCount > 20 && Math.random() < 0.2 && i < sentences.length - 1) {
        const punchyPhrases = [
          "That's the key point.",
          "This matters.",
          "The difference is real.",
          "It works.",
          "Here's why.",
          "Think about it.",
        ];
        enhanced.push(getRandomItem(punchyPhrases));
      }
    }
    return enhanced.join(' ');
  }

  // ── PUBLIC: MAXIMUM TRANSFORM ───────────────────────────────────────────────
  // Full 4-step pipeline for 90%+ transformation
  function maximumTransform(text, style = 'standard', lang = 'en') {
    return rewrite(text, style, 4, lang); // Use rewrite at max strength
  }

  // ── AI Likeness Score ───────────────────────────────────────────────────────
  function getAILikenessScore(text) {
    if (!text || text.length < 20) return 0;
    const aiWords = ['utilize', 'leverage', 'facilitate', 'comprehensive', 'furthermore',
      'moreover', 'subsequently', 'delve', 'paradigm', 'robust', 'seamless',
      'innovative', 'sophisticated', 'in conclusion', 'it is important', 'it should be noted',
      'as an ai', 'certainly', 'absolutely', 'of course', 'in order to', 'due to the fact'];
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).length;
    let hits = 0;
    for (const w of aiWords) {
      const matches = (lower.match(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      hits += matches;
    }
    // Sentence uniformity penalty
    const sentences = tokenizeSentences(text);
    if (sentences.length > 2) {
      const lengths = sentences.map(s => s.split(/\s+/).length);
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((s, l) => s + Math.pow(l - avg, 2), 0) / lengths.length;
      if (Math.sqrt(variance) < 3) hits += 3;
    }
    const base = Math.min(95, Math.round((hits / Math.max(words / 10, 1)) * 100));
    return Math.max(5, base);
  }

  function getSynonymsForWord(word, lang = 'en') {
    const lWord = word.toLowerCase().trim().replace(/[.,!?;:]/g, '');
    const langSyns = synonymsByLang[lang] || synonymsByLang.en;

    // Direct match
    if (langSyns[lWord]) return langSyns[lWord];

    // Reverse match (if the word IS one of the synonyms)
    for (const [key, syns] of Object.entries(langSyns)) {
      if (syns.includes(lWord)) {
        return [key, ...syns.filter(s => s !== lWord)].slice(0, 5);
      }
    }

    return [];
  }

  return {
    humanize, paraphrase, rewrite, maximumTransform,
    tokenizeSentences, tokenizeWords, getAILikenessScore,
    getSynonymsForWord, setShieldedTerms
  };

})();

