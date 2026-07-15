// =========================================================================
// A&P Calculator Pro | Master JS File | I was here -LB
// =========================================================================

// --- 1. NAVIGATION LOGIC ---
const tabButtons = document.querySelectorAll('.tab-btn');
const calcCards = document.querySelectorAll('.calc-card');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    calcCards.forEach(card => card.style.display = 'none');
    const targetId = button.getAttribute('data-target');
    const targetCard = document.getElementById(targetId);
    if (targetCard) targetCard.style.display = 'block';
  });
});

// =========================================================================
// 1.1 TACTILE ENGINE (HAPTICS)
// =========================================================================
function triggerHaptic(style = 'light') {
    // Failsafe: Silently aborts if running on a PC that doesn't have a vibration motor
    if (!navigator.vibrate) return;

    if (style === 'light') {
        navigator.vibrate(10); // A sharp, quick 'tick' for tabs and numbers
    } else if (style === 'medium') {
        navigator.vibrate(25); // A heavier 'thud' for calculation buttons
    } else if (style === 'success') {
        navigator.vibrate([15, 50, 20]); // A double-tap 'buzz' for copying/pasting
    }
}

// Global click listener to automatically trigger the physical haptics
document.addEventListener('click', (e) => {
    // 1. Light Tick: Navigation tabs and standard calculator number pad
    if (e.target.closest('.tab-btn') || e.target.closest('.sub-tab-btn') || e.target.closest('.calc-btn')) {
        triggerHaptic('light');
    } 
    // 2. Medium Thud: Primary action buttons (Calculate, Clear, Convert)
    else if (e.target.closest('.action-btn') && !e.target.closest('.calc-btn')) {
        triggerHaptic('medium');
    }
});


// =========================================================================
// 1.2 SMART KEYBOARD FLOW
// =========================================================================
document.addEventListener('keydown', (e) => {
    // Listen for the "Enter", "Next", or "Return" key on mobile keyboards
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault(); 

        const activeModule = e.target.closest('.calc-card');
        if (!activeModule) return;

        // Map out every visible input box inside the current tool
        const inputs = Array.from(activeModule.querySelectorAll('input:not([type="hidden"])'))
            .filter(input => input.offsetParent !== null); // Ensures we don't jump to hidden tabs
        
        const currentIndex = inputs.indexOf(e.target);
        
        // If there is another box below this one, jump the cursor to it instantly
        if (currentIndex > -1 && currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        } else {
            // If this is the final box, drop the keyboard and hit the 'Calculate' button automatically
            e.target.blur(); 
            const calcBtn = activeModule.querySelector('.action-btn:not(.local-clear-btn):not(.calc-btn)');
            if (calcBtn) {
                calcBtn.classList.add('active'); // Visual click effect
                setTimeout(() => calcBtn.classList.remove('active'), 150);
                calcBtn.click();
            }
        }
    }
});

// --- 1.5 THEME TOGGLE (DARK MODE) ---
const themeToggleBtn = document.getElementById('themeToggleBtn');
const currentTheme = localStorage.getItem('theme') || 'light';

// Initialize theme on load
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    
    // Add a quick spin animation to the icon when tapped
    themeToggleBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => themeToggleBtn.style.transform = 'rotate(0deg)', 200);

    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️';
    }
});

// =========================================================================
// 1.6 QUALITY OF LIFE TOOLS 
// =========================================================================

// --- Global Drawers (Tools & Notes) ---
const quickDrawer = document.getElementById('quickDrawer');
const drawerTab = document.getElementById('drawerTab');
const drawerOverlay = document.getElementById('drawerOverlay');
const resetDrawerBtn = document.getElementById('resetDrawerBtn');

const notesDrawer = document.getElementById('notesDrawer');
const notesTab = document.getElementById('notesTab');
const hangarNotesArea = document.getElementById('hangarNotesArea');
const clearNotesBtn = document.getElementById('clearNotesBtn');
const copyNotesBtn = document.getElementById('copyNotesBtn');

// Right Side: Tool Drawer Toggle
function toggleDrawer() {
    quickDrawer.classList.toggle('open');
    if (quickDrawer.classList.contains('open')) {
        notesDrawer.classList.remove('open'); // Close notes if open
        drawerOverlay.classList.add('visible');
    } else {
        drawerOverlay.classList.remove('visible');
    }
    triggerHaptic('light');
}

// Left Side: Notes Drawer Toggle
function toggleNotesDrawer() {
    notesDrawer.classList.toggle('open');
    if (notesDrawer.classList.contains('open')) {
        quickDrawer.classList.remove('open'); // Close tools if open
        drawerOverlay.classList.add('visible');
    } else {
        drawerOverlay.classList.remove('visible');
    }
    triggerHaptic('light');
}

// Universal Overlay Close
drawerOverlay.addEventListener('click', () => {
    quickDrawer.classList.remove('open');
    notesDrawer.classList.remove('open');
    drawerOverlay.classList.remove('visible');
});

drawerTab.addEventListener('click', toggleDrawer);
notesTab.addEventListener('click', toggleNotesDrawer);

// --- Hangar Notes Logic (Auto-Save Engine) ---
// 1. Load saved notes on boot
const savedNotes = localStorage.getItem('hangarNotesData');
if (savedNotes) {
    hangarNotesArea.value = savedNotes;
}

// 2. Auto-save on every keystroke
hangarNotesArea.addEventListener('input', () => {
    localStorage.setItem('hangarNotesData', hangarNotesArea.value);
});

// 3. Clear Notes Logic
clearNotesBtn.addEventListener('click', () => {
    if (confirm("Clear all hangar notes? This cannot be undone.")) {
        hangarNotesArea.value = '';
        localStorage.removeItem('hangarNotesData');
        triggerHaptic('medium');
    }
});

// 4. Copy Notes to Clipboard
copyNotesBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(hangarNotesArea.value);
    
    // Visual tactile feedback
    const originalText = copyNotesBtn.textContent;
    copyNotesBtn.textContent = 'Copied ✓';
    copyNotesBtn.style.backgroundColor = 'var(--success-text)';
    triggerHaptic('success');
    
    setTimeout(() => {
        copyNotesBtn.textContent = originalText;
        copyNotesBtn.style.backgroundColor = 'var(--text-muted)';
    }, 1500);
});

// Reset Logic
resetDrawerBtn.addEventListener('click', () => {
    // 1. Clear all text boxes in the drawer
    quickDrawer.querySelectorAll('input').forEach(input => input.value = '');
    
    // 2. Safely reset the calculator engine variables
    const calcHidden = document.getElementById('calcHiddenResult');
    if (calcHidden) calcHidden.textContent = '--';
    if (typeof parenCount !== 'undefined') parenCount = 0;
    
    // 3. Clear the torque extension output
    const twRes = document.getElementById('twResult');
    if (twRes) twRes.textContent = '--';
    
    triggerHaptic('medium');
});

// --- Torque Wrench Extension Calculator ---
const twTarget = document.getElementById('twTarget');
const twLength = document.getElementById('twLength');
const twExt = document.getElementById('twExt');
const twResult = document.getElementById('twResult');

function calculateTorqueExt() {
    const t = parseFloat(twTarget.value);
    const l = parseFloat(twLength.value);
    const e = parseFloat(twExt.value);

    // Ensure all numbers exist and prevent dividing by zero
    if (!isNaN(t) && !isNaN(l) && !isNaN(e) && (l + e) !== 0) {
        const indicatedTorque = (t * l) / (l + e);
        twResult.textContent = indicatedTorque.toFixed(2);
    } else {
        twResult.textContent = '--';
    }
}

// Attach live listeners
if (twTarget && twLength && twExt) {
    [twTarget, twLength, twExt].forEach(input => {
        input.addEventListener('input', calculateTorqueExt);
    });
}

// --- Quick Converter Helper Function ---
function syncInputs(id1, id2, calc1to2, calc2to1) {
    const in1 = document.getElementById(id1);
    const in2 = document.getElementById(id2);
    
    if (!in1 || !in2) return;

    in1.addEventListener('input', () => {
        const val = parseFloat(in1.value);
        if (!isNaN(val)) in2.value = Number(calc1to2(val).toFixed(4));
        else in2.value = '';
    });

    in2.addEventListener('input', () => {
        const val = parseFloat(in2.value);
        if (!isNaN(val)) in1.value = Number(calc2to1(val).toFixed(4));
        else in1.value = '';
    });
}

// Torque
syncInputs('qcInLbs', 'qcFtLbs', (inLbs) => inLbs / 12, (ftLbs) => ftLbs * 12);
// Temp
syncInputs('qcCelsius', 'qcFahrenheit', (c) => (c * 9/5) + 32, (f) => (f - 32) * 5/9);
// Metric / Imperial
syncInputs('qcMm', 'qcInches', (mm) => mm / 25.4, (inches) => inches * 25.4);
// Spacing (Fraction ↔ Decimal)
const qcFrac = document.getElementById('qcFrac');
const qcDec = document.getElementById('qcDec');

qcFrac.addEventListener('input', () => {
    const val = qcFrac.value;
    if (val.includes('/')) {
        const [n, d] = val.split('/').map(Number);
        if (d && d !== 0) qcDec.value = (n / d).toFixed(4).replace(/\.?0+$/, '');
    }
});
qcDec.addEventListener('input', () => {
    const val = parseFloat(qcDec.value);
    if (!isNaN(val)) {
        // Simple decimal to fraction approximation
        const den = 16; // Using 16ths as standard rivet spacing
        const num = Math.round(val * den);
        qcFrac.value = `${num}/${den}`;
    }
});

// --- UNIVERSAL MODULE RESET ---
document.querySelectorAll('.calc-card').forEach(card => {
    // Skip the Reference Library and the FIM Engine
    if (card.id === 'module-ref' || card.id === 'module-fim'|| card.id === 'module-cfr'|| card.id === 'module-manuals') return;

    const header = card.querySelector('h2');
    if (!header) return;

    // 1. Create the button physically in memory
    const resetBtn = document.createElement('button');
    resetBtn.className = 'module-reset-btn';
    resetBtn.textContent = '↺ Reset';
    
    // 2. Attach it to the module's header
    header.appendChild(resetBtn);

    // 3. Program the wipe logic
    resetBtn.addEventListener('click', () => {
        triggerHaptic('medium');
        // Clear all input boxes within this specific card
        card.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        
        // Reset all output values back to the default '--'
        // We target '[id]' so we only wipe the actual data, not your text labels
        card.querySelectorAll('.result-display [id]').forEach(output => {
            output.textContent = '--';
        });

        
        // Tactile feedback for the button itself
        resetBtn.style.transform = 'scale(0.9)';
        setTimeout(() => resetBtn.style.transform = 'scale(1)', 150);
    });
});

// =========================================================================
// "SHOW ME HOW" X-RAY ENGINE (V3 - Dropdown Support)
// =========================================================================
function initializeXRayEngine() {
    document.querySelectorAll('.calc-card > div').forEach(toolBlock => {
        
        // FIX: Tell the engine to look for BOTH inputs and select dropdowns!
        const inputsWithHints = toolBlock.querySelectorAll('input[data-hint], select[data-hint]');
        if (inputsWithHints.length === 0) return;

        // 1. Physically construct the hidden hint boxes safely
        inputsWithHints.forEach(element => {
            const parent = element.parentElement;
            
            // SMART PLACEMENT: If inside a flex container, target the outer input-group
            const targetGroup = (parent.style.display === 'flex' && !parent.classList.contains('input-group')) 
                                ? parent.parentElement 
                                : parent;
            
            // Prevent duplicate hint boxes from being created
            if (targetGroup.querySelector('.xray-hint')) return; 

            const hintBox = document.createElement('div');
            hintBox.className = 'xray-hint';
            hintBox.innerHTML = `↳ ${element.getAttribute('data-hint')}`;
            
            if (targetGroup.classList.contains('input-group')) {
                targetGroup.appendChild(hintBox);
            } else {
                parent.insertAdjacentElement('afterend', hintBox);
            }
        });

        // 2. Inject the Toggle Button (only if it doesn't already exist)
        const header = toolBlock.querySelector('h3');
        if (header && !header.querySelector('.show-me-btn')) {
            const showMeBtn = document.createElement('button');
            showMeBtn.className = 'show-me-btn';
            showMeBtn.innerHTML = '💡 Show Me How';
            
            showMeBtn.addEventListener('click', () => {
                toolBlock.classList.toggle('xray-active');
                showMeBtn.classList.toggle('active');
                showMeBtn.innerHTML = toolBlock.classList.contains('xray-active') ? 'Hide Guide' : '💡 Show Me How';
                if (typeof triggerHaptic === 'function') triggerHaptic('light');
            });

            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.width = '100%';
            header.appendChild(showMeBtn);
        }
    });
}


// --- 1.7 SMART LOCAL CLEAR BUTTONS ---
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('local-clear-btn')) {
        triggerHaptic('medium');
        const toolBlock = e.target.parentElement;
        
        // 1. Clear all inputs inside this specific tool only
        toolBlock.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        
        // 2. Reset all outputs back to default
        toolBlock.querySelectorAll('.result-display [id]').forEach(output => {
            // Maintain specific string formatting for certain tools
            if (output.id === 'cylExtOut' || output.id === 'cylRetOut') {
                output.textContent = '-- lbs';
            } else if (output.id === 'outXl' || output.id === 'outXc' || output.id === 'outZ') {
                output.textContent = '-- Ω';
            } else if (output.id === 'wireAwgOut') {
                output.textContent = '-- AWG';
            } else if (output.id === 'wireDropOut') {
                output.textContent = '-- V';
            } else if (output.id.includes('ED') || output.id === 'outBA' || output.id === 'outSB' || output.id === 'outFlat' || output.id === 'outSL') {
                output.textContent = '--"';
            } else {
                output.textContent = '--';
            }
        });

        // 3. Tactile visual feedback
        e.target.style.transform = 'scale(0.96)';
        setTimeout(() => e.target.style.transform = 'scale(1)', 150);
    }
});


// =========================================================================
// --- 2. WEIGHT & BALANCE MODULE ---
// =========================================================================

