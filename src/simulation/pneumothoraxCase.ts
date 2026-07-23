/**
 * Sourced directly from the "Pneumothorax — Large Branching Emergency" case authored in the
 * real Case Builder (case id 6a5902c62adf19e02d62121e) — 9 states, 18 reusable actions, and an
 * actions-per-state taper of 10 -> 8 -> 6 -> 4 -> 4 -> 2. graphNodes/graphEdges there pair a
 * State→Action edge (no score, just "this action is offered here") with an Action→State edge
 * (the real score + destination); this file collapses each such pair into a single
 * CaseEdge{source, target, actionId, score} — the engine only needs the net effect.
 *
 * Every action edge leads to a genuinely different state (no loop-backs) — one decision always
 * unlocks a completely different set of next actions, per the graph's actual branching. Many
 * actions are clinically plausible but suboptimal ("distractors") rather than nonsense filler —
 * a lower (or negative) score, not an unavailable option.
 */

export type Vitals = {
  hr: number
  bp: string // "systolic/diastolic"
  rr: number
  spo2: number
  temp: number
}

export type StateId =
  | 'arrival'
  | 'assessment'
  | 'resp-distress'
  | 'confirmed-pneumo'
  | 'shock'
  | 'tension-pneumo'
  | 'recovery'
  | 'icu'
  | 'death'

export type CaseState = {
  id: StateId
  name: string
  vitals: Vitals
  isConscious: boolean
  /** Patient's line, auto-posted to the chat panel the moment this state is entered. */
  dialogue: string
  isTerminal: boolean
  /** Only meaningful on terminal states — drives the case-status/scoring cap. */
  outcome?: 'good' | 'bad'
}

export type ActionTab = 'diagnostics' | 'medications' | 'procedures'

export type ObservationChoice = {
  text: string
  isCorrect: boolean
}

export type CaseAction = {
  id: string
  name: string
  tab: ActionTab
  /** Seconds deducted from the case countdown when performed — mirrors Action.timeCost. */
  timeCost: number
  /** Shown in chat as a system message once the action resolves. */
  resultText: string
  /** Shown under the result in OutcomeModal, when present — a quick check on interpreting the finding. */
  observationQuestion?: string
  observationChoices?: ObservationChoice[]
}

export type TriggerType = 'action' | 'timer'

export type CaseEdge = {
  id: string
  source: StateId
  target: StateId
  trigger: TriggerType
  /** Required when trigger === 'action'. */
  actionId?: string
  /** Required when trigger === 'timer' — seconds spent in `source` before this fires. */
  timerSeconds?: number
  /** How the vitals move from source -> target when this edge fires. */
  changePattern?: 'instant' | 'linear'
  changeDurationSeconds?: number
  score: number
  /** System-message note shown when this edge fires. */
  transitionNote?: string
  /** Shown in the post-case "Deduction Log" when score is negative. */
  deductionText?: string
}

export const PATIENT = {
  name: 'Alex Turner',
  age: 34,
  gender: 'Male',
  height: 178,
  weight: 82,
  bloodGroup: 'O+',
  codeStatus: 'Full Code',
  caseStatus: 'Full Code',
  chiefComplaint: 'Sudden onset left-sided chest pain and shortness of breath',
  historyOfPresentIllness:
    '34M with sudden onset left-sided pleuritic chest pain and dyspnea while at rest, started about an hour ago, no preceding trauma. Denies fever, cough, or leg swelling',
  pastMedicalHistory: 'No significant past medical history',
  pastSurgicalHistory: 'no prior surgeries(nill)',
  medications: 'None',
  drugAllergies: 'NKDA (no known drug allergies)',
  familyHistory: 'No family history of lung or cardiac disease',
  lifestyle: 'Smokes half a pack per day; Tall, thin build; Works as a delivery driver',
}

export const CASE_CONFIG = {
  title: 'Pneumothorax — Large Branching Emergency',
  totalTimeSeconds: 2400,
}

