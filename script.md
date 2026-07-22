# C1 UI — Learner Flow Demo Video Script

Draft for review. Covers: opening VO, and three scripted playthroughs (Golden / Partial
Success / Fail) of the "Pneumothorax" case, each with the exact actions to click on screen
and a matching voiceover script. Written for feeding into Google AI Studio / ElevenLabs —
each VO line is a standalone cue you can generate separately and stitch together.

Case used for the demo: `cone-ui` local build, pneumothorax scenario
(`src/simulation/pneumothoraxCase.ts`).

---

## 0. Video Structure

1. **Cold open / platform intro** (~20–30s) — what the platform is, not case-specific.
2. **Segment A — Golden Path** (~45–60s) — every decision correct, fastest possible resolution.
3. **Segment B — Partial Success** (~60–75s) — a couple of wrong turns, patient still recovers.
4. **Segment C — Fail Path** (~60–75s) — consistently wrong decisions, patient dies.
5. **Closing line** (~10–15s).

Total runtime target: ~4–5 minutes.

Tone: confident, instructional, calm — think product-demo narrator, not clinical lecture.
Keep sentences short; each VO line should map to one visible on-screen action.

---

## 1. Opening VO (platform intro — no case content)

Purpose: explain what a learner does on this platform, before any case specifics appear.
Nothing pneumothorax-specific goes here — this is the "what is this tool" framing.

> **VO 1.1**
> "This is the learner side of Case Builder — where every case created on the platform comes to life."
>
> **VO 1.2**
> "A learner steps into the shoes of a clinician, facing a patient in real time."
>
> **VO 1.3**
> "At every stage, they choose what to do next — ask questions, run tests, start treatment — and each choice moves the case forward."
>
> **VO 1.4**
> "Some choices are better than others. Some cost time. Some cost the patient. The platform scores every decision, and the case can end differently depending on the path taken."
>
> **VO 1.5**
> "Let's walk through three different ways the same case can play out."

*[On screen: dashboard → open case → landing on the Arrival state, patient on screen, timer running.]*

---

## 2. Segment A — Golden Path (fastest correct resolution)

**Outcome:** Recovery (best possible ending) in 3 actions.
**Path:** Arrival → *History Taking* → Assessment → *POCUS* → Confirmed Pneumothorax → *Needle Decompression* → **Recovery**

| Step | State | Action to click | Tab | Result |
|---|---|---|---|---|
| 1 | Arrival | **History Taking** | Diagnostics | → Assessment (best first step) |
| 2 | Assessment | **POCUS (Lung Ultrasound)** | Diagnostics | → Confirmed Pneumothorax (fastest, correct diagnostic route) |
| 3 | Confirmed Pneumothorax | **Needle Decompression** | Procedures | → **Recovery** (terminal, good outcome) |

### Voiceover

> **VO A.1** *(patient just arrived, before any click)*
> "Here's the ideal run. The patient has just arrived with chest pain and shortness of breath."
>
> **VO A.2** *(clicking History Taking)*
> "First, we take a focused history — that's always the right place to start."
>
> **VO A.3** *(transition to Assessment, patient dialogue appears)*
> "That moves us into the assessment stage, and already narrows down what we're dealing with."
>
> **VO A.4** *(clicking POCUS)*
> "Next, instead of ordering slower tests, we go straight to a bedside ultrasound — POCUS. It's the fastest way to confirm the diagnosis."
>
> **VO A.5** *(transition to Confirmed Pneumothorax)*
> "Diagnosis confirmed — pneumothorax. Now it's about acting fast."
>
> **VO A.6** *(clicking Needle Decompression)*
> "We go straight to needle decompression — the definitive treatment at this stage."
>
> **VO A.7** *(Recovery screen / case summary)*
> "And that's it — three decisions, all correct, and the patient recovers. This is the golden pathway: the fastest, highest-scoring route through the case."

---

## 3. Segment B — Partial Success (mistakes made, patient still survives)

**Outcome:** ICU / good outcome, but not the clean path — shows recoverable mistakes.
**Path:** Arrival → *Basic Blood Panel* → Assessment → *Troponin Test* → Respiratory Distress → *POCUS* (rescue) → Confirmed Pneumothorax → *Chest Tube* → **ICU**

| Step | State | Action to click | Tab | Result |
|---|---|---|---|---|
| 1 | Arrival | **Basic Blood Panel** | Diagnostics | → Assessment (valid, but slow/low-value first step) |
| 2 | Assessment | **Troponin Test** | Diagnostics | → Respiratory Distress (**wrong differential** — patient deteriorates) |
| 3 | Respiratory Distress | **POCUS (Lung Ultrasound)** | Diagnostics | → Confirmed Pneumothorax (rescue — still recoverable) |
| 4 | Confirmed Pneumothorax | **Chest Tube** | Procedures | → **ICU** (terminal, good outcome — slower, but safe) |

### Voiceover