// --- DYNAMIC ROW DELETION LISTENER (BULLETPROOF VERSION) ---
document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.remove-row-btn');
    if (!deleteBtn) return; 

    if (typeof triggerHaptic === 'function') triggerHaptic('medium');
    
    // 1. Added '.layer-row' to the search path
    const row = deleteBtn.closest('.cg-row, .rem-row, .add-row, .layer-row');
    if (row) {
        row.remove(); 
        
        setTimeout(() => {
            // 2. NEW: If a metal layer was deleted, re-number all remaining labels perfectly (1, 2, 3...)
            if (row.classList.contains('layer-row')) {
                let layerNum = 1;
                document.querySelectorAll('#layers-container label').forEach(label => {
                    label.textContent = `Layer ${layerNum} Thickness`;
                    layerNum++;
                });
            }

            // 3. Force the calculators to update automatically
            const calcCgBtn = document.getElementById('calcCgBtn');
            const calcAltBtn = document.getElementById('calcAltBtn');
            const calcMetalBtn = document.getElementById('calcMetalBtn');
            
            if (calcCgBtn && row.classList.contains('cg-row')) calcCgBtn.click();
            if (calcAltBtn && (row.classList.contains('rem-row') || row.classList.contains('add-row'))) calcAltBtn.click();
            if (calcMetalBtn && row.classList.contains('layer-row')) calcMetalBtn.click();
            
            if (typeof saveOmniVault === 'function') saveOmniVault();
        }, 50);
    }
});

// --- 1. Single Item Solver Logic ---
document.getElementById('calcWbBtn').addEventListener('click', () => {
    const w = parseFloat(document.getElementById('wbWeight').value);
    const a = parseFloat(document.getElementById('wbArm').value);
    const m = parseFloat(document.getElementById('wbMoment').value);
    const res = document.getElementById('wbResult');

    if ([!isNaN(w), !isNaN(a), !isNaN(m)].filter(Boolean).length !== 2) {
        res.textContent = "Error: Enter exactly 2 values"; return;
    }
    
    if (isNaN(w)) {
        document.getElementById('wbWeight').value = (m / a).toFixed(2);
        res.textContent = "Weight: " + (m / a).toFixed(2);
    } else if (isNaN(a)) {
        document.getElementById('wbArm').value = (m / w).toFixed(2);
        res.textContent = "Arm: " + (m / w).toFixed(2);
    } else if (isNaN(m)) {
        document.getElementById('wbMoment').value = (w * a).toFixed(2);
        res.textContent = "Moment: " + (w * a).toFixed(2);
    }
});

// --- 2. Aircraft Total CG Logic ---
document.getElementById('addCgRowBtn').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'cg-row';
    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 10px;';
    div.innerHTML = `
      <div class="input-group" style="flex: 2; margin-bottom: 0;">
        <input type="text" placeholder="Item" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
      </div>
      <div class="input-group" style="flex: 1.5; margin-bottom: 0;">
        <input type="number" inputmode="decimal" class="cg-weight" placeholder="W" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
      </div>
      <div class="input-group" style="flex: 1.5; margin-bottom: 0;">
        <input type="number" inputmode="decimal" class="cg-arm" placeholder="A" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
      </div>
      <button class="remove-row-btn" title="Remove">&times;</button>`;
    document.getElementById('cg-layers-container').appendChild(div);
});

document.getElementById('calcCgBtn').addEventListener('click', () => {
    let tW = 0, tM = 0;
    document.querySelectorAll('.cg-row').forEach(row => {
        const w = parseFloat(row.querySelector('.cg-weight').value) || 0;
        const a = parseFloat(row.querySelector('.cg-arm').value) || 0;
        if (w !== 0 && a !== 0) { tW += w; tM += (w * a); }
    });
    if (tW === 0) return;
    document.getElementById('outCgWeight').textContent = tW.toFixed(2);
    document.getElementById('outCg').textContent = (tM / tW).toFixed(3);
});

// --- 3. Ballast Shift Logic ---
document.getElementById('calcBallastBtn').addEventListener('click', () => {
    const w = parseFloat(document.getElementById('balWeight').value);
    const curCg = parseFloat(document.getElementById('balCurrentCg').value);
    const tgtCg = parseFloat(document.getElementById('balTargetCg').value);
    const arm = parseFloat(document.getElementById('balArm').value);
    if (isNaN(w) || isNaN(curCg) || isNaN(tgtCg) || isNaN(arm)) return;
    const bw = (w * (tgtCg - curCg)) / (arm - tgtCg);
    document.getElementById('balResult').textContent = `${bw.toFixed(2)} lbs`;
});

// --- 4. Equipment Change (Alteration) Logic ---
document.getElementById('addRemBtn').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'rem-row';
    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
    div.innerHTML = `
      <div class="input-group" style="flex: 1; margin-bottom: 0;">
        <input type="number" inputmode="decimal" class="rem-wt" placeholder="Wt" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
      </div>
      <div class="input-group" style="flex: 1; margin-bottom: 0;">
        <input type="number" inputmode="decimal" class="rem-arm" placeholder="Arm" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
      </div>
      <button class="remove-row-btn" title="Remove">&times;</button>`;
    document.getElementById('rem-container').appendChild(div);
});

document.getElementById('addAddBtn').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'add-row';
    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
    div.innerHTML = `
      <div class="input-group" style="flex: 1; margin-bottom: 0;">
        <input type="number" inputmode="decimal" class="add-wt" placeholder="Wt" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
      </div>
      <div class="input-group" style="flex: 1; margin-bottom: 0;">
        <input type="number" inputmode="decimal" class="add-arm" placeholder="Arm" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
      </div>
      <button class="remove-row-btn" title="Remove">&times;</button>`;
    document.getElementById('add-container').appendChild(div);
});

document.getElementById('calcAltBtn').addEventListener('click', () => {
    const oldW = parseFloat(document.getElementById('altOldWt').value);
    const oldCg = parseFloat(document.getElementById('altOldCg').value);
    
    // BULLETPROOF UX: Soft-fail instead of an intrusive browser alert popup
    if (isNaN(oldW) || isNaN(oldCg)) { 
        document.getElementById('altResWt').textContent = '--';
        return; 
    }
    
    let remM = 0, remW = 0, addM = 0, addW = 0;
    
    document.querySelectorAll('.rem-row').forEach(row => {
        const w = parseFloat(row.querySelector('.rem-wt').value) || 0;
        const a = parseFloat(row.querySelector('.rem-arm').value) || 0;
        remM += (w * a); remW += w;
    });
    
    document.querySelectorAll('.add-row').forEach(row => {
        const w = parseFloat(row.querySelector('.add-wt').value) || 0;
        const a = parseFloat(row.querySelector('.add-arm').value) || 0;
        addM += (w * a); addW += w;
    });
    
    const newW = oldW - remW + addW;
    const newM = (oldW * oldCg) - remM + addM;
    document.getElementById('altResWt').textContent = newW.toFixed(2);
    document.getElementById('altResCg').textContent = (newM / newW).toFixed(2);
});

// =========================================================================
// --- 3. SHEET METAL MODULE ---
// =========================================================================

// --- Add Layer Logic with Delete Button ---
document.getElementById('addLayerBtn').addEventListener('click', () => {
    const count = document.querySelectorAll('.layer-input').length + 1;
    const div = document.createElement('div');
    div.className = 'layer-row';
    div.style.cssText = 'display: flex; gap: 8px; align-items: flex-end; margin-bottom: 1.2rem;';
    
    div.innerHTML = `
        <div class="input-group" style="flex: 1; margin-bottom: 0;">
            <label>Layer ${count} Thickness</label>
            <input type="number" inputmode="decimal" class="layer-input" step="0.001">
        </div>
        <button class="remove-row-btn" title="Remove" style="height: 48px;">&times;</button>
    `;
    document.getElementById('layers-container').appendChild(div);
});

document.getElementById('calcMetalBtn').addEventListener('click', () => {
    let tMax = 0, tTotal = 0;
    document.querySelectorAll('.layer-input').forEach(i => { 
        const v = parseFloat(i.value); 
        if(v > 0) { tTotal+=v; if(v>tMax) tMax=v; } 
    });
    
    if (tTotal === 0) return;
    
    let dashDia = Math.ceil(tMax * 3 * 32); 
    if (dashDia < 3) dashDia = 3; 
    
    let d = dashDia / 32;
    let pilotDrill = "--", finalDrill = "--", cleco = "--";
    
    switch(dashDia) {
        case 3: pilotDrill = "N/A"; finalDrill = "#40"; cleco = "Silver / White"; break;
        case 4: pilotDrill = '1/8"'; finalDrill = "#30"; cleco = "Copper"; break;
        case 5: pilotDrill = '1/8"'; finalDrill = "#21"; cleco = "Black"; break;
        case 6: pilotDrill = "#30"; finalDrill = "#11"; cleco = "Brass"; break;
        case 8: pilotDrill = "#30"; finalDrill = 'Letter "F" (1/4")'; cleco = "Copper / Green"; break;
        default: pilotDrill = "--"; finalDrill = "Check Manual"; cleco = "N/A";
    }

    let univED = d * 2;
    let flushED = d * 2.5;

    document.getElementById('outDiaDash').textContent = `-${dashDia} (${d.toFixed(3)}")`;
    document.getElementById('outLenDash').textContent = `-${Math.round((tTotal + (1.5 * d)) * 16)}`;
    document.getElementById('outPilot').textContent = pilotDrill;
    document.getElementById('outFinal').textContent = finalDrill;
    document.getElementById('outCleco').textContent = cleco;
    document.getElementById('outUnivED').textContent = univED.toFixed(3) + '"';
    document.getElementById('outFlushED').textContent = flushED.toFixed(3) + '"';
    document.getElementById('rivetED').value = univED.toFixed(3);
});

document.getElementById('calcRivetBtn').addEventListener('click', () => {
    const len = parseFloat(document.getElementById('rivetLen').value);
    const ed = parseFloat(document.getElementById('rivetED').value);
    let count = parseFloat(document.getElementById('rivetCount').value);
    
    if (isNaN(count)) count = 6;

    if (isNaN(len) || isNaN(ed) || count < 2) {
        document.getElementById('rivetPitchOut').textContent = "Error"; return;
    }
    
    const pitch = (len - (2 * ed)) / (count - 1);
    document.getElementById('rivetPitchOut').textContent = pitch.toFixed(3);
});

// Bend Allowance & Sightline Calculator
document.getElementById('calcBendBtn').addEventListener('click', () => {
    const t = parseFloat(document.getElementById('bendT').value);
    const r = parseFloat(document.getElementById('bendR').value);
    const angle = parseFloat(document.getElementById('bendAngle').value);
    const flange = parseFloat(document.getElementById('bendFlange').value);

    // Validate inputs (Flange is optional unless they want Flat/Sightline)
    if (isNaN(t) || isNaN(r) || isNaN(angle)) {
        alert("Please enter at least Thickness, Radius, and Angle.");
        return;
    }

    // 1. Calculate Bend Allowance (AC 43.13 Empirical Formula)
    const ba = ((0.01743 * r) + (0.0078 * t)) * angle;

    // 2. Calculate Setback (K-Factor * (R + T))
    // Convert angle to radians for Math.tan
    const kFactor = Math.tan((angle / 2) * (Math.PI / 180));
    const sb = kFactor * (r + t);

    // Output BA and SB
    document.getElementById('outBA').textContent = ba.toFixed(4) + '"';
    document.getElementById('outSB').textContent = sb.toFixed(4) + '"';

    // 3. Calculate Flat & Sightline (if Flange length is provided)
    if (!isNaN(flange)) {
        const flat = flange - sb;
        const sightline = flat + r;
        
        document.getElementById('outFlat').textContent = flat.toFixed(4) + '"';
        document.getElementById('outSL').textContent = sightline.toFixed(4) + '"';
    } else {
        document.getElementById('outFlat').textContent = "Need Flange";
        document.getElementById('outSL').textContent = "Need Flange";
    }
});


// --- 4. ELECTRICAL MODULE ---
document.getElementById('calcElecBtn').addEventListener('click', () => {
    const v = parseFloat(document.getElementById('voltsInput').value);
    const i = parseFloat(document.getElementById('ampsInput').value);
    const r = parseFloat(document.getElementById('ohmsInput').value);
    const p = parseFloat(document.getElementById('wattsInput').value);
    const count = [!isNaN(v), !isNaN(i), !isNaN(r), !isNaN(p)].filter(Boolean).length;
    
    if (count !== 2) { alert("Enter exactly 2 values"); return; }
    
    let cv, ci, cr, cp;
    if (!isNaN(v) && !isNaN(i)) { cv=v; ci=i; cr=v/i; cp=v*i; }
    else if (!isNaN(v) && !isNaN(r)) { cv=v; cr=r; ci=v/r; cp=(v*v)/r; }
    else if (!isNaN(v) && !isNaN(p)) { cv=v; cp=p; ci=p/v; cr=(v*v)/p; }
    else if (!isNaN(i) && !isNaN(r)) { ci=i; cr=r; cv=i*r; cp=(i*i)*r; }
    else if (!isNaN(i) && !isNaN(p)) { ci=i; cp=p; cv=p/i; cr=p/(i*i); }
    else if (!isNaN(r) && !isNaN(p)) { cr=r; cp=p; cv=Math.sqrt(p*r); ci=Math.sqrt(p/r); }
    
    document.getElementById('voltsInput').value = cv.toFixed(2);
    document.getElementById('ampsInput').value = ci.toFixed(2);
    document.getElementById('ohmsInput').value = cr.toFixed(2);
    document.getElementById('wattsInput').value = cp.toFixed(2);
});

document.getElementById('calcLoadBtn').addEventListener('click', () => {
    const hp = parseFloat(document.getElementById('loadA').value);
    const eff = parseFloat(document.getElementById('loadB').value);
    if(isNaN(hp) || isNaN(eff) || eff === 0) return;
    
    let watts = (hp * 746) / eff;
    document.getElementById('loadRes').textContent = watts.toFixed(1);
});

// --- Battery Specific Gravity Correction ---
document.getElementById('calcSgBtn').addEventListener('click', () => {
    const sg = parseFloat(document.getElementById('sgMeasured').value);
    const temp = parseFloat(document.getElementById('sgTemp').value);

    if (isNaN(sg) || isNaN(temp)) {
        alert("Please enter both Measured SG and Temperature.");
        return;
    }

    // Standard formula: 0.004 adjustment for every 10 degrees difference from 80F
    const tempDiff = temp - 80;
    const correction = (tempDiff / 10) * 0.004;
    const correctedSg = sg + correction;

    // Format the correction to explicitly show the plus or minus sign
    const sign = correction > 0 ? "+" : "";
    document.getElementById('sgCorrection').textContent = sign + correction.toFixed(4);
    
    // We update the final output LAST so the Smart Clipboard explicitly grabs this value
    document.getElementById('sgCorrectedOut').textContent = correctedSg.toFixed(3);
});