export const STATES: Record<StateId, CaseState> = {
  arrival: {
    id: 'arrival',
    name: 'Arrival',
    vitals: { hr: 92, bp: '128/82', rr: 20, spo2: 96, temp: 37.1 },
    isConscious: true,
    dialogue: 'I started feeling short of breath about an hour ago, and my chest feels tight.',
    isTerminal: false,
  },
  assessment: {
    id: 'assessment',
    name: 'Assessment',
    vitals: { hr: 92, bp: '128/82', rr: 20, spo2: 96, temp: 37.1 },
    isConscious: true,
    dialogue: 'It hurts more when I try to take a deep breath...',
    isTerminal: false,
  },
  'resp-distress': {
    id: 'resp-distress',
    name: 'Respiratory Distress',
    vitals: { hr: 118, bp: '110/72', rr: 28, spo2: 89, temp: 37.1 },
    isConscious: true,
    dialogue: "I can't... get enough air...",
    isTerminal: false,
  },
  'confirmed-pneumo': {
    id: 'confirmed-pneumo',
    name: 'Confirmed Pneumothorax',
    vitals: { hr: 112, bp: '114/74', rr: 26, spo2: 91, temp: 37.1 },
    isConscious: true,
    dialogue: 'Is it bad doc? It feels like my chest is going to pop.',
    isTerminal: false,
  },
  shock: {
    id: 'shock',
    name: 'Obstructive Shock',
    vitals: { hr: 138, bp: '82/52', rr: 34, spo2: 82, temp: 37.0 },
    isConscious: true,
    dialogue: '[gasping] ... [eyes rolling back]',
    isTerminal: false,
  },
  'tension-pneumo': {
    id: 'tension-pneumo',
    name: 'Tension Pneumothorax',
    vitals: { hr: 145, bp: '74/46', rr: 38, spo2: 78, temp: 37.0 },
    isConscious: false,
    dialogue: '[Unresponsive — severe respiratory distress]',
    isTerminal: false,
  },
  recovery: {
    id: 'recovery',
    name: 'Recovery',
    vitals: { hr: 84, bp: '122/78', rr: 16, spo2: 98, temp: 37.1 },
    isConscious: true,
    dialogue: 'I can breathe so much easier now. Thank you.',
    isTerminal: true,
    outcome: 'good',
  },
  icu: {
    id: 'icu',
    name: 'ICU Admission (Complicated)',
    vitals: { hr: 98, bp: '106/68', rr: 22, spo2: 93, temp: 37.2 },
    isConscious: true,
    dialogue: 'Still feels sore, but I am breathing.',
    isTerminal: true,
    outcome: 'good',
  },
  death: {
    id: 'death',
    name: 'Cardiopulmonary Arrest',
    vitals: { hr: 0, bp: '0/0', rr: 0, spo2: 0, temp: 36.5 },
    isConscious: false,
    dialogue: '[No pulse detected]',
    isTerminal: true,
    outcome: 'bad',
  },
}