> **VO B.1** *(patient just arrived)*
> "Now let's look at a messier run — the kind of path a learner might actually take on their first attempt."
>
> **VO B.2** *(clicking Basic Blood Panel)*
> "This time, we start with a basic blood panel. It's not wrong, but it isn't the most useful test for this presentation — it just costs time."
>
> **VO B.3** *(transition to Assessment)*
> "We move into assessment, but we're already a step behind."
>
> **VO B.4** *(clicking Troponin Test)*
> "Here's the real mistake — we chase a cardiac workup with a troponin test, on a presentation that doesn't point to the heart."
>
> **VO B.5** *(transition to Respiratory Distress — vitals worsen)*
> "That wrong turn costs us. The patient's breathing worsens, and we've moved into respiratory distress."
>
> **VO B.6** *(clicking POCUS)*
> "But it's not game over — we course-correct with a bedside ultrasound, and finally confirm the diagnosis."
>
> **VO B.7** *(transition to Confirmed Pneumothorax)*
> "Pneumothorax confirmed — later than it should've been, but still in time to act."
>
> **VO B.8** *(clicking Chest Tube)*
> "Instead of needle decompression, we place a chest tube. It's definitive, just slower."
>
> **VO B.9** *(ICU screen / case summary)*
> "The patient survives and stabilizes in the ICU. Not the cleanest run — a couple of decisions cost real time and score — but recoverable. This is what a partial-success outcome looks like: mistakes made, patient still saved."

---

## 4. Segment C — Fail Path (patient dies)

**Outcome:** Death (worst outcome) — consistently wrong decisions under pressure.
**Path:** Arrival → *History Taking* → Assessment → *Troponin Test* → Respiratory Distress → *Basic Blood Panel* → Shock → *IV Analgesia* → **Death**

| Step | State | Action to click | Tab | Result |
|---|---|---|---|---|
| 1 | Arrival | **History Taking** | Diagnostics | → Assessment (fine start) |
| 2 | Assessment | **Troponin Test** | Diagnostics | → Respiratory Distress (**wrong differential**) |
| 3 | Respiratory Distress | **Basic Blood Panel** | Diagnostics | → Shock (**wrong again while deteriorating**) |
| 4 | Shock | **IV Analgesia** | Medications | → **Death** (terminal, bad outcome — wrong focus while crashing) |

### Voiceover

> **VO C.1** *(patient just arrived)*
> "Last, here's what happens when the wrong decisions stack up."
>
> **VO C.2** *(clicking History Taking)*
> "We start reasonably — a focused history, same as before."
>
> **VO C.3** *(transition to Assessment)*
> "So far, so good."
>
> **VO C.4** *(clicking Troponin Test)*
> "But here we chase the wrong differential again — a cardiac workup instead of confirming the actual diagnosis."
>
> **VO C.5** *(transition to Respiratory Distress)*
> "The patient starts to deteriorate — this was avoidable."
>
> **VO C.6** *(clicking Basic Blood Panel)*
> "And instead of correcting course, we order another low-value test while the patient is actively getting worse."
>
> **VO C.7** *(transition to Shock — vitals crash)*
> "That delay is costly. The patient drops into shock."
>
> **VO C.8** *(clicking IV Analgesia)*
> "At this point, the priority should be resuscitation — but instead, we focus on pain control."
>
> **VO C.9** *(Death screen / case summary)*
> "And that's fatal. The case ends in the worst possible outcome. This is why the platform scores not just *what* you do, but *when* you do it — in an emergency, the wrong test at the wrong moment can be the difference between recovery and death."

---

## 5. Closing VO

> **VO 5.1**
> "Same patient, same starting point — three completely different outcomes, all driven by the decisions made along the way."
>
> **VO 5.2**
> "That's the learner experience on Case Builder: realistic branching, real consequences, and a score that reflects both clinical accuracy and speed."

---

## 6. Production Notes

- **On-screen captions:** consider overlaying the action name being clicked (e.g. "Clicking: POCUS") as a lower-third, synced to each VO cue — makes it easy for viewers to follow along without pausing.
- **Pacing:** leave ~1–2s of screen action (button click → transition animation → new state loading) before the next VO line starts, so narration doesn't talk over the UI transition.
- **Score/summary screen:** each segment ends on the case-summary modal — worth a beat of silence (1–2s) to let viewers read the score before VO 5.x or the next segment's cold open.
- **Voice tone suggestion for AI generation:** neutral-professional, moderate pace (~150 wpm), slight warmth — avoid overly clinical/monotone or overly casual/salesy.
- **Segment labels for editing:** VO cues are numbered (A.1, A.2, …) to make it easy to reference specific lines when requesting revisions.
- **No case "answers" are spoiled in the intro** — Segment A is the first place the correct pathway is revealed, intentionally, so the opening stays platform-focused rather than clinical.

---

## 7. Open Questions for Review

1. Do you want the on-screen cursor to visibly hover/click, or should actions be triggered via script (e.g. Playwright) for a cleaner recording?
2. Should the timer/countdown be visible in the recording, or cropped out to keep focus on actions + patient panel?
3. Any preference on segment order — Golden → Partial → Fail (current draft, escalating difficulty) vs. Fail → Partial → Golden (build to the ideal)?