// --- AC Reactance & Impedance Logic ---
document.getElementById('calcAcBtn').addEventListener('click', () => {
    
    // 1. Grab raw inputs and multiply them by their selected unit dropdown values
    const fRaw = parseFloat(document.getElementById('acFreq').value);
    const fMult = parseFloat(document.getElementById('acFreqUnit').value) || 1;
    const f = fRaw * fMult;

    const rRaw = parseFloat(document.getElementById('acRes').value) || 0;
    const rMult = parseFloat(document.getElementById('acResUnit').value) || 1;
    const r = rRaw * rMult;

    const lRaw = parseFloat(document.getElementById('acInd').value);
    const lMult = parseFloat(document.getElementById('acIndUnit').value) || 1;
    const l = lRaw * lMult;

    const cRaw = parseFloat(document.getElementById('acCap').value);
    const cMult = parseFloat(document.getElementById('acCapUnit').value) || 1;
    const c = cRaw * cMult;

    // 2. BULLETPROOF UX: Soft-fail if they forget the Frequency
    if (isNaN(fRaw)) {
        document.getElementById('outZ').textContent = "Need Freq";
        document.getElementById('outXl').textContent = '-- Ω';
        document.getElementById('outXc').textContent = '-- Ω';
        return;
    }

    let xl = 0;
    let xc = 0;

    // 3. Calculate Inductive Reactance (X_L = 2 * PI * f * L)
    if (!isNaN(lRaw)) {
        xl = 2 * Math.PI * f * l;
        document.getElementById('outXl').textContent = xl.toFixed(2) + ' Ω';
    } else {
        document.getElementById('outXl').textContent = '0.00 Ω';
    }

    // 4. Calculate Capacitive Reactance (X_C = 1 / (2 * PI * f * C))
    if (!isNaN(cRaw) && c > 0) {
        xc = 1 / (2 * Math.PI * f * c);
        document.getElementById('outXc').textContent = xc.toFixed(2) + ' Ω';
    } else if (cRaw === 0) {
        document.getElementById('outXc').textContent = 'Infinite Ω';
    } else {
        document.getElementById('outXc').textContent = '0.00 Ω';
    }

    // 5. Calculate Total Impedance (Z = sqrt(R^2 + (X_L - X_C)^2))
    if (!isNaN(rRaw) || !isNaN(lRaw) || !isNaN(cRaw)) {
         const z = Math.sqrt(Math.pow(r, 2) + Math.pow(xl - xc, 2));
         document.getElementById('outZ').textContent = z.toFixed(2) + ' Ω';
    } else {
         document.getElementById('outZ').textContent = '-- Ω';
    }
});

// --- AWG Wire Size Estimator Logic ---
const awgData = [
    { awg: '24', bundle: 2, free: 3, ohms: 25.67 },
    { awg: '22', bundle: 3, free: 4, ohms: 16.14 },
    { awg: '20', bundle: 4, free: 6, ohms: 10.15 },
    { awg: '18', bundle: 6, free: 10, ohms: 6.38 },
    { awg: '16', bundle: 9, free: 13, ohms: 4.02 },
    { awg: '14', bundle: 12, free: 18, ohms: 2.53 },
    { awg: '12', bundle: 17, free: 23, ohms: 1.59 },
    { awg: '10', bundle: 24, free: 33, ohms: 1.00 },
    { awg: '8', bundle: 33, free: 46, ohms: 0.63 },
    { awg: '6', bundle: 45, free: 60, ohms: 0.40 },
    { awg: '4', bundle: 60, free: 80, ohms: 0.25 },
    { awg: '2', bundle: 80, free: 100, ohms: 0.16 },
    { awg: '1', bundle: 100, free: 120, ohms: 0.13 },
    { awg: '0 (1/0)', bundle: 120, free: 150, ohms: 0.10 },
    { awg: '00 (2/0)', bundle: 140, free: 175, ohms: 0.08 }
];

document.getElementById('calcWireBtn').addEventListener('click', () => {
    const sysVolt = parseFloat(document.getElementById('wireSysVolt').value);
    const loadType = document.getElementById('wireLoadType').value;
    const routing = document.getElementById('wireRouting').value;
    const amps = parseFloat(document.getElementById('wireAmps').value);
    const len = parseFloat(document.getElementById('wireLen').value);

    // Soft-Fail UX
    if (isNaN(sysVolt) || isNaN(amps) || isNaN(len) || sysVolt <= 0 || amps <= 0 || len <= 0) {
        document.getElementById('wireAwgOut').textContent = "Fill All Fields";
        document.getElementById('wireDropOut').textContent = "-- V";
        document.getElementById('wireLimitOut').textContent = "--";
        return;
    }

    // 1. Establish Max Allowed Voltage Drop
    let maxVd = 0;
    
    // Snap to the exact AC 43.13-1B chart values for standard voltages
    if (sysVolt === 14) maxVd = (loadType === 'cont') ? 0.5 : 1.0;
    else if (sysVolt === 28) maxVd = (loadType === 'cont') ? 1.0 : 2.0;
    else if (sysVolt === 115) maxVd = (loadType === 'cont') ? 4.0 : 8.0;
    else if (sysVolt === 200) maxVd = (loadType === 'cont') ? 7.0 : 14.0;
    else {
        // For custom voltages (like 127V), dynamically apply the FAA's underlying ratio
        // Continuous limit is ~3.57% of total voltage. Intermittent is double.
        maxVd = (loadType === 'cont') ? (sysVolt * 0.0357) : (sysVolt * 0.0714);
    }

    let selectedWire = null;
    let limitingFactor = "";
    let actualDrop = 0;

    // 2. Scan the table from thinnest (AWG 24) to thickest (AWG 00)
    for (let i = 0; i < awgData.length; i++) {
        const wire = awgData[i];
        
        // Test A: Does it melt? (Ampacity)
        const meetsAmpacity = amps <= wire[routing];
        
        // Test B: Does it drop too much voltage? (Resistance calculation)
        const runResistance = (wire.ohms / 1000) * len;
        const drop = amps * runResistance;
        const meetsDrop = drop <= maxVd;

        // If it passes both tests, we found our wire!
        if (meetsAmpacity && meetsDrop) {
            selectedWire = wire;
            actualDrop = drop;
            
            // Diagnostics: Figure out WHY we had to go this thick
            if (i > 0) {
                const prevWire = awgData[i - 1];
                const prevMeetsAmp = amps <= prevWire[routing];
                const prevMeetsDrop = (amps * ((prevWire.ohms / 1000) * len)) <= maxVd;
                
                if (!prevMeetsAmp && prevMeetsDrop) limitingFactor = "Current Rating (Ampacity)";
                else if (prevMeetsAmp && !prevMeetsDrop) limitingFactor = `Voltage Drop Limit (${maxVd.toFixed(2)}V max)`;
                else limitingFactor = "Amps & Voltage Drop";
            } else {
                limitingFactor = "Minimum Safe Gauge"; 
            }
            break;
        }
    }

    // 3. Render Output
    if (selectedWire) {
        document.getElementById('wireAwgOut').textContent = selectedWire.awg + " AWG";
        document.getElementById('wireDropOut').textContent = actualDrop.toFixed(2) + " V";
        document.getElementById('wireLimitOut').textContent = limitingFactor;
    } else {
        document.getElementById('wireAwgOut').textContent = "Exceeds 2/0";
        document.getElementById('wireDropOut').textContent = "-- V";
        document.getElementById('wireLimitOut').textContent = "Out of Range";
    }
});

// =========================================================================
// --- RESISTOR COLOR DECODER LOGIC (4, 5, 6 Band) ---
// =========================================================================

function calculateResistor() {
    const bandCount = parseInt(document.getElementById('resBandCount').value);
    
    // Grab all DOM elements
    const d1El = document.getElementById('resD1');
    const d2El = document.getElementById('resD2');
    const d3El = document.getElementById('resD3');
    const multEl = document.getElementById('resMult');
    const tolEl = document.getElementById('resTol');
    const tempEl = document.getElementById('resTemp');
    
    if (!d1El || !d2El || !multEl || !tolEl) return;

    // 1. Dynamic UI Toggle (Slide the extra boxes in and out)
    document.getElementById('groupD3').style.display = (bandCount >= 5) ? 'flex' : 'none';
    document.getElementById('groupTemp').style.display = (bandCount === 6) ? 'flex' : 'none';

    // 2. Build array of only the currently VISIBLE dropdowns
    const activeSelects = [d1El, d2El, multEl, tolEl];
    if (bandCount >= 5) activeSelects.push(d3El);
    if (bandCount === 6) activeSelects.push(tempEl);

    // 3. Instantly repaint the active dropdowns to match their physical colors
    activeSelects.forEach(select => {
        const option = select.options[select.selectedIndex];
        select.style.backgroundColor = option.getAttribute('data-color');
        select.style.color = option.getAttribute('data-text');
        select.style.fontWeight = 'bold'; 
    });

    // 4. Extract raw mathematical values
    const val1 = parseInt(d1El.value);
    const val2 = parseInt(d2El.value);
    const val3 = (bandCount >= 5) ? parseInt(d3El.value) : 0;
    const mult = parseFloat(multEl.value);
    const tol = parseFloat(tolEl.value);
    const temp = parseInt(tempEl.value);

    // 5. Compute base resistance based on band configuration
    let resistance = 0;
    if (bandCount === 4) {
        resistance = ((val1 * 10) + val2) * mult;
    } else {
        resistance = ((val1 * 100) + (val2 * 10) + val3) * mult;
    }
    
    // Calculate boundaries
    const tolMath = resistance * (tol / 100);
    const lowerLimit = resistance - tolMath;
    const upperLimit = resistance + tolMath;
    
    // Format strings
    let standardString = resistance.toLocaleString('en-US', { maximumFractionDigits: 4 });
    let lowerString = lowerLimit.toLocaleString('en-US', { maximumFractionDigits: 2 });
    let upperString = upperLimit.toLocaleString('en-US', { maximumFractionDigits: 2 });

    let scaledValue = resistance;
    let unit = 'Ω';

    // Scale to kΩ or MΩ
    if (scaledValue >= 1000000) {
        scaledValue = scaledValue / 1000000;
        unit = 'MΩ';
    } else if (scaledValue >= 1000) {
        scaledValue = scaledValue / 1000;
        unit = 'kΩ';
    }

    const resString = Number.isInteger(scaledValue) ? scaledValue.toString() : scaledValue.toFixed(2).replace(/\.?0+$/, '');

    // 6. Push to DOM
    document.getElementById('resOutTotal').textContent = `${resString} ${unit}`;
    
    const standardOut = document.getElementById('resOutStandard');
    if (standardOut) {
        if (unit !== 'Ω') {
            standardOut.style.display = 'block';
            standardOut.textContent = `(${standardString} Ω)`;
        } else {
            standardOut.style.display = 'none'; 
        }
    }
    
    document.getElementById('resOutTol').textContent = `±${tol}%`;
    const rangeOut = document.getElementById('resOutRange');
    if (rangeOut) {
        rangeOut.textContent = `Range: ${lowerString} Ω to ${upperString} Ω`;
    }

    // Toggle the Temp Coeff text output
    const tempOut = document.getElementById('resOutTemp');
    if (bandCount === 6) {
        tempOut.style.display = 'block';
        tempOut.textContent = `Temp Coeff: ${temp} ppm/K`;
    } else {
        tempOut.style.display = 'none';
    }
}

// --- EVENT LISTENERS ---
// Triggers math calculation if ANY of the boxes are touched
const resistorInputs = ['resBandCount', 'resD1', 'resD2', 'resD3', 'resMult', 'resTol', 'resTemp'];
resistorInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('change', () => {
            calculateResistor();
            if (typeof triggerHaptic === 'function') triggerHaptic('light'); 
        });
    }
});

