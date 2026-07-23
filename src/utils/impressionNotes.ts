import { ACTIONS_BY_ID } from '../simulation/pneumothoraxCase'

export const PROFESSIONAL_IMPRESSIONS: Record<string, string> = {
  'pocus':
    'Recommend immediate clinical correlation and appropriate management. Absent lung sliding on the left chest with barcode sign on M-mode confirms pneumothorax at the bedside.',
  'chest-xray':
    'Visceral pleural line with absent peripheral lung markings confirmed on chest radiograph. Low-yield for PE differential, confirms pneumothorax.',
  'blood-panel':
    'A normal blood count and chemistry panel neither confirms nor excludes a pneumothorax — imaging or bedside ultrasound is required to make the diagnosis.',
  'troponin':
    'A normal troponin helps exclude an acute cardiac event but says nothing about the chest — it isn\'t diagnostic for pneumothorax and shouldn\'t delay confirmatory imaging.',
  'd-dimer':
    'Nonspecific elevation. D-Dimer does not confirm or exclude pneumothorax; bedside ultrasound or chest radiograph is indicated.',
  'ecg':
    'Sinus tachycardia with no acute ST-segment or T-wave ischemic changes — helps rule out acute coronary syndrome.',
  'abg':
    'Mild hypoxemia and respiratory alkalosis secondary to acute respiratory compromise from lung collapse.',
  'ct-chest':
    'CT confirms left-sided pneumothorax with high spatial accuracy, though bedside POCUS is faster in acute instability.',
  'physical-exam':
    'Unilateral diminished breath sounds with hyperresonance to percussion on the left lung field — classic presentation of pneumothorax.',
  'history-taking':
    '34M presenting with sudden onset left-sided pleuritic chest pain and dyspnea while resting — typical history for primary spontaneous pneumothorax.',
  'needle-decompression':
    'Rush of air evacuated upon insertion at 2nd intercostal space midclavicular line — rapid decompression and relief of tension dynamics.',
  'chest-tube':
    'Tube thoracostomy successfully inserted with immediate bubbling/drainage and lung re-expansion.',
  'oxygen':
    'High-flow oxygen therapy administered to improve arterial oxygenation and accelerate pleural air resorption.',
  'monitoring':
    'Continuous multi-parameter vital sign monitoring established.',
  'iv-access':
    'Peripheral IV access successfully established for emergency fluid and drug administration.',
  'iv-fluids':
    'Isotonic fluid bolus infused; transient hemodynamic support provided.',
  'analgesia-iv':
    'IV analgesia administered for pleuritic chest pain relief.',
  'senior-consult':
    'Senior emergency physician consult completed — agreement on immediate definitive airway and pleural management.',
}

export function getActionImpression(actionId: string): string {
  if (PROFESSIONAL_IMPRESSIONS[actionId]) {
    return PROFESSIONAL_IMPRESSIONS[actionId]
  }
  const action = ACTIONS_BY_ID[actionId]
  return action ? action.resultText : 'Action performed successfully.'
}

export function appendImpressionToNotepad(actionId: string): boolean {
  const action = ACTIONS_BY_ID[actionId]
  const actionName = action ? action.name : actionId
  const impression = getActionImpression(actionId)

  const currentNotes = localStorage.getItem('simulation_observation_notes') || ''
  const noteHeading = `• [${actionName}] — Professional Impression:`
  const newNoteEntry = `${noteHeading}\n  ${impression}`

  // If already in notepad, return false (already present)
  if (currentNotes.includes(noteHeading)) {
    return false
  }

  const updatedNotes = currentNotes.trim()
    ? `${currentNotes.trim()}\n\n${newNoteEntry}`
    : newNoteEntry

  localStorage.setItem('simulation_observation_notes', updatedNotes)
  window.dispatchEvent(new Event('notepad_updated'))
  return true
}

export function isImpressionInNotepad(actionId: string): boolean {
  const action = ACTIONS_BY_ID[actionId]
  const actionName = action ? action.name : actionId
  const currentNotes = localStorage.getItem('simulation_observation_notes') || ''
  return currentNotes.includes(`• [${actionName}] — Professional Impression:`)
}
