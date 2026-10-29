# Design QA

Source visual truth: design-reference.png (option 1, 853 x 1844).
Implementation: qa-mobile.png (390 x 844 CSS viewport) and /workspace/scratch/nap-tracker-desktop.png.
Comparison evidence: qa-comparison.png, normalized source to 390 x 844. Browser screenshot density 1x; iframe content viewport explicitly 390 x 844. Also tested 320px.
State: temporary synthetic past records, Day 8, today unrecorded. Actual app first-use starts Day 1 with no seeded records. Mock progress 26% was elapsed-time progress; user STEP 4 requires saved-record progress, so real comparison is 4/31 = 13%. This is an intentional requested content change.

## Findings and comparison history
- Initial mobile comparison: top action and metric hierarchy matches option 1. Extra caption and separate calendar helper line pushed the last calendar row below the fold. Tightened mobile section spacing, made explanatory progress caption accessible-only, and aligned the calendar helper beside the month heading. Kept 56px record buttons and 44px calendar date targets. Re-captured below.
- Source's blue/white visual system, stacked record buttons, two-column metrics, bottom monthly calendar are retained. No device chrome.
- Font: Korean system sans, 26px heading, 38px goal, 22px actions, readable labels; consistent weight hierarchy. Platform font differences remain P3.
- Layout: normal responsive page, mobile-first single column and centered 600px reading width on desktop. 320px body scrollWidth equals clientWidth; main button 292 x 56px. Calendar can scroll naturally with page.
- Colors: #0967f8 actions and progress, white surface, gray secondary text and hairlines, pale blue today cell. Checked/minus/empty icon states remain distinct.
- Assets: no raster illustrations in source; Radix icon library supplies Check, Circle, MinusCircled and chevrons. No handmade icon assets.
- Copy: nap-only yes/no/unrecorded; no coaching, minimum mode, extraneous features, or example values in production. Real dates, first-use interval and persisted record counts.

## Functional evidence
Browser-rendered app opened successfully. Real local current date displayed 2026-10-29, first use Day 1/31; start/end 10.29–11.28. Click yes: progress 0% to 3%, streak 1; reload retained yes. Click no: progress 0%, reload retained no. Calendar opens date editor; changing status persists and updates counts. Synthetic past date Oct28 edited from yes to no: streak 3 to 0 and saved-record progress13% to10%. Future dates disabled. 320px primary button clicked successfully. Month/year date arithmetic assertions passed. Build and Sites worker checks passed.
Console checked: only unrelated browser extension metadata errors; no application errors.

## Follow-up polish
P3: platform-specific Korean font rendering and minor spacing may be refined in STEP5. No further polish requested for STEP4.

final result: passed