// --- 5. GENERAL MATH MODULE ---
function safeEval(expr) {
    try {
        const sanitized = expr.replace(/[^-()\d/*+.]/g, ''); 
        return Function('"use strict";return (' + sanitized + ')')();
    } catch (e) { return "Error"; }
}

// Standard Calculator Logic
const calcDisplay = document.getElementById('calcDisplay');
const calcHiddenResult = document.getElementById('calcHiddenResult');
const calcHistoryContainer = document.getElementById('calcHistoryContainer');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
let parenCount = 0;
let calcHistory = []; 

// 1. Load persistent history on boot
const savedHistory = localStorage.getItem('calcHistoryVault');
if (savedHistory) {
    calcHistory = JSON.parse(savedHistory);
    renderCalcHistory();
}

// 2. The History Renderer & Smart Clipboard Hook
function renderCalcHistory() {
    if (calcHistory.length === 0) {
        calcHistoryContainer.innerHTML = '<div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No history yet</div>';
        return;
    }

    calcHistoryContainer.innerHTML = '';
    
    // Loop backwards so the newest calculation sits at the top of the list
    for (let i = calcHistory.length - 1; i >= 0; i--) {
        const entry = calcHistory[i];
        const div = document.createElement('div');
        div.className = 'history-item';
        
        div.innerHTML = `
            <div style="flex: 1; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span class="history-equation">${entry.eq} =</span>
                <span class="history-result">${entry.res}</span>
            </div>
            <button class="history-copy-btn" data-res="${entry.res}">Copy</button>
        `;
        calcHistoryContainer.appendChild(div);
    }

    // Attach logic to the new Copy buttons
    calcHistoryContainer.querySelectorAll('.history-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const resToCopy = e.target.getAttribute('data-res');
            
            // A. Copy to the device's native OS clipboard
            navigator.clipboard.writeText(resToCopy).catch(err => console.log("Native clipboard bypassed."));
            
            // B. Send it straight into our custom Smart Clipboard engine
            smartClipboard = resToCopy;
            localStorage.setItem('smartClipboard', smartClipboard);

            // C. Tactile UI Feedback
            triggerHaptic('success');
            const originalText = e.target.textContent;
            e.target.textContent = 'Copied ✓';
            e.target.style.backgroundColor = 'var(--success-text)';
            e.target.style.color = 'white';
            e.target.style.borderColor = 'var(--success-text)';
            
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.style.backgroundColor = '';
                e.target.style.color = '';
                e.target.style.borderColor = '';
            }, 1000);
        });
    });
}

// 3. Clear History Logic
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        calcHistory = [];
        localStorage.removeItem('calcHistoryVault');
        renderCalcHistory();
    });
}

// 4. Calculator Brain
document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        
        if (calcDisplay.value === 'Error') calcDisplay.value = '';

        if (val === 'C') {
            calcDisplay.value = '';
            calcHiddenResult.textContent = '--';
            parenCount = 0;
        } else if (val === '=') {
            const originalExpr = calcDisplay.value; // Save exactly what is on screen
            let expr = calcDisplay.value.replace(/×/g, '*').replace(/÷/g, '/').replace(/%/g, '/100');
            
            while(parenCount > 0) { expr += ')'; parenCount--; }
            
            let res = safeEval(expr);
            
            if (res !== "Error" && res !== undefined && !isNaN(res) && calcDisplay.value.trim() !== "") {
                res = Math.round(res * 1000000) / 1000000; 
                calcDisplay.value = res;
                calcHiddenResult.textContent = res; 
                parenCount = 0;

                // Push to History Array (Cap at 10 items to save space)
                calcHistory.push({ eq: originalExpr, res: res });
                if (calcHistory.length > 10) calcHistory.shift(); 
                
                // Save and Render
                localStorage.setItem('calcHistoryVault', JSON.stringify(calcHistory));
                renderCalcHistory();
                
            } else {
                calcDisplay.value = 'Error';
                setTimeout(() => calcDisplay.value = '', 1200);
            }
        } else if (val === '()') {
            const lastChar = calcDisplay.value.slice(-1);
            if (parenCount > 0 && lastChar !== '(' && !['+','-','*','/','×','÷'].includes(lastChar)) {
                calcDisplay.value += ')';
                parenCount--;
            } else {
                calcDisplay.value += '(';
                parenCount++;
            }
        } else {
            if (val === '*') calcDisplay.value += '×';
            else if (val === '/') calcDisplay.value += '÷';
            else calcDisplay.value += val;
        }

        calcDisplay.dispatchEvent(new Event('input', { bubbles: true }));
    });
});

// Proportions & Ratios Logic
document.getElementById('calcPropBtn').addEventListener('click', () => {
    const aInput = document.getElementById('propA');
    const bInput = document.getElementById('propB');
    const cInput = document.getElementById('propC');
    const dInput = document.getElementById('propD');
    
    const a = parseFloat(aInput.value); const b = parseFloat(bInput.value);
    const c = parseFloat(cInput.value); const d = parseFloat(dInput.value);
    
    if (isNaN(a)) { aInput.value = (b * c) / d; }
    else if (isNaN(b)) { bInput.value = (a * d) / c; }
    else if (isNaN(c)) { cInput.value = (a * d) / b; }
    else if (isNaN(d)) { dInput.value = (b * c) / a; }
});

// Percentage Calculator Logic
document.getElementById('calcPctBtn').addEventListener('click', () => {
    const type = document.getElementById('pctType').value;
    const x = parseFloat(document.getElementById('pctX').value);
    const y = parseFloat(document.getElementById('pctY').value);
    const resDisplay = document.getElementById('pctRes');
    
    if (isNaN(x) || isNaN(y)) {
        resDisplay.textContent = "Enter both values";
        return;
    }
    
    let result = "";
    if (type === 'pctOf') {
        result = ((x / 100) * y).toFixed(2);
    } else if (type === 'isWhatPct') {
        if (y === 0) result = "Error (Div by 0)";
        else result = ((x / y) * 100).toFixed(2) + "%";
    } else if (type === 'pctChange') {
        if (x === 0) result = "Error (Div by 0)";
        else {
            const change = ((y - x) / Math.abs(x)) * 100;
            const sign = change > 0 ? "+" : "";
            result = sign + change.toFixed(2) + "%";
        }
    }
    
    resDisplay.textContent = result;
});

// UX Feature: Update placeholders when dropdown changes
document.getElementById('pctType').addEventListener('change', (e) => {
    const type = e.target.value;
    const inputX = document.getElementById('pctX');
    const inputY = document.getElementById('pctY');
    
    if (type === 'pctOf') {
        inputX.placeholder = "e.g., 15 (%)";
        inputY.placeholder = "e.g., 200";
    } else if (type === 'isWhatPct') {
        inputX.placeholder = "e.g., 30";
        inputY.placeholder = "e.g., 150";
    } else if (type === 'pctChange') {
        inputX.placeholder = "Old Value";
        inputY.placeholder = "New Value";
    }
    
    inputX.value = '';
    inputY.value = '';
    document.getElementById('pctRes').textContent = '--';
});

// --- 6. REFERENCE LIBRARY LOGIC ---
const refSearch = document.getElementById('refSearch');
const refItems = document.querySelectorAll('.ref-item');
const refTabBtns = document.querySelectorAll('.ref-tab-btn');

// Live Search Filtering
refSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();

    // Reset tabs to "All" when actively searching to prevent hidden matches
    if(term.length > 0) {
        refTabBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.ref-tab-btn[data-filter="all"]').classList.add('active');
    }

    refItems.forEach(item => {
        // Search through all text inside the block (formulas, table rows, headers)
        const text = item.innerText.toLowerCase();
        if (text.includes(term)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

// Category Tab Filtering
refTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Clear the search bar when a category is clicked
        refSearch.value = '';

        // Update active tab styling
        refTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        refItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// --- 7. IMAGE LIGHTBOX LOGIC (BULLETPROOF VERSION) ---

// 1. Auto-inject the modal HTML directly from JavaScript so it's guaranteed to exist
if (!document.getElementById('imgModal')) {
    const modalHtml = `
        <div id="imgModal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.95); backdrop-filter: blur(5px); overflow: auto; overscroll-behavior: contain;">
            <span id="closeModalBtn" style="position: fixed; top: 15px; right: 25px; color: #ffffff; font-size: 45px; font-weight: bold; cursor: pointer; z-index: 10000; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">&times;</span>
            <div id="modalContainer" style="width: 100%; min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <img id="modalImg" style="margin: auto; display: block; max-width: 100%; max-height: 90vh; object-fit: contain; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

const imgModal = document.getElementById('imgModal');
const modalImg = document.getElementById('modalImg');

// 2. Use "Event Delegation" to catch taps anywhere on the screen
document.body.addEventListener('click', function(e) {
    
    // A. Did they tap an image inside the reference module?
    if (e.target.tagName === 'IMG' && e.target.closest('#module-ref')) {
        imgModal.style.display = 'block';
        modalImg.src = e.target.src;
        document.body.style.overflow = 'hidden'; // Stop background from scrolling
    }
    
    // B. Did they tap the dark background, the container, or the 'X' button?
    if (e.target === imgModal || e.target.id === 'modalContainer' || e.target.id === 'closeModalBtn') {
        imgModal.style.display = 'none';
        modalImg.src = '';
        document.body.style.overflow = ''; // Restore background scrolling
    }
});

// --- 8. MEASUREMENT VISUALIZER LOGIC ---
const rulerTicks = document.getElementById('rulerTicks');
const measureInput = document.getElementById('measureInput');
const rulerMarker = document.getElementById('rulerMarker');
const markerLabel = document.getElementById('markerLabel');
const exactDecOut = document.getElementById('exactDecOut');
const exactFracOut = document.getElementById('exactFracOut');
const rulerScaleSelect = document.getElementById('rulerScaleSelect');

// Function to draw dynamic ticks based on scale
function drawRuler(divisions) {
    rulerTicks.innerHTML = ''; 
    
    for (let i = 0; i <= divisions; i++) {
        const tick = document.createElement('div');
        let tickHeight = '15%'; 
        
        if (divisions === 10) {
            // Decimal Machinist Scale (10ths)
            if (i % 10 === 0) tickHeight = '100%';
            else if (i % 5 === 0) tickHeight = '50%';
            else tickHeight = '25%';
        } else {
            // Standard Imperial Fractional Scales (16, 32, 64)
            const ratio = 64 / divisions;
            const normalizedTick = i * ratio; 
            
            if (normalizedTick === 0 || normalizedTick === 64) tickHeight = '100%';
            else if (normalizedTick % 32 === 0) tickHeight = '70%'; // 1/2 marks
            else if (normalizedTick % 16 === 0) tickHeight = '50%'; // 1/4 marks
            else if (normalizedTick % 8 === 0) tickHeight = '35%';  // 1/8 marks
            else if (normalizedTick % 4 === 0) tickHeight = '25%';  // 1/16 marks
            else if (normalizedTick % 2 === 0) tickHeight = '15%';  // 1/32 marks
            else tickHeight = '10%'; // 1/64 marks
        }

        tick.style.cssText = `position: absolute; bottom: 0; left: ${(i / divisions) * 100}%; width: 2px; height: ${tickHeight}; background-color: var(--text-main); transform: translateX(-50%);`;

        // Add text labels
        if (divisions === 10) {
            if (i > 0 && i < 10) {
                const label = document.createElement('span');
                label.textContent = `.${i}`;
                label.style.cssText = `position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 0.75rem; font-weight: 600; color: var(--text-muted);`;
                tick.appendChild(label);
            }
        } else {
            const eighthStep = divisions / 8;
            if (i % eighthStep === 0) {
                const label = document.createElement('span');
                label.textContent = i === 0 ? '0' : (i === divisions ? '1"' : `${i/eighthStep}/8`);
                label.style.cssText = `position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 0.75rem; font-weight: 600; color: var(--text-muted);`;
                tick.appendChild(label);
            }
        }
        rulerTicks.appendChild(tick);
    }
}

// Draw initial ruler
drawRuler(parseInt(rulerScaleSelect.value));

// Redraw when dropdown changes
rulerScaleSelect.addEventListener('change', (e) => {
    drawRuler(parseInt(e.target.value));
});

// Greatest Common Divisor for fraction reduction
function getGCD(a, b) { return b ? getGCD(b, a % b) : a; }

// Handle user input and place marker exactly
measureInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    let decimalValue = NaN;
    let exactFraction = "--";

    if (val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (den !== 0) {
                decimalValue = num / den;
                const divisor = getGCD(num, den);
                exactFraction = `${num/divisor}/${den/divisor}"`;
            }
        }
    } else {
        decimalValue = parseFloat(val);
        if (!isNaN(decimalValue)) {
            // Convert exact decimal to exact fraction
            const len = decimalValue.toString().split('.')[1] ? decimalValue.toString().split('.')[1].length : 0;
            const denominator = Math.pow(10, len);
            const numerator = decimalValue * denominator;
            const divisor = getGCD(numerator, denominator);
            if (denominator/divisor <= 1000) { // Keep fractions readable
                exactFraction = `${numerator/divisor}/${denominator/divisor}"`;
            } else {
                exactFraction = "N/A (Complex)";
            }
        }
    }

    if (!isNaN(decimalValue) && decimalValue >= 0 && decimalValue <= 1) {
        rulerMarker.style.display = 'block';
        rulerMarker.style.left = `${decimalValue * 100}%`; // Placed exactly
        markerLabel.textContent = `${decimalValue.toFixed(4)}"`;
        exactDecOut.textContent = `${decimalValue.toFixed(4)}"`;
        exactFracOut.textContent = exactFraction;
    } else {
        rulerMarker.style.display = 'none';
        exactDecOut.textContent = '--';
        exactFracOut.textContent = '--';
    }
});

// --- 9. SMART NAVIGATION SCROLL (WHEEL + DRAG) ---
function enableSmartScroll(containerSelector) {
    const slider = document.querySelector(containerSelector);
    if (!slider) return;

    // FEATURE 1: Mouse Wheel Translation (The PC Standard)
    // Translates standard up/down mouse wheel scrolling into left/right movement
    slider.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault(); // Stops the page from scrolling down
            slider.scrollLeft += e.deltaY; // Moves the bar left/right instead
        }
    }, { passive: false });

    // FEATURE 2: Bulletproof Click & Drag (Fallback)
    let isDown = false;
    let startX;
    let scrollLeft;

    // Kills the browser's native "ghost drag" instinct on the buttons
    slider.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('dragstart', (e) => e.preventDefault());
    });

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = '';
        slider.querySelectorAll('button').forEach(btn => btn.style.pointerEvents = 'auto');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = '';
        slider.querySelectorAll('button').forEach(btn => btn.style.pointerEvents = 'auto');
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); 
        
        // Temporarily turns off button clicking while moving so you don't accidentally switch tabs
        slider.querySelectorAll('button').forEach(btn => btn.style.pointerEvents = 'none');
        
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; 
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Boot up the logic for both navigation bars
enableSmartScroll('.tabs');
enableSmartScroll('.sub-tabs');

// Pascal's Law (Hydraulics)
document.getElementById('calcPascalBtn').addEventListener('click', () => {
    const fInput = document.getElementById('physForce');
    const pInput = document.getElementById('physPressure');
    const aInput = document.getElementById('physArea');

    const f = parseFloat(fInput.value);
    const p = parseFloat(pInput.value);
    const a = parseFloat(aInput.value);

    const count = [!isNaN(f), !isNaN(p), !isNaN(a)].filter(Boolean).length;
    
    if (count !== 2) {
        alert("Enter exactly 2 values to solve for the 3rd.");
        return;
    }

    if (isNaN(f)) fInput.value = (p * a).toFixed(2);
    else if (isNaN(p)) pInput.value = (f / a).toFixed(2);
    else if (isNaN(a)) aInput.value = (f / p).toFixed(4);
});

// Mechanical Work (Force x Distance)
document.getElementById('calcWorkBtn').addEventListener('click', () => {
    const fInput = document.getElementById('physWorkForce');
    const dInput = document.getElementById('physWorkDist');
    const wInput = document.getElementById('physWorkOut');

    const f = parseFloat(fInput.value);
    const d = parseFloat(dInput.value);
    const w = parseFloat(wInput.value);

    // Count how many boxes have numbers in them
    const count = [!isNaN(f), !isNaN(d), !isNaN(w)].filter(Boolean).length;
    
    if (count !== 2) {
        alert("Enter exactly 2 values to solve for the 3rd.");
        return;
    }

    // Solve for the empty box
    if (isNaN(f)) fInput.value = (w / d).toFixed(2);
    else if (isNaN(d)) dInput.value = (w / f).toFixed(2);
    else if (isNaN(w)) wInput.value = (f * d).toFixed(2);
});

// Helper to parse fractions (e.g., "1/3") into decimals for Hydraulics
function parseFractionInput(val) {
    if (!val) return NaN;
    if (val.includes('/')) {
        const parts = val.split('/');
        return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(val);
}

// Hydraulic Displacement (Area & Distance)
document.getElementById('calcDispBtn').addEventListener('click', () => {
    const a1Input = document.getElementById('physA1');
    const d1Input = document.getElementById('physD1');
    const a2Input = document.getElementById('physA2');
    const d2Input = document.getElementById('physD2');

    const a1 = parseFractionInput(a1Input.value);
    const d1 = parseFractionInput(d1Input.value);
    const a2 = parseFractionInput(a2Input.value);
    const d2 = parseFractionInput(d2Input.value);

    const count = [!isNaN(a1), !isNaN(d1), !isNaN(a2), !isNaN(d2)].filter(Boolean).length;

    if (count !== 3) {
        alert("Enter exactly 3 values to solve for the 4th.");
        return;
    }

    if (isNaN(a1)) a1Input.value = ((a2 * d2) / d1).toFixed(4);
    else if (isNaN(d1)) d1Input.value = ((a2 * d2) / a1).toFixed(4);
    else if (isNaN(a2)) a2Input.value = ((a1 * d1) / d2).toFixed(4);
    else if (isNaN(d2)) d2Input.value = ((a1 * d1) / a2).toFixed(4);
});


// Double-Acting Actuating Cylinder Logic
document.getElementById('calcCylBtn').addEventListener('click', () => {
    const p = parseFloat(document.getElementById('cylPress').value);
    const aPist = parseFloat(document.getElementById('cylPistArea').value);
    const aRod = parseFloat(document.getElementById('cylRodArea').value);

    // Validate inputs
    if (isNaN(p) || isNaN(aPist) || isNaN(aRod)) {
        alert("Please enter System Pressure, Piston Area, and Rod Area.");
        return;
    }

    if (aRod >= aPist) {
        alert("Error: The rod area must be smaller than the overall piston area.");
        return;
    }

    // Calculate forces
    const extForce = p * aPist;
    const retForce = p * (aPist - aRod);

    // Output formatted with commas for easy reading (e.g. 6,000)
    document.getElementById('cylExtOut').textContent = extForce.toLocaleString() + ' lbs';
    document.getElementById('cylRetOut').textContent = retForce.toLocaleString() + ' lbs';
});

// Mechanical Advantage
document.getElementById('calcIncBtn').addEventListener('click', () => {
    const f = parseFloat(document.getElementById('physIncForce').value);
    const l = parseFloat(document.getElementById('physIncLen').value);
    const w = parseFloat(document.getElementById('physIncWt').value);
    const h = parseFloat(document.getElementById('physIncHt').value);

    // Formula: F * L = W * H
    const count = [!isNaN(f), !isNaN(l), !isNaN(w), !isNaN(h)].filter(Boolean).length;
    
    if (count !== 3) {
        alert("Enter exactly 3 values to solve for the 4th.");
        return;
    }

    if (isNaN(f)) document.getElementById('physIncForce').value = ((w * h) / l).toFixed(2);
    else if (isNaN(l)) document.getElementById('physIncLen').value = ((w * h) / f).toFixed(2);
    else if (isNaN(w)) document.getElementById('physIncWt').value = ((f * l) / h).toFixed(2);
    else if (isNaN(h)) document.getElementById('physIncHt').value = ((f * l) / w).toFixed(2);
});

// --- 11. TEMPERATURE CONVERTER LOGIC ---
const tempF = document.getElementById('tempF');
const tempC = document.getElementById('tempC');
const tempK = document.getElementById('tempK');
const tempR = document.getElementById('tempR');

function updateTemps(source) {
    let f, c, k, r;
    
    // Convert source to Fahrenheit first to create a common base
    if (source === 'f') {
        f = parseFloat(tempF.value);
    } else if (source === 'c') {
        c = parseFloat(tempC.value);
        f = (c * 9/5) + 32;
    } else if (source === 'k') {
        k = parseFloat(tempK.value);
        f = (k - 273.15) * 9/5 + 32;
    } else if (source === 'r') {
        r = parseFloat(tempR.value);
        f = r - 459.67;
    }

    // Now calculate all others from F
    if (!isNaN(f)) {
        c = (f - 32) * 5/9;
        k = (f - 32) * 5/9 + 273.15;
        r = f + 459.67;

        if (source !== 'f') tempF.value = f.toFixed(1);
        if (source !== 'c') tempC.value = c.toFixed(1);
        if (source !== 'k') tempK.value = k.toFixed(1);
        if (source !== 'r') tempR.value = r.toFixed(1);
    } else {
        if (source !== 'f') tempF.value = '';
        if (source !== 'c') tempC.value = '';
        if (source !== 'k') tempK.value = '';
        if (source !== 'r') tempR.value = '';
    }
}

tempF.addEventListener('input', () => updateTemps('f'));
tempC.addEventListener('input', () => updateTemps('c'));
tempK.addEventListener('input', () => updateTemps('k'));
tempR.addEventListener('input', () => updateTemps('r'));

document.getElementById('clearTempBtn').addEventListener('click', () => {
    tempF.value = tempC.value = tempK.value = tempR.value = '';
});

// BMEP Calculator
document.getElementById('calcBmepBtn').addEventListener('click', () => {
    const hp = parseFloat(document.getElementById('bmepHp').value);
    const rpm = parseFloat(document.getElementById('bmepRpm').value);
    const disp = parseFloat(document.getElementById('bmepDisp').value);

    if (isNaN(hp) || isNaN(rpm) || isNaN(disp)) {
        alert("Please enter all three values.");
        return;
    }

    // BMEP formula: (HP * 792,000) / (RPM * Displacement)
    const bmep = (hp * 792000) / (rpm * disp);
    document.getElementById('bmepOut').textContent = bmep.toFixed(1);
});

// --- 13. LEGAL MODAL LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const legalModal = document.getElementById('legalModal');
    const openLegalBtn = document.getElementById('openLegalBtn');
    const closeLegalBtn = document.getElementById('closeLegalBtn');
    const agreeBtn = document.getElementById('agreeBtn');

    // 1. Check if the user has ALREADY accepted
    if (!localStorage.getItem('disclaimerAccepted')) {
        // If not, force the modal open immediately
        legalModal.style.display = 'block';
    }

    // 2. Open via Footer Button
    if (openLegalBtn) {
        openLegalBtn.addEventListener('click', () => {
            if (legalModal) legalModal.style.display = 'block';
        });
    }

    // 3. Close Button logic
    // We keep the "X" button for footer access, but only "Agree" sets the flag
    if (closeLegalBtn) {
        closeLegalBtn.addEventListener('click', () => {
            if (legalModal) legalModal.style.display = 'none';
        });
    }

    // 4. AGREE Button logic (The "Gatekeeper")
    if (agreeBtn) {
        agreeBtn.addEventListener('click', () => {
            // Set the flag so this logic doesn't trigger on next load
            localStorage.setItem('disclaimerAccepted', 'true');
            if (legalModal) legalModal.style.display = 'none';
            
            // Chain the Onboarding Tour to fire after the disclaimer is accepted
    if (!localStorage.getItem('hasSeenTour')) {
        setTimeout(startTour, 400); // The 400ms delay gives your disclaimer modal time to gracefully fade away before the tour begins!
    }
        });
    }

    // 5. Close if they click outside (but don't set the flag)
    window.addEventListener('click', (event) => {
        if (event.target === legalModal) {
            legalModal.style.display = 'none';
        }
    });
});

// --- CORE ENGINE LOGIC ---
function getCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

// Rebuilds the path in memory so the canvas can draw it or hit-test it
function traceElement(el) {
    ctx.beginPath();
    if (el.type === 'freehand' || el.type === 'eraser') {
        if (el.points.length === 0) return;
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for(let i=1; i<el.points.length; i++) ctx.lineTo(el.points[i].x, el.points[i].y);
    } else if (el.type === 'line') {
        ctx.moveTo(el.x1, el.y1); ctx.lineTo(el.x2, el.y2);
    } else if (el.type === 'square') {
        ctx.rect(el.x, el.y, el.w, el.h);
    } else if (el.type === 'circle') {
        ctx.arc(el.x, el.y, el.r, 0, Math.PI*2);
    }
}

// Wipes the screen and repaints the entire vault
function redraw() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    elements.forEach(el => {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width;
        ctx.lineCap = 'round';
        
        traceElement(el);
        ctx.stroke();
        
        // Draw a highlight ring if the object is selected
        if (el === selectedElement) {
            ctx.save();
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.stroke(); 
            ctx.restore();
        }
    });
}

// Scans the vault backwards (top layer first) to find what was clicked
function getElementAtPosition(x, y) {
    for (let i = elements.length - 1; i >= 0; i--) {
        let el = elements[i];
        traceElement(el); 
        
        // 1. Invisible padded hitbox: pretend the line is 20px thick for clicking
        ctx.lineWidth = Math.max(el.width, 20); 
        
        // 2. Did they click on or near the line?
        if (ctx.isPointInStroke(x, y)) return el;
        
        // 3. Did they click INSIDE a closed shape? (Square/Circle)
        if ((el.type === 'square' || el.type === 'circle') && ctx.isPointInPath(x, y)) {
            return el;
        }
    }
    return null;
}

// --- INTERACTION LOGIC ---
function startPosition(e) {
    e.preventDefault();
    const pos = getCoordinates(e);
    startX = pos.x;
    startY = pos.y;

    if (currentTool === 'move') {
        selectedElement = getElementAtPosition(pos.x, pos.y);
        if (selectedElement) isDragging = true;
        redraw();
        return;
    }

    isDrawing = true;
    selectedElement = null;

    if (currentTool === 'freehand' || currentTool === 'eraser') {
        elements.push({ type: currentTool, color: currentColor, width: currentWidth, points: [{x: pos.x, y: pos.y}] });
    } else {
        elements.push({ type: currentTool, color: currentColor, width: currentWidth, x: startX, y: startY, x1: startX, y1: startY, x2: startX, y2: startY, w: 0, h: 0, r: 0 });
    }
}

// ==============================
// 14.  GLOBAL DATA PERSISTENCE
// ==============================

function saveOmniVault() {
    const state = {
        inputs: {},
        outputs: {},
        dynamic: {
            // Arrays to hold rows that the user can physically add/remove
            cgRows: Array.from(document.querySelectorAll('.cg-row')).map(r => ({
                item: r.querySelector('input[type="text"]')?.value || '',
                w: r.querySelector('.cg-weight')?.value || '',
                a: r.querySelector('.cg-arm')?.value || ''
            })),
            remRows: Array.from(document.querySelectorAll('.rem-row')).map(r => ({
                w: r.querySelector('.rem-wt')?.value || '',
                a: r.querySelector('.rem-arm')?.value || ''
            })),
            addRows: Array.from(document.querySelectorAll('.add-row')).map(r => ({
                w: r.querySelector('.add-wt')?.value || '',
                a: r.querySelector('.add-arm')?.value || ''
            })),
            metalLayers: Array.from(document.querySelectorAll('.layer-input')).map(input => input.value)
        },
    };

    // 1. Grab all static text, number, and dropdown inputs automatically
    document.querySelectorAll('input[id], select[id]').forEach(el => {
        if (el.id !== 'refSearch') { // Ignore the search bar so it doesn't get stuck
            state.inputs[el.id] = el.value;
        }
    });

    // 2. Grab all computed mathematical outputs automatically
    document.querySelectorAll('.result-display [id]').forEach(el => {
        state.outputs[el.id] = el.textContent;
    });

    // Compress and save to the local hard drive
    localStorage.setItem('omniVault', JSON.stringify(state));
}

function loadOmniVault() {
    const saved = localStorage.getItem('omniVault');
    if (!saved) return;

    try {
        const state = JSON.parse(saved);

        // 1. Restore all Static Inputs
        if (state.inputs) {
            Object.keys(state.inputs).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = state.inputs[id];
            });
        }

        // 2. Restore all Computed Outputs
        if (state.outputs) {
            Object.keys(state.outputs).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = state.outputs[id];
            });
        }

        // 3. Restore Dynamic Rows (With X-Ray Hint & Delete Button Protection)
        if (state.dynamic) {
            
            if (state.dynamic.cgRows && state.dynamic.cgRows.length > 0) {
                const cgContainer = document.getElementById('cg-layers-container');
                cgContainer.innerHTML = ''; 
                state.dynamic.cgRows.forEach((rowData, idx) => {
                    let hint1 = idx === 0 ? `data-hint="Name of the station or item (e.g., 'Pilot')."` : "";
                    let hint2 = idx === 0 ? `data-hint="Weight of the item at this station."` : "";
                    let hint3 = idx === 0 ? `data-hint="The arm (distance from datum) for this station."` : "";
                    const removeBtn = idx > 0 ? `<button class="remove-row-btn" title="Remove">&times;</button>` : '';

                    const div = document.createElement('div');
                    div.className = 'cg-row';
                    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 10px;';
                    div.innerHTML = `
                        <div class="input-group" style="flex: 2; margin-bottom: 0;">
                            <input type="text" placeholder="Item" value="${rowData.item}" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); min-width: 0;" ${hint1}>
                        </div>
                        <div class="input-group" style="flex: 1.5; margin-bottom: 0;">
                            <input type="number" inputmode="decimal" class="cg-weight" placeholder="W" value="${rowData.w}" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); min-width: 0;" ${hint2}>
                        </div>
                        <div class="input-group" style="flex: 1.5; margin-bottom: 0;">
                            <input type="number" inputmode="decimal" class="cg-arm" placeholder="A" value="${rowData.a}" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); min-width: 0;" ${hint3}>
                        </div>
                        ${removeBtn}`;
                    cgContainer.appendChild(div);
                });
            }
            
            if (state.dynamic.remRows && state.dynamic.remRows.length > 0) {
                const remContainer = document.getElementById('rem-container');
                remContainer.querySelectorAll('.rem-row').forEach(e => e.remove());
                state.dynamic.remRows.forEach((rowData, idx) => {
                    let hint1 = idx === 0 ? `data-hint="Weight of the removed item."` : "";
                    let hint2 = idx === 0 ? `data-hint="Arm where it used to be."` : "";
                    const removeBtn = idx > 0 ? `<button class="remove-row-btn" title="Remove">&times;</button>` : '';

                    const div = document.createElement('div');
                    div.className = 'rem-row';
                    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
                    div.innerHTML = `
                        <div class="input-group" style="flex: 1; margin-bottom: 0;">
                            <input type="number" inputmode="decimal" class="rem-wt" placeholder="Wt" value="${rowData.w}" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" ${hint1}>
                        </div>
                        <div class="input-group" style="flex: 1; margin-bottom: 0;">
                            <input type="number" inputmode="decimal" class="rem-arm" placeholder="Arm" value="${rowData.a}" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" ${hint2}>
                        </div>
                        ${removeBtn}`;
                    remContainer.appendChild(div);
                });
            }

            if (state.dynamic.addRows && state.dynamic.addRows.length > 0) {
                const addContainer = document.getElementById('add-container');
                addContainer.querySelectorAll('.add-row').forEach(e => e.remove());
                state.dynamic.addRows.forEach((rowData, idx) => {
                    let hint1 = idx === 0 ? `data-hint="Weight of the new item."` : "";
                    let hint2 = idx === 0 ? `data-hint="Arm where it is installed."` : "";
                    const removeBtn = idx > 0 ? `<button class="remove-row-btn" title="Remove">&times;</button>` : '';

                    const div = document.createElement('div');
                    div.className = 'add-row';
                    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
                    div.innerHTML = `
                        <div class="input-group" style="flex: 1; margin-bottom: 0;">
                            <input type="number" inputmode="decimal" class="add-wt" placeholder="Wt" value="${rowData.w}" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" ${hint1}>
                        </div>
                        <div class="input-group" style="flex: 1; margin-bottom: 0;">
                            <input type="number" inputmode="decimal" class="add-arm" placeholder="Arm" value="${rowData.a}" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" ${hint2}>
                        </div>
                        ${removeBtn}`;
                    addContainer.appendChild(div);
                });
            }

            if (state.dynamic.metalLayers && state.dynamic.metalLayers.length > 0) {
                const layerContainer = document.getElementById('layers-container');
                layerContainer.innerHTML = '';
                state.dynamic.metalLayers.forEach((val, idx) => {
                    let hint = "";
                    if(idx === 0) hint = `data-hint="The thickness of the top piece of sheet metal (e.g., 0.032)."`;
                    if(idx === 1) hint = `data-hint="The thickness of the bottom piece of sheet metal (e.g., 0.040)."`;

                    // Protect Layers 1 and 2 (No delete button allowed)
                    if (idx < 2) {
                        const div = document.createElement('div');
                        div.className = 'input-group';
                        div.innerHTML = `<label>Layer ${idx + 1} Thickness</label><input type="number" inputmode="decimal" class="layer-input" step="0.001" value="${val}" ${hint}>`;
                        layerContainer.appendChild(div);
                    } else {
                        // Layers 3+ get the Flex layout with the Delete Button
                        const div = document.createElement('div');
                        div.className = 'layer-row';
                        div.style.cssText = 'display: flex; gap: 8px; align-items: flex-end; margin-bottom: 1.2rem;';
                        div.innerHTML = `
                            <div class="input-group" style="flex: 1; margin-bottom: 0;">
                                <label>Layer ${idx + 1} Thickness</label>
                                <input type="number" inputmode="decimal" class="layer-input" step="0.001" value="${val}">
                            </div>
                            <button class="remove-row-btn" title="Remove" style="height: 48px;">&times;</button>
                        `;
                        layerContainer.appendChild(div);
                    }
                });
            }
        }

        // 5. Trigger Visual Updates 
        const rulerInput = document.getElementById('measureInput');
        if (rulerInput && rulerInput.value) rulerInput.dispatchEvent(new Event('input'));
        
        const pctSelect = document.getElementById('pctType');
        if (pctSelect && pctSelect.value) pctSelect.dispatchEvent(new Event('change'));

    } catch (e) {
        console.error("Omni-Vault Error:", e);
    }
}



// 5. Auto-save when a user clicks any button
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.classList.contains('color-btn')) {
        setTimeout(saveOmniVault, 50);
    }
});

// 6. Auto-save when a user finishes drawing a shape
const canvasTracker = document.getElementById('drawingCanvas');
if (canvasTracker) {
    canvasTracker.addEventListener('mouseup', saveOmniVault);
    canvasTracker.addEventListener('touchend', saveOmniVault);
}


// =========================================================================
// 15. SMART CLIPBOARD ENGINE (V2)
// =========================================================================

let smartClipboard = localStorage.getItem('smartClipboard') || null;

// --- Part 1: The Catcher (Watches for new results) ---
const resultObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        const text = mutation.target.textContent;
        if (text.includes('--') || text.includes('Error') || text.includes('NaN')) return;
        
        const match = text.match(/-?[\d,]+(\.\d+)?/);
        if (match) {
            const cleanNumber = match[0].replace(/,/g, '');
            smartClipboard = cleanNumber;
            localStorage.setItem('smartClipboard', smartClipboard);
        }
    });
});

document.querySelectorAll('.result-display [id]').forEach(el => {
    resultObserver.observe(el, { childList: true, characterData: true, subtree: true });
});

// --- Part 2: The UI Injector ---
let activeInput = null;
let badgeHideTimer = null;
const pasteBadge = document.createElement('span');
pasteBadge.className = 'smart-paste-badge';

// BULLETPROOFING: Stop the browser from blurring the input when tapping the badge
const keepFocus = (e) => { e.preventDefault(); e.stopPropagation(); };
pasteBadge.addEventListener('mousedown', keepFocus);
pasteBadge.addEventListener('touchstart', keepFocus, { passive: false });

document.addEventListener('focusin', (e) => {
    // Broaden the net: Target ALL inputs except the Reference Search and 'Item' text columns
    if (e.target.tagName === 'INPUT' && 
        e.target.id !== 'refSearch' && 
        e.target.placeholder !== 'Item') {
        
        if (smartClipboard) {
            clearTimeout(badgeHideTimer); // Cancel any pending destruction
            activeInput = e.target;
            
            const group = activeInput.closest('.input-group');
            const label = group ? group.querySelector('label') : null;
            
            // Smart Injection Layout
            if (label) {
                pasteBadge.style.position = 'static';
                label.appendChild(pasteBadge);
            } else {
                // Fallback: Float the badge above inputs that have no labels
                activeInput.parentElement.style.position = 'relative';
                pasteBadge.style.position = 'absolute';
                pasteBadge.style.right = '0';
                pasteBadge.style.top = '-26px';
                activeInput.parentElement.appendChild(pasteBadge);
            }

            pasteBadge.textContent = `📋 Paste ${smartClipboard}`;
            pasteBadge.style.backgroundColor = 'var(--primary-color)';
            
            setTimeout(() => pasteBadge.style.opacity = '1', 10);
        }
    }
});

document.addEventListener('focusout', (e) => {
    if (e.target === activeInput) {
        // GRACE PERIOD: 350ms rides out the mobile keyboard stutter
        badgeHideTimer = setTimeout(() => {
            pasteBadge.style.opacity = '0';
            setTimeout(() => {
                if (pasteBadge.parentElement) pasteBadge.parentElement.removeChild(pasteBadge);
            }, 200);
        }, 350); 
    }
});

pasteBadge.addEventListener('pointerdown', (e) => {
    e.preventDefault(); 
    
    if (activeInput && smartClipboard) {
        // Special logic for Math Evaluator: Append instead of Overwrite
        if (activeInput.id === 'calcDisplay' && activeInput.value !== '') {
            activeInput.value += smartClipboard;
        } else {
            activeInput.value = smartClipboard;
        }
        
        // Trigger the Omni-Vault to save this newly pasted data
        activeInput.dispatchEvent(new Event('input', { bubbles: true })); 
        
        // Tactile Success Feedback
        triggerHaptic('success');
        pasteBadge.textContent = '✓ Pasted';
        pasteBadge.style.backgroundColor = 'var(--success-text)';
        activeInput.style.borderColor = 'var(--success-text)';
        
        setTimeout(() => {
            pasteBadge.style.opacity = '0';
            setTimeout(() => {
                if (pasteBadge.parentElement) pasteBadge.parentElement.removeChild(pasteBadge);
                activeInput.style.borderColor = '';
            }, 200);
        }, 800);
    }
});

// =========================================================================
// 16. FLEET REFERENCE ENGINE (MULTI-MANUAL)
// =========================================================================
let fleetRegistry = {};
let activeManualIndex = [];

// DOM Elements
const makeSelect = document.getElementById('aircraftMake');
const modelSelect = document.getElementById('aircraftModel');
const snSelect = document.getElementById('aircraftSN');
const searchInput = document.getElementById('manualSearch');
const resultsDiv = document.getElementById('manualResults');

// 1. Load the Master Registry on startup
fetch('fleet_registry.json')
    .then(res => res.json())
    .then(data => {
        fleetRegistry = data;
        // Populate the Make dropdown
        Object.keys(fleetRegistry).forEach(make => {
            const option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            makeSelect.appendChild(option);
        });
    })
    .catch(err => console.error("Fleet Registry failed to load:", err));

// 2. Handle Make Selection (Unlock Model dropdown)
makeSelect.addEventListener('change', (e) => {
    const selectedMake = e.target.value;
    
    // Reset lower fields
    modelSelect.innerHTML = '<option value="">2. Select Model</option>';
    snSelect.innerHTML = '<option value="">3. Select S/N Range</option>';
    modelSelect.disabled = true;
    snSelect.disabled = true;
    searchInput.disabled = true;
    searchInput.value = '';
    resultsDiv.innerHTML = '';
    activeManualIndex = [];

    if (selectedMake && fleetRegistry[selectedMake]) {
        // Populate Model dropdown for this Make
        Object.keys(fleetRegistry[selectedMake]).forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
        modelSelect.disabled = false;
    }
});

// 3. Handle Model Selection (Unlock S/N dropdown)
modelSelect.addEventListener('change', (e) => {
    const selectedMake = makeSelect.value;
    const selectedModel = e.target.value;
    
    // Reset lower fields
    snSelect.innerHTML = '<option value="">3. Select S/N Range</option>';
    snSelect.disabled = true;
    searchInput.disabled = true;
    searchInput.value = '';
    resultsDiv.innerHTML = '';
    activeManualIndex = [];

    if (selectedModel && fleetRegistry[selectedMake][selectedModel]) {
        // Populate S/N ranges
        fleetRegistry[selectedMake][selectedModel].forEach(snObj => {
            const option = document.createElement('option');
            option.value = snObj.file; 
            option.textContent = snObj.range;
            snSelect.appendChild(option);
        });
        snSelect.disabled = false;
    }
});

// --- Helper Function to Render the Cards ---
function renderManualResults(matches) {
    resultsDiv.innerHTML = ''; 

    if (!matches || matches.length === 0) {
        resultsDiv.innerHTML = '<p style="color: #ef4444; text-align: center;">No matches found in this manual.</p>';
        return;
    }

    matches.forEach(m => {
        const div = document.createElement('div');
        div.className = 'reference-card';
        div.innerHTML = `
            <div class="ref-title">${m.title}</div>
            <div class="ref-badges">
                <div class="ref-location">${m.location || 'Unknown Location'}</div>
                <div class="ref-pdf-page">PDF Pg. ${m.pdf_page}</div>
            </div>
        `;
        resultsDiv.appendChild(div);
    });
}

// 4. Handle S/N Selection (Load the manual map AND display all)
snSelect.addEventListener('change', (e) => {
    const targetFile = e.target.value;
    searchInput.disabled = true;
    searchInput.value = '';
    resultsDiv.innerHTML = '';
    
    if (targetFile) {
        resultsDiv.innerHTML = '<p style="color: var(--text-main); text-align: center;">Loading Manual Data...</p>';
        
        fetch(targetFile)
            .then(res => res.json())
            .then(data => {
                activeManualIndex = data;
                searchInput.disabled = false; 
                
                // UPGRADE: Immediately render the entire manual table of contents
                renderManualResults(activeManualIndex);
                
                if(typeof triggerHaptic === 'function') triggerHaptic('light'); 
            })
            .catch(err => {
                resultsDiv.innerHTML = '<p style="color: #ef4444; text-align: center;">Error loading specific manual.</p>';
                console.error(err);
            });
    }
});

// 5. The Search Execution (Live Filter)
searchInput.addEventListener('input', (e) => {
    const rawInput = e.target.value.trim();
    
    // UPGRADE: If the user clears the search bar, show the full manual again
    if (rawInput === '') {
        renderManualResults(activeManualIndex);
        return;
    }

    const queryWords = rawInput.toLowerCase().split(/\s+/); 

    // Smart Search: Check if EVERY word exists in either the title or the location
    const matches = activeManualIndex.filter(item => {
        let title = (item.title || "").toLowerCase();
        let loc = (item.location || "").toLowerCase();
        
        return queryWords.every(word => title.includes(word) || loc.includes(word));
    });

    renderManualResults(matches);
});

// =========================================================================
// 17. GLOBAL COMMAND PALETTE (SMART SEARCH)
// =========================================================================
const globalSearchBtn = document.getElementById('globalSearchBtn');
const globalSearchOverlay = document.getElementById('globalSearchOverlay');
const globalSearchInput = document.getElementById('globalSearchInput');
const globalSearchResults = document.getElementById('globalSearchResults');
const closeGlobalSearch = document.getElementById('closeGlobalSearch');

let searchIndex = [];

// 1. Dynamically scan the app and build a map of every tool
function buildSearchIndex() {
    searchIndex = [];
    document.querySelectorAll('.calc-card').forEach(card => {
        const tabId = card.id;
        const tabBtn = document.querySelector(`.tab-btn[data-target="${tabId}"]`);
        const tabName = tabBtn ? tabBtn.textContent : 'Unknown Tab';

        // Find every <h3> tag
        card.querySelectorAll('h3').forEach(h3 => {
            // STRIP OUT the X-Ray button text so it doesn't show up in search results
            const rawTitle = h3.textContent.replace('💡 Show Me How', '').replace('Hide Guide', '').trim();
            const toolBlock = h3.parentElement; 
            
            searchIndex.push({
                title: rawTitle,
                tabId: tabId,
                tabName: tabName,
                element: toolBlock
            });
        });
    });
}

// 2. Open Search Modal
globalSearchBtn.addEventListener('click', () => {
    buildSearchIndex(); 
    globalSearchOverlay.style.display = 'block';
    globalSearchInput.value = '';
    globalSearchResults.innerHTML = '';
    
    setTimeout(() => globalSearchInput.focus(), 100);
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
});

// 3. Close Search Modal
function closeSearch() {
    globalSearchOverlay.style.display = 'none';
}
closeGlobalSearch.addEventListener('click', closeSearch);
globalSearchOverlay.addEventListener('click', (e) => {
    if (e.target === globalSearchOverlay) closeSearch();
});

// 4. Live Filtering & Hierarchical Routing
globalSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    globalSearchResults.innerHTML = '';

    if (query.length < 2) return; 

    // Search both the tool title and the tab name
    const matches = searchIndex.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.tabName.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        globalSearchResults.innerHTML = '<div style="padding: 15px; color: var(--text-muted); text-align: center;">No tools found.</div>';
        return;
    }

    // 5. Group the results by Module/Tab
    const groupedResults = {};
    matches.forEach(match => {
        if (!groupedResults[match.tabName]) {
            groupedResults[match.tabName] = { tabId: match.tabId, tools: [] };
        }
        groupedResults[match.tabName].tools.push(match);
    });

    // 6. Build the Nested UI
    const regex = new RegExp(`(${query})`, 'gi');

    Object.keys(groupedResults).forEach(tabName => {
        const group = groupedResults[tabName];

        // A. Render the Parent Module Header
        const moduleHeader = document.createElement('div');
        moduleHeader.className = 'global-search-result';
        moduleHeader.style.cssText = 'background-color: rgba(0,0,0,0.2); font-weight: bold; color: var(--primary-color); border-bottom: 2px solid var(--border-color);';
        
        const highlightedTabName = tabName.replace(regex, '<span class="global-search-match">$1</span>');
        moduleHeader.innerHTML = `📁 ${highlightedTabName} Module`;

        // Click Action: Jump to Tab (Top of page)
        moduleHeader.addEventListener('click', () => {
            closeSearch();
            if (typeof triggerHaptic === 'function') triggerHaptic('medium');
            const targetTabBtn = document.querySelector(`.tab-btn[data-target="${group.tabId}"]`);
            if (targetTabBtn) {
                targetTabBtn.click();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        globalSearchResults.appendChild(moduleHeader);

        // B. Render the specific Tools nested beneath it
        group.tools.forEach(match => {
            const toolDiv = document.createElement('div');
            toolDiv.className = 'global-search-result';
            // Indent the tool slightly to visually nest it under the folder
            toolDiv.style.cssText = 'padding-left: 35px; border-bottom: 1px solid var(--border-color); font-size: 1.05rem;';
            
            const highlightedTitle = match.title.replace(regex, '<span class="global-search-match">$1</span>');
            toolDiv.innerHTML = `↳ ${highlightedTitle}`;

            // Click Action: Jump to Tab AND scroll directly to the Tool
            toolDiv.addEventListener('click', () => {
                closeSearch();
                if (typeof triggerHaptic === 'function') triggerHaptic('medium');

                const targetTabBtn = document.querySelector(`.tab-btn[data-target="${match.tabId}"]`);
                if (targetTabBtn) targetTabBtn.click();

                setTimeout(() => {
                    match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    match.element.classList.remove('search-highlight');
                    void match.element.offsetWidth; 
                    match.element.classList.add('search-highlight');
                }, 50); 
            });
            globalSearchResults.appendChild(toolDiv);
        });
    });
});

// =========================================================================
// 18. GUIDED SPOTLIGHT TOUR ENGINE
// =========================================================================

const tourSteps = [
    {
        target: '#startTourBtn',
        title: 'Tutorial',
        text: 'Tap this question mark anytime you might need a quick walkthrough of the app\'s features and tools.'
    },
    {
        target: '#globalSearchBtn',
        title: 'Global Search',
        text: 'Tap this magnifying glass to instantly search and jump to any tool, formula, or calculator across the entire app.'
    },
    {
        target: '#themeToggleBtn',
        title: 'Night Mode',
        text: 'Toggle dark mode to reduce screen glare'
    },
    {
        target: '#notesTab',
        title: 'Hangar Notes',
        text: 'Tap or swipe this left drawer open anytime to jot down clearances, torques, or part numbers.'
    },
    {
        target: '#drawerTab',
        title: 'Quick Tools',
        text: 'Tap or swipe this right drawer open for a calculator and instant temperature, torque, and measurement conversions without leaving your current tool.'
    },
    {
        target: '.tabs .tab-btn:nth-child(1)', 
        title: 'Manual Search',
        text: 'Access the Fleet Reference Engine. Select your aircraft make, model, and serial number to instantly load and search its specific maintenance manuals.',
        action: () => {
            const btn = document.querySelector('.tabs .tab-btn:nth-child(1)');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
    {
        target: '.tab-btn[data-target="module-cfr"]', 
        title: '14 CFR Index',
        text: 'Search the complete 14 CFR database for regulations and compliance information.',
        action: () => {
            const btn = document.querySelector('.tab-btn[data-target="module-wb"]');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
    {
        target: '.tab-btn[data-target="module-wb"]', 
        title: 'Weight & Balance',
        text: 'Calculate total aircraft CG, ballast shifts, and complex equipment alterations.',
        action: () => {
            const btn = document.querySelector('.tab-btn[data-target="module-wb"]');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
    {
        target: '.tab-btn[data-target="module-metal"]', 
        title: 'Sheet Metal',
        text: 'Automated rivet layout. Instant pitch calculators, sightline formulas, bend allowances, and stack thickness tools.',
        action: () => {
            const btn = document.querySelector('.tab-btn[data-target="module-metal"]');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
    {
        target: '.tab-btn[data-target="module-elec"]', 
        title: 'Electricity',
        text: 'Decode up to 6-band resistors instantly, calculate AC reactance/impedance, and size AWG wires perfectly to AC 43.13-1B standards.',
        action: () => {
            const btn = document.querySelector('.tab-btn[data-target="module-elec"]');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
    {
        target: '.tab-btn[data-target="module-math"]', 
        title: 'General Math',
        text: 'Quickly solve percentage problems and calculate proportions/ratios.',
        action: () => {
            const btn = document.querySelector('.tab-btn[data-target="module-math"]');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
    {
        target: '.tab-btn[data-target="module-physics"]', 
        title: 'Physics',
        text: 'Hydraulics (Pascal\'s Law), BMEP, Mechanical Advantage, mechanical work, and cylinder displacement.',
        action: () => {
            const btn = document.querySelector('.tab-btn[data-target="module-physics"]');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
    {
        target: '.tab-btn[data-target="module-temp"]', 
        title: 'Temperature',
        text: 'Instantly cross-convert Fahrenheit, Celsius, Kelvin, and Rankine scales simultaneously.',
        action: () => {
            const btn = document.querySelector('.tab-btn[data-target="module-temp"]');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
    {
        target: '.tab-btn[data-target="module-measure"]', 
        title: 'Measurement',
        text: 'Instantly locate decimal measurements on a scale. Convert exact decimal measurements to their nearest standard fraction in real-time.',
        action: () => {
            const btn = document.querySelector('.tab-btn[data-target="module-measure"]');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
    {
        target: '.tab-btn[data-target="module-ref"]', 
        title: 'Charts & Formulas',
        text: 'Your digital pocket reference. Quickly look up AC 43.13 charts, wiring limits, and mathematical formulas without leaving the app.',
        action: () => {
            const btn = document.querySelector('.tab-btn[data-target="module-ref"]');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    },
   {
        target: '.tabs', 
        title: 'Auto-Save & Offline',
        text: `
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 5px;">
                <div style="display: flex; gap: 10px; align-items: start;">
                    <span style="font-size: 1.2rem; line-height: 1;">💾</span>
                    <div style="line-height: 1.3;"><strong>Auto-Save:</strong> Automatically saves the state of your tools.</div>
                </div>
                <div style="display: flex; gap: 10px; align-items: start;">
                    <span style="font-size: 1.2rem; line-height: 1;">📋</span>
                    <div style="line-height: 1.3;"><strong>Smart Clipboard:</strong> Detect last calculation and allow 1-tap paste into any field.</div>
                </div>
                <div style="display: flex; gap: 10px; align-items: start;">
                    <span style="font-size: 1.2rem; line-height: 1;">⛓️‍💥</span>
                    <div style="line-height: 1.3;"><strong>100% Offline:</strong> No internet connection or cellular service required after initial setup.</div>
                </div>
                <div style="display: flex; gap: 10px; align-items: start;">
                    <span style="font-size: 1.2rem; line-height: 1;">🔒</span>
                    <div style="line-height: 1.3;"><strong>Privacy First:</strong> Data is stored locally and never leaves your device.</div>
                </div>
            </div>
        `,
        action: () => {
            const btn = document.querySelector('.tabs .tab-btn:nth-child(1)');
            if (btn) { btn.click(); btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        }
    }
];

let currentTourStep = 0;
const tourShield = document.getElementById('tourShield');
const tourSpotlight = document.getElementById('tourSpotlight');
const tourTooltip = document.getElementById('tourTooltip');
const tourTitle = document.getElementById('tourTitle');
const tourText = document.getElementById('tourText');
const tourStepCounter = document.getElementById('tourStepCounter');
const tourNextBtn = document.getElementById('tourNextBtn');
const tourPrevBtn = document.getElementById('tourPrevBtn');
const tourSkipBtn = document.getElementById('tourSkipBtn');
const startTourBtn = document.getElementById('startTourBtn');

function positionTourElement() {
    const step = tourSteps[currentTourStep];
    const targetEl = document.querySelector(step.target);
    
    if (!targetEl) {
        tourNextBtn.click(); 
        return;
    }

    // 1. Temporarily hide ONLY the tooltip. Leave the spotlight alone so the screen stays dark!
    tourTooltip.style.opacity = '0';
    tourTooltip.style.transform = 'translateY(10px)';

    // 2. Trigger the tab switch and the smooth scroll animation
    if (step.action) step.action();

    // 3. WAIT 350 milliseconds for the scroll animation to fully stop before moving the light
    setTimeout(() => {
        const rect = targetEl.getBoundingClientRect();
        const padding = 6;

        // Move the Spotlight to the exact new coordinates
        tourSpotlight.style.top = `${rect.top + window.scrollY - padding}px`;
        tourSpotlight.style.left = `${rect.left + window.scrollX - padding}px`;
        tourSpotlight.style.width = `${rect.width + (padding * 2)}px`;
        tourSpotlight.style.height = `${rect.height + (padding * 2)}px`;

        // Populate Tooltip Data
        tourTitle.textContent = step.title;
        tourText.innerHTML = step.text;
        tourStepCounter.textContent = `${currentTourStep + 1} / ${tourSteps.length}`;

        // Calculate Tooltip Position
        let tooltipTop = rect.bottom + window.scrollY + 15;
        let tooltipLeft = rect.left + window.scrollX - (280 / 2) + (rect.width / 2);

        // Bounce off edges so it never bleeds off the phone screen
        if (tooltipLeft < 10) tooltipLeft = 10;
        if (tooltipLeft + 280 > window.innerWidth - 10) tooltipLeft = window.innerWidth - 290;
        if (tooltipTop + 150 > window.innerHeight + window.scrollY) tooltipTop = rect.top + window.scrollY - 160;

        tourTooltip.style.top = `${tooltipTop}px`;
        tourTooltip.style.left = `${tooltipLeft}px`;
        
        // 4. Fade the Tooltip smoothly back into view
        tourTooltip.style.opacity = '1';
        tourTooltip.style.transform = 'translateY(0)';

        // Button Logic
        tourPrevBtn.style.display = currentTourStep === 0 ? 'none' : 'block';
        tourNextBtn.textContent = currentTourStep === tourSteps.length - 1 ? 'Finish' : 'Next';
        
    }, 350); 
}

function startTour() {
    currentTourStep = 0;
    tourShield.style.display = 'block';
    tourSpotlight.style.display = 'block';
    tourTooltip.style.display = 'block';
    tourTooltip.style.opacity = '0';
    tourTooltip.style.transform = 'translateY(10px)';
    
    if (typeof triggerHaptic === 'function') triggerHaptic('medium');
    
    // Give the UI a microsecond to render before measuring coordinates
    setTimeout(positionTourElement, 50);
}

function endTour() {
    tourShield.style.display = 'none';
    tourSpotlight.style.display = 'none';
    tourTooltip.style.opacity = '0';
    setTimeout(() => tourTooltip.style.display = 'none', 400);
    
    // Save to Omni-Vault so it never auto-runs again
    localStorage.setItem('hasSeenTour', 'true');
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
}

tourNextBtn.addEventListener('click', () => {
    if (currentTourStep < tourSteps.length - 1) {
        currentTourStep++;
        positionTourElement();
        if (typeof triggerHaptic === 'function') triggerHaptic('light');
    } else {
        endTour();
    }
});

tourPrevBtn.addEventListener('click', () => {
    if (currentTourStep > 0) {
        currentTourStep--;
        positionTourElement();
        if (typeof triggerHaptic === 'function') triggerHaptic('light');
    }
});

tourSkipBtn.addEventListener('click', endTour);
if (startTourBtn) startTourBtn.addEventListener('click', startTour);



// =========================================================================
// 20. 14 CFR EXPLORER (INDEXED-DB ENGINE)
// =========================================================================

const DB_NAME = "AviationProDB";
const STORE_NAME = "cfr_library";
let cfrDb;

const cfrSearchInput = document.getElementById('cfrSearchInput');
const cfrResultsContainer = document.getElementById('cfrResultsContainer');
const cfrFilterBtns = document.querySelectorAll('.cfr-filter-btn');
const cfrStatusText = document.getElementById('cfrStatusText');
const cfrSyncBtn = document.getElementById('cfrSyncBtn');

// 1. Initialize the IndexedDB
function initCfrDatabase() {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create the object store if it doesn't exist. We use an auto-incrementing ID for speed.
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            store.createIndex("part", "part", { unique: false }); // Index by Part for fast filtering
        }
    };

    request.onsuccess = (event) => {
        cfrDb = event.target.result;
        checkDbStatus();
    };

    request.onerror = (event) => {
        console.error("IndexedDB Error:", event.target.error);
        cfrStatusText.textContent = "Error accessing offline storage.";
        cfrStatusText.style.color = "#ef4444";
    };
}

// 2. Check if we have data, or if we need to download it
function checkDbStatus() {
    const transaction = cfrDb.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();

    countRequest.onsuccess = () => {
        const statusBlock = document.getElementById('cfrDbStatus');
        
        if (countRequest.result > 0) {
            // A. Repaint the status bar green
            cfrStatusText.textContent = `Library Ready (${countRequest.result} Regulations Offline)`;
            cfrStatusText.style.color = "var(--success-text)";
            statusBlock.style.borderColor = "var(--success-text)";
            statusBlock.style.background = "rgba(34, 197, 94, 0.1)";
            cfrSearchInput.disabled = false;
            
            // B. Re-enable the update button action
            cfrSyncBtn.style.display = "block";
            cfrSyncBtn.textContent = "Update Library";
            cfrSyncBtn.style.background = "transparent";
            cfrSyncBtn.style.color = "var(--success-text)";
            cfrSyncBtn.style.border = "1px solid var(--success-text)";
            
            
            // Pre-load the first few results visually
            searchCFR('');

            // C. NEW: Auto-dismiss the green box after 3 seconds
            setTimeout(() => {
                statusBlock.style.opacity = "0";
                statusBlock.style.maxHeight = "0px";
                statusBlock.style.padding = "0px";
                statusBlock.style.marginBottom = "0px";
                statusBlock.style.border = "none";
            }, 3000);

        } else {
            // Reset visibility if the database is completely empty
            statusBlock.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(14, 165, 233, 0.1); border: 1px solid var(--accent-color); padding: 10px; border-radius: var(--radius-sm); margin-bottom: 15px; transition: all 0.4s ease; max-height: 100px; opacity: 1; overflow: hidden;";
            cfrStatusText.textContent = "Offline library missing. (Requires Wi-Fi)";
            cfrStatusText.style.color = "var(--accent-color)";
            
            cfrSyncBtn.style.display = "block";
            cfrSyncBtn.textContent = "Download Library";
            cfrSyncBtn.style.background = "var(--accent-color)";
            cfrSyncBtn.style.color = "white";
            cfrSyncBtn.style.border = "none";
        }
    };
}

// 3. The Fetch & Inject Engine
cfrSyncBtn.addEventListener('click', async () => {
    cfrSyncBtn.style.display = "none";
    cfrStatusText.textContent = "Downloading CFR database... Do not close app.";
    cfrStatusText.style.color = "var(--text-main)";
    cfrStatusText.parentElement.style.borderColor = "var(--border-color)";
    cfrStatusText.parentElement.style.background = "var(--bg-color)";
    
    try {
        const response = await fetch('cfr_data.json');
        if (!response.ok) throw new Error("File not found");
        
        const data = await response.json();
        
        cfrStatusText.textContent = "Installing to offline vault... Please wait.";
        
        const transaction = cfrDb.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        
        // WIPE the old database completely before injecting the new one
        store.clear();
        
        // Loop through the massive JSON and inject it into IndexedDB
        data.forEach(item => store.put(item));

        transaction.oncomplete = () => {
            if (typeof triggerHaptic === 'function') triggerHaptic('success');
            checkDbStatus();
        };

        transaction.onerror = (e) => {
            throw new Error(e.target.error);
        };

    } catch (err) {
        console.error(err);
        cfrStatusText.textContent = "Download failed. Check connection.";
        cfrStatusText.style.color = "#ef4444";
        cfrSyncBtn.style.display = "block";
        cfrSyncBtn.textContent = "Retry";
    }
});

// --- 4. HIERARCHICAL ROUTING ENGINE (DRILL-DOWN) ---
const cfrNavHeader = document.getElementById('cfrNavHeader');
const cfrBackBtn = document.getElementById('cfrBackBtn');
const cfrCurrentFolder = document.getElementById('cfrCurrentFolder');

const partMetadata = {
    "1": { title: "Definitions and Abbreviations", desc: "General definitions and abbreviations used throughout Title 14." },
    "21": { title: "Certification Procedures for Products and Articles", desc: "Rules for issuing type certificates, production certificates, and airworthiness certificates." },
    "23": { title: "Airworthiness Standards: Normal Category Airplanes", desc: "Design and airworthiness standards for normal, utility, acrobatic, and commuter category airplanes." },
    "25": { title: "Airworthiness Standards: Transport Category Airplanes", desc: "Design and airworthiness standards for large, multi-engine transport airplanes." },
    "27": { title: "Airworthiness Standards: Normal Category Rotorcraft", desc: "Standards for normal category helicopters." },
    "29": { title: "Airworthiness Standards: Transport Category Rotorcraft", desc: "Standards for large, multi-engine transport helicopters." },
    "33": { title: "Airworthiness Standards: Aircraft Engines", desc: "Design and testing standards for aircraft engines." },
    "35": { title: "Airworthiness Standards: Propellers", desc: "Design and testing standards for aircraft propellers." },
    "39": { title: "Airworthiness Directives", desc: "Legally enforceable rules issued by the FAA to correct an unsafe condition in a product." },
    "43": { title: "Maintenance, Preventive Maintenance, Rebuilding, and Alteration", desc: "The core rulebook for A&P mechanics. Dictates who can perform maintenance and the standards it must meet." },
    "45": { title: "Identification and Registration Marking", desc: "Rules for painting N-numbers and attaching data plates to aircraft and components." },
    "47": { title: "Aircraft Registration", desc: "Requirements for registering aircraft with the FAA." },
    "61": { title: "Certification: Pilots, Flight Instructors, and Ground Instructors", desc: "Rules for pilot certification and ratings." },
    "65": { title: "Certification: Airmen Other Than Flight Crewmembers", desc: "Certification rules for Mechanics (A&P) and Repairmen. Defines eligibility, privileges, and limitations." },
    "91": { title: "General Operating and Flight Rules", desc: "The primary flight rules for all aircraft operating in the US. Includes maintenance required to keep the aircraft airworthy." },
    "119": { title: "Certification: Air Carriers and Commercial Operators", desc: "General certification requirements for airlines and charter operations." },
    "121": { title: "Operating Requirements: Domestic, Flag, and Supplemental Operations", desc: "The strict rules governing major scheduled airlines." },
    "125": { title: "Certification & Operations: Large Airplanes", desc: "Rules for large aircraft not operating under Part 121 or 135." },
    "135": { title: "Operating Requirements: Commuter and On Demand", desc: "Rules for charter flights, air taxis, and some commuter operations." },
    "145": { title: "Repair Stations", desc: "Rules for obtaining and maintaining an FAA Part 145 Certified Repair Station certificate." },
    "147": { title: "Aviation Maintenance Technician Schools", desc: "Rules governing A&P schools, including curriculum and facility requirements." }
};

let currentCfrView = 'home'; 
let activeCfrPart = null;

// Level 1: The "Folder" View
function renderCfrHome() {
    currentCfrView = 'home';
    activeCfrPart = null;
    if (cfrNavHeader) cfrNavHeader.style.display = 'none';
    cfrResultsContainer.innerHTML = '';

    Object.keys(partMetadata).forEach(partNum => {
        const meta = partMetadata[partNum];
        const div = document.createElement('div');
        div.style.cssText = 'background: var(--card-bg); border: 1px solid var(--border-color); padding: 15px; border-radius: var(--radius-sm); margin-bottom: 10px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border-left: 4px solid var(--primary-color);';
        
        div.onmouseover = () => { div.style.transform = 'translateY(-2px)'; div.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)'; };
        div.onmouseout = () => { div.style.transform = 'translateY(0)'; div.style.boxShadow = 'none'; };

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: bold; color: var(--primary-color); font-size: 1.2rem;">Part ${partNum}</span>
                <span style="font-size: 1.4rem; opacity: 0.8;">📂</span>
            </div>
            <h4 style="color: var(--text-main); margin-bottom: 5px; font-size: 1rem;">${meta.title}</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin: 0;">${meta.desc}</p>
        `;
        
        div.addEventListener('click', () => {
            if (typeof triggerHaptic === 'function') triggerHaptic('light');
            cfrSearchInput.value = ''; // Clear search bar before drilling down
            renderCfrPart(partNum);
        });
        
        cfrResultsContainer.appendChild(div);
    });
}

// Level 2: The "File" View
function renderCfrPart(partNum) {
    currentCfrView = 'part';
    activeCfrPart = partNum;
    
    if (cfrNavHeader) {
        cfrNavHeader.style.display = 'flex';
        cfrCurrentFolder.textContent = `📁 Part ${partNum}`;
    }
    
    cfrResultsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px;">Loading sections...</p>';

    const transaction = cfrDb.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll(); 

    request.onsuccess = () => {
        cfrResultsContainer.innerHTML = '';
        const allData = request.result;
        
        const matches = allData.filter(item => item.part === partNum);

        matches.sort((a, b) => {
            const numA = parseFloat(a.section) || 0;
            const numB = parseFloat(b.section) || 0;
            return numA - numB;
        });

        if (matches.length === 0) {
            cfrResultsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px;">No sections found. Please update library.</p>';
            return;
        }

        matches.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = 'background: var(--card-bg); border: 1px solid var(--border-color); padding: 12px 15px; border-radius: var(--radius-sm); margin-bottom: 8px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;';
            
            div.onmouseover = () => { div.style.transform = 'translateX(4px)'; div.style.borderColor = 'var(--accent-color)'; };
            div.onmouseout = () => { div.style.transform = 'translateX(0)'; div.style.borderColor = 'var(--border-color)'; };

            const snippet = item.text.length > 90 ? item.text.substring(0, 90) + '...' : item.text;

            div.innerHTML = `
                <div style="display: flex; align-items: baseline; gap: 12px;">
                    <span style="font-weight: bold; color: var(--accent-color); font-size: 1.05rem; white-space: nowrap; min-width: 65px;">§ ${item.section}</span>
                    <div style="flex-grow: 1;">
                        <h4 style="color: var(--text-main); margin: 0 0 3px 0; font-size: 0.95rem;">${item.title}</h4>
                        <p style="color: var(--text-muted); font-size: 0.8rem; line-height: 1.3; margin: 0;">${snippet}</p>
                    </div>
                </div>
            `;
            
            div.addEventListener('click', () => openCfrModal(item));
            cfrResultsContainer.appendChild(div);
        });
    };
}

// Active Search: Bypasses hierarchy with Ctrl+F Highlighting
function searchCFR(query) {
    if (!cfrDb) return;
    const q = query.toLowerCase().trim();
    
    if (q === '') {
        if (currentCfrView === 'part' && activeCfrPart) renderCfrPart(activeCfrPart);
        else renderCfrHome();
        return;
    }

    if (cfrNavHeader) {
        cfrNavHeader.style.display = 'flex';
        cfrCurrentFolder.textContent = `🔍 Search Results`;
    }
    
    cfrResultsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px;">Searching...</p>';

    const transaction = cfrDb.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll(); 

    request.onsuccess = () => {
        const allData = request.result;
        
        const matches = allData.filter(item => {
            return String(item.section || '').toLowerCase().includes(q) || 
                   String(item.title || '').toLowerCase().includes(q) || 
                   String(item.text || '').toLowerCase().includes(q) ||
                   (`part ${item.part}` === q); 
        });

        cfrResultsContainer.innerHTML = '';

        if (matches.length === 0) {
            cfrResultsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px;">No regulations found.</p>';
            return;
        }

        // HIGHLIGHT HELPER FUNCTION (Bulletproofed with String casting)
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const highlightRegex = new RegExp(`(${escapeRegExp(query.trim())})`, 'gi');
        const highlightMatch = (text) => String(text || '').replace(highlightRegex, '<span style="background: var(--accent-color); color: white; padding: 0 3px; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">$1</span>');

        const renderLimit = Math.min(matches.length, 50);
        for (let i = 0; i < renderLimit; i++) {
            const item = matches[i];
            const div = document.createElement('div');
            div.style.cssText = 'background: var(--card-bg); border: 1px solid var(--border-color); padding: 15px; border-radius: var(--radius-sm); margin-bottom: 10px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;';
            
            div.onmouseover = () => { div.style.transform = 'translateY(-2px)'; div.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)'; };
            div.onmouseout = () => { div.style.transform = 'translateY(0)'; div.style.boxShadow = 'none'; };

            // SMART SNIPPET: Safely handles numbers and missing text
            let rawSnippet = "";
            const textStr = String(item.text || '');
            const textMatchIndex = textStr.toLowerCase().indexOf(q);
            
            if (textMatchIndex > -1) {
                const start = Math.max(0, textMatchIndex - 40);
                const end = Math.min(textStr.length, textMatchIndex + query.length + 80);
                rawSnippet = (start > 0 ? '...' : '') + textStr.substring(start, end) + (end < textStr.length ? '...' : '');
            } else {
                rawSnippet = textStr.length > 120 ? textStr.substring(0, 120) + '...' : textStr;
            }

            // APPLY HIGHLIGHTS
            const highlightedSection = highlightMatch(item.section);
            const highlightedTitle = highlightMatch(item.title);
            const highlightedSnippet = highlightMatch(rawSnippet);

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: bold; color: var(--primary-color); font-size: 1.1rem;">§ ${highlightedSection}</span>
                    <span style="font-size: 0.75rem; background: rgba(14, 165, 233, 0.1); color: var(--accent-color); padding: 3px 8px; border-radius: 12px; font-weight: bold;">Part ${item.part}</span>
                </div>
                <h4 style="color: var(--text-main); margin-bottom: 8px; font-size: 0.95rem;">${highlightedTitle}</h4>
                <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.5; margin: 0;">${highlightedSnippet}</p>
            `;
            
            div.addEventListener('click', () => openCfrModal(item, query));
            cfrResultsContainer.appendChild(div);
        }
    };
}

// --- 5. CFR MODAL DETAIL ENGINE & LEGAL FORMATTER ---
const cfrDetailModal = document.getElementById('cfrDetailModal');
const cfrDetailBadge = document.getElementById('cfrDetailBadge');
const cfrDetailSection = document.getElementById('cfrDetailSection');
const cfrDetailTitle = document.getElementById('cfrDetailTitle');
const cfrDetailText = document.getElementById('cfrDetailText');
const closeCfrModalBtn = document.getElementById('closeCfrModalBtn');

function openCfrModal(item, highlightQuery = '') {
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
    
    cfrDetailBadge.textContent = `Part ${item.part}`;
    cfrDetailSection.textContent = `§ ${item.section}`;
    cfrDetailTitle.textContent = item.title;
    
    const textStr = String(item.text || '');
    const paragraphs = textStr.split('\n\n');
    let formattedHtml = '';
    
    paragraphs.forEach(p => {
        let styledP = p.replace(/^(\([a-zA-Z0-9]{1,3}\))\s*/, '<strong style="color: var(--accent-color); font-size: 1.1rem; margin-right: 6px;">$1</strong>');
        
        if (highlightQuery && highlightQuery.trim() !== '') {
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const highlightRegex = new RegExp(`(${escapeRegExp(highlightQuery.trim())})`, 'gi');
            styledP = styledP.replace(highlightRegex, '<span style="background: var(--accent-color); color: white; padding: 0 3px; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">$1</span>');
        }

        formattedHtml += `<p style="margin-bottom: 16px; padding-left: 28px; text-indent: -28px;">${styledP}</p>`;
    });

    cfrDetailText.innerHTML = formattedHtml;
    
    cfrDetailModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
}