export const ACTIONS: CaseAction[] = [
  {
    id: 'history-taking',
    name: 'History Taking',
    tab: 'diagnostics',
    timeCost: 120,
    resultText:
      'History obtained: 34M, sudden onset right chest pain & dyspnea 1hr ago while resting. No trauma. Mild asthma history.',
    observationQuestion: 'What is the key risk factor/pattern in this presentation?',
    observationChoices: [
      { text: 'Sudden onset pleuritic chest pain in a tall, thin male', isCorrect: true },
      { text: 'Gradual onset shortness of breath with high fever', isCorrect: false },
      { text: 'Crushing retrosternal pain radiating to left arm', isCorrect: false },
    ],
  },
  {
    id: 'physical-exam',
    name: 'Physical Exam',
    tab: 'diagnostics',
    timeCost: 120,
    resultText:
      'Exam: Diminished breath sounds on the right, hyperresonant to percussion on the right chest, tachypneic.',
    observationQuestion: 'Which physical exam finding strongly points toward pneumothorax?',
    observationChoices: [
      { text: 'Unilateral diminished breath sounds + hyperresonance', isCorrect: true },
      { text: 'Bilateral crackles at the bases', isCorrect: false },
      { text: 'Systolic murmur at apex', isCorrect: false },
    ],
  },
  {
    id: 'attach-monitor',
    name: 'Attach Monitor / Vitals',
    tab: 'diagnostics',
    timeCost: 60,
    resultText: 'Continuous monitor attached — live vitals stream now active.',
  },
  {
    id: 'blood-panel',
    name: 'Basic Blood Panel',
    tab: 'diagnostics',
    timeCost: 300,
    resultText:
      'Routine bloods unremarkable (WBC 8.2, Hgb 14.5, Na 139, K 4.1) — not diagnostic for pneumothorax; delays care.',
    observationQuestion: 'Is a blood panel diagnostic for pneumothorax?',
    observationChoices: [
      { text: 'No — imaging/POCUS is required', isCorrect: true },
      { text: 'Yes — CBC confirms it', isCorrect: false },
    ],
  },
  {
    id: 'pocus',
    name: 'POCUS (Lung Ultrasound)',
    tab: 'diagnostics',
    timeCost: 180,
    resultText:
      'Absent lung sliding on the right side (barcode sign on M-mode) — confirms pneumothorax at the bedside.',
    observationQuestion: 'What ultrasound findings confirm the suspected condition?',
    observationChoices: [
      { text: 'Absent lung sliding / barcode sign on M-mode', isCorrect: true },
      { text: 'Lung Point at the border of collapsed lung', isCorrect: true },
      { text: 'B-lines throughout the lung field', isCorrect: false },
      { text: 'Normal seashore sign on M-mode', isCorrect: false },
    ],
  },
  {
    id: 'chest-xray',
    name: 'Chest X-Ray',
    tab: 'diagnostics',
    timeCost: 300,
    resultText:
      'Visceral pleural line with absent lung markings peripherally — confirms pneumothorax, slower than POCUS.',
    observationQuestion: 'What chest X-ray finding confirms the diagnosis?',
    observationChoices: [
      { text: 'Visceral pleural line with absent peripheral lung markings', isCorrect: true },
      { text: 'Widened mediastinum', isCorrect: false },
      { text: 'Bilateral infiltrates', isCorrect: false },
    ],
  },
  {
    id: 'oxygen',
    name: 'Oxygen Therapy',
    tab: 'medications',
    timeCost: 60,
    resultText: 'Supplemental oxygen administered — buys time, not definitive.',
  },
  {
    id: 'needle-decompression',
    name: 'Needle Decompression',
    tab: 'procedures',
    timeCost: 90,
    resultText:
      'Needle decompression performed, 2nd intercostal space, midclavicular line — rush of air, immediate improvement.',
  },
  {
    id: 'chest-tube',
    name: 'Chest Tube',
    tab: 'procedures',
    timeCost: 600,
    resultText: 'Chest tube placed — re-expansion confirmed on repeat imaging, appropriate drainage.',
  },
  {
    id: 'iv-fluids',
    name: 'IV Fluids',
    tab: 'medications',
    timeCost: 120,
    resultText:
      "IV fluid bolus given — blood pressure improves, though this alone doesn't treat the underlying pneumothorax.",
  },
  {
    id: 'ecg',
    name: '12-Lead ECG',
    tab: 'diagnostics',
    timeCost: 120,
    resultText: 'Sinus tachycardia, no ST changes — helps exclude an acute cardiac event.',
    observationQuestion: 'What does the ECG show?',
    observationChoices: [
      { text: 'Sinus tachycardia, no ischemic changes', isCorrect: true },
      { text: 'ST elevation', isCorrect: false },
    ],
  },
  {
    id: 'iv-access',
    name: 'IV Access',
    tab: 'procedures',
    timeCost: 90,
    resultText: 'Peripheral IV cannula placed — ready for medications or fluids if needed.',
  },
  {
    id: 'analgesia-iv',
    name: 'IV Analgesia',
    tab: 'medications',
    timeCost: 60,
    resultText: 'IV analgesia given — pain improves, underlying pathology unchanged.',
  },
  {
    id: 'troponin',
    name: 'Troponin Test',
    tab: 'diagnostics',
    timeCost: 900,
    resultText: 'Troponin negative — argues against acute coronary syndrome.',
    observationQuestion: 'Is troponin useful here?',
    observationChoices: [
      { text: 'Only to exclude ACS as a differential — not diagnostic for pneumothorax', isCorrect: true },
      { text: 'Yes, it confirms pneumothorax', isCorrect: false },
    ],
  },
  {
    id: 'd-dimer',
    name: 'D-Dimer Test',
    tab: 'diagnostics',
    timeCost: 600,
    resultText: 'D-Dimer mildly elevated — nonspecific, does not rule pneumothorax in or out.',
    observationQuestion: 'What does an elevated D-Dimer tell you here?',
    observationChoices: [
      { text: 'Very little — nonspecific, does not diagnose pneumothorax', isCorrect: true },
      { text: 'Confirms pulmonary embolism', isCorrect: false },
    ],
  },
  {
    id: 'abg',
    name: 'Arterial Blood Gas',
    tab: 'diagnostics',
    timeCost: 300,
    resultText: 'Mild hypoxemia and respiratory alkalosis — consistent with, but not specific for, pneumothorax.',
    observationQuestion: 'What does the ABG add over pulse oximetry alone?',
    observationChoices: [
      { text: 'Ventilation status (CO2) and acid-base status, not just oxygenation', isCorrect: true },
      { text: 'Nothing — it duplicates SpO2', isCorrect: false },
    ],
  },
  {
    id: 'ct-chest',
    name: 'CT Chest',
    tab: 'diagnostics',
    timeCost: 1200,
    resultText:
      'CT confirms a moderate right-sided pneumothorax — highly accurate, but far slower to obtain than POCUS or plain film.',
    observationQuestion: 'When is CT chest appropriate here?',
    observationChoices: [
      { text: 'Only if bedside tests are equivocal — too slow as a first-line test in an unstable patient', isCorrect: true },
      { text: 'It should always be first-line', isCorrect: false },
    ],
  },
  {
    id: 'senior-consult',
    name: 'Senior/Surgical Consult',
    tab: 'procedures',
    timeCost: 300,
    resultText: 'Senior clinician reviews the case and agrees with escalating workup/treatment.',
  },
]