if (closeCfrModalBtn) {
    closeCfrModalBtn.addEventListener('click', () => {
        if (typeof triggerHaptic === 'function') triggerHaptic('light');
        cfrDetailModal.style.display = 'none';
        document.body.style.overflow = ''; 
    });
}

window.addEventListener('click', (e) => {
    if (e.target === cfrDetailModal) {
        cfrDetailModal.style.display = 'none';
        document.body.style.overflow = '';
    }
});

// --- 6. NAVIGATION LISTENERS ---

if (cfrBackBtn) {
    cfrBackBtn.addEventListener('click', () => {
        if (typeof triggerHaptic === 'function') triggerHaptic('light');
        if (cfrSearchInput) cfrSearchInput.value = ''; 
        renderCfrHome(); 
    });
}

// Re-wired the search bar listener to guarantee it fires
if (cfrSearchInput) {
    cfrSearchInput.addEventListener('input', (e) => searchCFR(e.target.value));
}

// Boot the database when the script loads
initCfrDatabase();

// --- BOOT & EVENT TRIGGERS ---

// 1. Unpack the vault immediately when the app opens
loadOmniVault();

// 2. Build the X-Ray Tutorial Engine (Safe execution)
if (typeof initializeXRayEngine === 'function') {
    initializeXRayEngine();
}

// 3. Ignite the UI (Fixes the blank screen on boot!)
const activeTabOnBoot = document.querySelector('.tab-btn.active');
if (activeTabOnBoot) activeTabOnBoot.click();

// 4. Auto-save every time a user types a number or changes a dropdown
document.addEventListener('input', (e) => {
    if (e.target.id !== 'refSearch') saveOmniVault();
});

// 5. Auto-save when a user clicks any button
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        setTimeout(saveOmniVault, 50);
    }
});

// 6. Paint the Resistor tool on boot
setTimeout(calculateResistor, 100);