export const ACTIONS_BY_ID: Record<string, CaseAction> = Object.fromEntries(ACTIONS.map((a) => [a.id, a]))

// Every decision point uses a graduated scale: the single best action scores highest (+20 down
// to as low as +5 for a legitimate-but-suboptimal choice), and clinically-wrong "distractor"
// choices that route to a worse state score negative (-10/-15). Timer edges (pure consequences
// of inaction, not a choice) use the same negative range.
export const EDGES: CaseEdge[] = [
  // Arrival -> Assessment: 10 actions

  { id: 'e-physical-exam', source: 'arrival', target: 'assessment', trigger: 'action', actionId: 'physical-exam', score: 28, transitionNote: 'Exam reveals decreased breath sounds — strong early step.' },
  { id: 'e-iv-access-1', source: 'arrival', target: 'assessment', trigger: 'action', actionId: 'iv-access', score: 25, transitionNote: 'Good preparatory step regardless of final diagnosis.' },
  { id: 'e-monitoring-1', source: 'arrival', target: 'assessment', trigger: 'action', actionId: 'monitoring', score: 24, transitionNote: 'Continuous monitoring attached — good practice.' },
  { id: 'e-senior-1', source: 'arrival', target: 'assessment', trigger: 'action', actionId: 'senior-consult', score: 20, transitionNote: 'Safe early escalation.' },
  { id: 'e-oxygen-1', source: 'arrival', target: 'assessment', trigger: 'action', actionId: 'oxygen', score: 18, transitionNote: 'Reasonable early symptomatic support.' },
  { id: 'e-ecg-1', source: 'arrival', target: 'assessment', trigger: 'action', actionId: 'ecg', score: 15, transitionNote: 'Reasonable differential-broadening test, not specific.' },
  { id: 'e-troponin-1', source: 'arrival', target: 'assessment', trigger: 'action', actionId: 'troponin', score: 10, transitionNote: 'Low-yield ACS workup for this presentation.' },
  { id: 'e-ddimer-1', source: 'arrival', target: 'assessment', trigger: 'action', actionId: 'd-dimer', score: 10, transitionNote: 'Low-yield PE workup for this presentation.' },
  { id: 'e-blood-1', source: 'arrival', target: 'assessment', trigger: 'action', actionId: 'blood-panel', score: 8, transitionNote: 'Least specific, most delaying choice here.' },

  // Assessment -> Confirmed Pneumothorax: 4 actions
  { id: 'e-pocus-1', source: 'assessment', target: 'confirmed-pneumo', trigger: 'action', actionId: 'pocus', score: 35, transitionNote: 'POCUS confirms absent lung sliding — the fast, correct route.' },
  { id: 'e-cxr-1', source: 'assessment', target: 'confirmed-pneumo', trigger: 'action', actionId: 'chest-xray', score: 25, transitionNote: 'Alternate diagnostic route — slower than POCUS.' },
  { id: 'e-ct-1', source: 'assessment', target: 'confirmed-pneumo', trigger: 'action', actionId: 'ct-chest', score: 18, transitionNote: 'Confirms the diagnosis, but far slower than needed first-line.' },
  { id: 'e-senior-2', source: 'assessment', target: 'confirmed-pneumo', trigger: 'action', actionId: 'senior-consult', score: 20, transitionNote: 'Escalation helps push toward the correct imaging.' },
  // Assessment -> Respiratory Distress: 4 actions — genuinely wrong choices (negative), so no
  // detour-then-rescue combination can ever outscore the direct Assessment -> Confirmed
  // Pneumothorax route above.
  {
    id: 'e-abg-1', source: 'assessment', target: 'resp-distress', trigger: 'action', actionId: 'abg', score: -5,
    transitionNote: 'Wastes critical time on a secondary read instead of confirming the diagnosis — the patient deteriorates while it is pending.',
    deductionText: 'Ordered an ABG instead of definitive imaging — wasted critical time, patient’s condition worsened',
  },
  {
    id: 'e-analgesia-1', source: 'assessment', target: 'resp-distress', trigger: 'action', actionId: 'analgesia-iv', score: -5,
    transitionNote: 'Treats the pain, not the diagnosis — the underlying pneumothorax progresses untreated.',
    deductionText: 'Focused on pain control instead of confirming the diagnosis — patient’s condition worsened',
  },
  {
    id: 'e-troponin-2', source: 'assessment', target: 'resp-distress', trigger: 'action', actionId: 'troponin', score: -8,
    transitionNote: 'Chasing a cardiac differential on a classic pneumothorax presentation — a clearly wrong turn.',
    deductionText: 'Pursued troponin/ACS workup instead of confirmatory imaging — wrong differential, patient’s condition worsened',
  },
  {
    id: 'e-ddimer-2', source: 'assessment', target: 'resp-distress', trigger: 'action', actionId: 'd-dimer', score: -8,
    transitionNote: 'Chasing a PE differential on a classic pneumothorax presentation — a clearly wrong turn.',
    deductionText: 'Pursued a PE workup instead of confirmatory imaging — wrong differential, patient’s condition worsened',
  },
  {
    id: 'e-timer-resp-distress', source: 'assessment', target: 'resp-distress', trigger: 'timer', timerSeconds: 300,
    changePattern: 'linear', changeDurationSeconds: 30, score: -10,
    transitionNote: 'Diagnosis delayed 5 minutes — pneumothorax progresses untreated.',
    deductionText: 'Diagnosis not confirmed within 5 minutes — pneumothorax allowed to progress untreated',
  },

  // Respiratory Distress -> Confirmed Pneumothorax (rescue) or Shock (worse): 6 actions
  { id: 'e-pocus-2', source: 'resp-distress', target: 'confirmed-pneumo', trigger: 'action', actionId: 'pocus', score: 30, transitionNote: 'Rescue route — fast imaging still recoverable at this stage.' },
  { id: 'e-cxr-2', source: 'resp-distress', target: 'confirmed-pneumo', trigger: 'action', actionId: 'chest-xray', score: 25, transitionNote: 'Rescue route — imaging finally confirms the diagnosis.' },
  { id: 'e-ct-2', source: 'resp-distress', target: 'confirmed-pneumo', trigger: 'action', actionId: 'ct-chest', score: 18, transitionNote: 'Slow rescue, but still gets there.' },
  { id: 'e-senior-3', source: 'resp-distress', target: 'confirmed-pneumo', trigger: 'action', actionId: 'senior-consult', score: 20, transitionNote: 'Escalation rescue.' },
  {
    id: 'e-blood-2', source: 'resp-distress', target: 'shock', trigger: 'action', actionId: 'blood-panel', score: -10,
    transitionNote: 'Wrong test again while the patient is actively deteriorating — progresses to shock.',
    deductionText: 'Ordered a blood panel instead of imaging while actively deteriorating — wrong route, patient progressed to shock',
  },
  {
    id: 'e-troponin-3', source: 'resp-distress', target: 'shock', trigger: 'action', actionId: 'troponin', score: -10,
    transitionNote: 'Wrong differential pursued again — progresses to shock.',
    deductionText: 'Pursued troponin/ACS workup instead of imaging while deteriorating — wrong route, patient progressed to shock',
  },

  // Confirmed Pneumothorax -> Recovery / ICU / Tension: 4 actions
  { id: 'e-needle-1', source: 'confirmed-pneumo', target: 'recovery', trigger: 'action', actionId: 'needle-decompression', score: 35, transitionNote: 'Timely decompression resolves the physiology — the golden-path route.' },
  { id: 'e-tube-1', source: 'confirmed-pneumo', target: 'icu', trigger: 'action', actionId: 'chest-tube', score: 25, transitionNote: 'Definitive but slower alternate — stabilizes in ICU rather than immediate recovery.' },
  { id: 'e-senior-4', source: 'confirmed-pneumo', target: 'icu', trigger: 'action', actionId: 'senior-consult', score: 18, transitionNote: 'Escalation leads to a safe but slower ICU admission.' },
  {
    id: 'e-oxygen-2', source: 'confirmed-pneumo', target: 'tension-pneumo', trigger: 'action', actionId: 'oxygen', score: -10,
    transitionNote: 'Still not definitive — the pneumothorax itself progresses to tension physiology.',
    deductionText: 'Gave oxygen only instead of definitive decompression — pneumothorax progressed to tension physiology',
  },
  {
    id: 'e-timer-tension', source: 'confirmed-pneumo', target: 'tension-pneumo', trigger: 'timer', timerSeconds: 900,
    changePattern: 'linear', changeDurationSeconds: 30, score: -15,
    transitionNote: 'Untreated pneumothorax progresses to tension physiology.',
    deductionText: 'Confirmed pneumothorax left untreated for 15 minutes — progressed to tension physiology',
  },

  // Shock -> Recovery (rescue) or Death (still wrong): 4 actions
  { id: 'e-fluids-1', source: 'shock', target: 'recovery', trigger: 'action', actionId: 'iv-fluids', score: 25, transitionNote: 'Fluid resuscitation stabilizes blood pressure — recoverable.' },
  { id: 'e-oxygen-3', source: 'shock', target: 'recovery', trigger: 'action', actionId: 'oxygen', score: 18, transitionNote: 'Supportive rescue.' },
  {
    id: 'e-analgesia-2', source: 'shock', target: 'death', trigger: 'action', actionId: 'analgesia-iv', score: -10,
    transitionNote: 'Wrong focus while the patient is crashing — fatal.',
    deductionText: 'Focused on analgesia instead of resuscitation while the patient was crashing — fatal',
  },
  {
    id: 'e-blood-3', source: 'shock', target: 'death', trigger: 'action', actionId: 'blood-panel', score: -10,
    transitionNote: 'Still chasing the wrong test while the patient is crashing — fatal.',
    deductionText: 'Still chasing bloodwork instead of resuscitation while the patient was crashing — fatal',
  },
  {
    id: 'e-timer-death', source: 'shock', target: 'death', trigger: 'timer', timerSeconds: 300,
    changePattern: 'instant', score: -15,
    transitionNote: 'Untreated shock is fatal within the critical window.',
    deductionText: 'Shock left untreated for 5 minutes — fatal',
  },

  // Tension Pneumothorax -> ICU: 2 actions
  { id: 'e-needle-2', source: 'tension-pneumo', target: 'icu', trigger: 'action', actionId: 'needle-decompression', score: 30, transitionNote: 'Still very effective even at this later stage.' },
  { id: 'e-tube-2', source: 'tension-pneumo', target: 'icu', trigger: 'action', actionId: 'chest-tube', score: 18, transitionNote: 'Definitive management after the tension has already progressed — a slower, lower-scored save.' },
]

export const CLINICAL_HINTS = [
  'Start with a focused history and physical exam, then confirm with POCUS — it\'s the fastest route to a diagnosis. Blood panels, troponin, and D-Dimer are not diagnostic here and will just cost you time.',
  'Once the pneumothorax is confirmed, proceed directly to needle decompression — don\'t let it sit untreated or settle for oxygen alone.',
  'If the patient develops shock, treat it immediately with fluids or oxygen — untreated shock is fatal within the critical window.',
]

export function edgesFrom(stateId: StateId): CaseEdge[] {
  return EDGES.filter((e) => e.source === stateId)
}

export function findActionEdge(stateId: StateId, actionId: string): CaseEdge | undefined {
  return EDGES.find((e) => e.source === stateId && e.trigger === 'action' && e.actionId === actionId)
}

export function findTimerEdge(stateId: StateId): CaseEdge | undefined {
  return EDGES.find((e) => e.source === stateId && e.trigger === 'timer')
}
