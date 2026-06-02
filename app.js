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


// --- 2. WEIGHT & BALANCE MODULE ---
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

document.getElementById('clearWbBtn').addEventListener('click', () => {
    document.getElementById('wbWeight').value = '';
    document.getElementById('wbArm').value = '';
    document.getElementById('wbMoment').value = '';
    document.getElementById('wbResult').textContent = '--';
});

document.getElementById('addCgRowBtn').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'cg-row';
    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 10px;';
    div.innerHTML = `<input type="text" placeholder="Item" style="flex: 2; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);"><input type="number" class="cg-weight" placeholder="W" style="flex: 1.5; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);"><input type="number" class="cg-arm" placeholder="A" style="flex: 1.5; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">`;
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

document.getElementById('calcBallastBtn').addEventListener('click', () => {
    const w = parseFloat(document.getElementById('balWeight').value);
    const curCg = parseFloat(document.getElementById('balCurrentCg').value);
    const tgtCg = parseFloat(document.getElementById('balTargetCg').value);
    const arm = parseFloat(document.getElementById('balArm').value);
    if (isNaN(w) || isNaN(curCg) || isNaN(tgtCg) || isNaN(arm)) return;
    const bw = (w * (tgtCg - curCg)) / (arm - tgtCg);
    document.getElementById('balResult').textContent = `${bw.toFixed(2)} lbs`;
});

document.getElementById('addRemBtn').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'rem-row';
    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
    div.innerHTML = `<input type="number" class="rem-wt" placeholder="Wt" style="flex: 1; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);"><input type="number" class="rem-arm" placeholder="Arm" style="flex: 1; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">`;
    document.getElementById('rem-container').appendChild(div);
});

document.getElementById('addAddBtn').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'add-row';
    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
    div.innerHTML = `<input type="number" class="add-wt" placeholder="Wt" style="flex: 1; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);"><input type="number" class="add-arm" placeholder="Arm" style="flex: 1; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">`;
    document.getElementById('add-container').appendChild(div);
});

document.getElementById('calcAltBtn').addEventListener('click', () => {
    const oldW = parseFloat(document.getElementById('altOldWt').value);
    const oldCg = parseFloat(document.getElementById('altOldCg').value);
    if (isNaN(oldW) || isNaN(oldCg)) { alert("Enter Original Wt & CG"); return; }
    
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

document.getElementById('clearAltBtn').addEventListener('click', () => location.reload());


// --- 3. SHEET METAL MODULE ---
document.getElementById('addLayerBtn').addEventListener('click', () => {
    const count = document.querySelectorAll('.layer-input').length + 1;
    const div = document.createElement('div');
    div.className = 'input-group';
    div.innerHTML = `<label>Layer ${count} Thickness</label><input type="number" class="layer-input" step="0.001">`;
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


// --- 5. GENERAL MATH MODULE ---
function safeEval(expr) {
    try {
        const sanitized = expr.replace(/[^-()\d/*+.]/g, ''); 
        return Function('"use strict";return (' + sanitized + ')')();
    } catch (e) { return "Error"; }
}

document.getElementById('calcExprBtn').addEventListener('click', () => {
    const expr = document.getElementById('mathExpr').value;
    const res = safeEval(expr);
    document.getElementById('exprRes').textContent = isNaN(res) ? "Invalid input" : res;
});

function gcd(a, b) { return b ? gcd(b, a % b) : a; }

document.getElementById('convFracBtn').addEventListener('click', () => {
    const input = document.getElementById('fracDecInput').value.trim();
    let result = "";
    
    if (input.includes('/')) {
        const parts = input.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (den !== 0) { result = (num / den).toString(); }
        }
    } else {
        const dec = parseFloat(input);
        if (!isNaN(dec)) {
            const len = dec.toString().split('.')[1] ? dec.toString().split('.')[1].length : 0;
            const denominator = Math.pow(10, len);
            const numerator = dec * denominator;
            const divisor = gcd(numerator, denominator);
            result = `${numerator/divisor} / ${denominator/divisor}`;
        }
    }
    document.getElementById('fracRes').textContent = result || "Invalid input";
});

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

// --- Percentage Calculator Logic ---
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

// --- 9. PC DRAG-TO-SCROLL LOGIC ---
function enableDragScroll(containerSelector) {
    const slider = document.querySelector(containerSelector);
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = ''; // Revert to default
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = ''; // Revert to default
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); // Prevents the browser from highlighting text while dragging
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // The * 2 determines scroll speed
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Apply to main navigation and reference sub-navigation
enableDragScroll('.tabs');
enableDragScroll('.sub-tabs');

// --- 6. PHYSICS MODULE LOGIC ---

// Helper function to allow both decimals and fractions in inputs
function parseFractionInput(val) {
    if (!val || val.trim() === '') return NaN;
    if (val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 2 && parseFloat(parts[1]) !== 0) {
            return parseFloat(parts[0]) / parseFloat(parts[1]);
        }
    }
    return parseFloat(val);
}

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

document.getElementById('clearDispBtn').addEventListener('click', () => {
    document.getElementById('physA1').value = '';
    document.getElementById('physD1').value = '';
    document.getElementById('physA2').value = '';
    document.getElementById('physD2').value = '';
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
        });
    }

    // 5. Close if they click outside (but don't set the flag)
    window.addEventListener('click', (event) => {
        if (event.target === legalModal) {
            legalModal.style.display = 'none';
        }
    });
});

// =========================================================================
// SKETCHPAD 2.0: OBJECT-ORIENTED ENGINE
// =========================================================================
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearCanvasBtn');

let currentTool = 'freehand';
let currentColor = '#003366';
let currentWidth = 3;

// The Vault: Stores the mathematical data of everything drawn
let elements = [];
let isDrawing = false;
let isDragging = false;
let selectedElement = null;
let startX, startY;

// --- UI EVENT LISTENERS ---
const toolBtns = document.querySelectorAll('.tool-btn');
toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.getAttribute('data-tool');
        selectedElement = null; // Drop anything currently being held
        redraw();
    });
});

const colorBtns = document.querySelectorAll('.color-btn');
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.getAttribute('data-color');
        currentWidth = btn.classList.contains('eraser-btn') ? 15 : 3;
        
        // Bonus Feature: Change color of an already placed shape
        if (selectedElement && currentTool === 'move') {
            selectedElement.color = currentColor;
            if (btn.classList.contains('eraser-btn')) selectedElement.width = 15;
            redraw();
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

function draw(e) {
    e.preventDefault();
    const pos = getCoordinates(e);

    // If grabbing something, shift all its coordinates
    if (isDragging && selectedElement) {
        const dx = pos.x - startX;
        const dy = pos.y - startY;
        
        if (selectedElement.type === 'freehand' || selectedElement.type === 'eraser') {
            selectedElement.points.forEach(p => { p.x += dx; p.y += dy; });
        } else if (selectedElement.type === 'line') {
            selectedElement.x1 += dx; selectedElement.y1 += dy;
            selectedElement.x2 += dx; selectedElement.y2 += dy;
        } else {
            selectedElement.x += dx; selectedElement.y += dy;
        }
        
        startX = pos.x;
        startY = pos.y;
        redraw();
        return;
    }

    if (!isDrawing) return;

    // Live update the coordinates of the shape currently being drawn
    const currentShape = elements[elements.length - 1];

    if (currentTool === 'freehand' || currentTool === 'eraser') {
        currentShape.points.push({x: pos.x, y: pos.y});
    } else if (currentTool === 'line') {
        currentShape.x2 = pos.x; currentShape.y2 = pos.y;
    } else if (currentTool === 'square') {
        currentShape.w = pos.x - startX; currentShape.h = pos.y - startY;
    } else if (currentTool === 'circle') {
        currentShape.r = Math.sqrt(Math.pow((pos.x - startX), 2) + Math.pow((pos.y - startY), 2));
    }
    redraw();
}

function endPosition() {
    isDrawing = false;
    isDragging = false;
    
    // Deletes accidental empty clicks so they don't clutter the vault
    if (elements.length > 0) {
        const last = elements[elements.length - 1];
        if ((last.type === 'freehand' || last.type === 'eraser') && last.points.length < 2) elements.pop();
        else if (last.type === 'square' && last.w === 0) elements.pop();
        else if (last.type === 'circle' && last.r === 0) elements.pop();
        else if (last.type === 'line' && last.x1 === last.x2 && last.y1 === last.y2) elements.pop();
    }
    redraw();
}

// Mouse & Touch Hooks
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseleave', endPosition);
canvas.addEventListener('touchstart', startPosition, { passive: false });
canvas.addEventListener('touchend', endPosition);
canvas.addEventListener('touchmove', draw, { passive: false });

clearBtn.addEventListener('click', () => {
    elements = [];
    selectedElement = null;
    redraw();
});

// --- UNDO LOGIC ---
const undoBtn = document.getElementById('undoBtn');

function undoLastAction() {
    if (elements.length > 0) {
        elements.pop(); // Deletes the most recent shape from the Vault
        selectedElement = null; // Drops the item if you were currently holding it
        redraw(); // Repaints the screen without that item
    }
}

undoBtn.addEventListener('click', undoLastAction);

// Pro-Tip: Keyboard Shortcut (Ctrl + Z)
document.addEventListener('keydown', (e) => {
    // Only trigger if the sketchpad is actually visible
    if (document.getElementById('module-sketch').style.display !== 'none') {
        if (e.ctrlKey && e.key === 'z') {
            undoLastAction();
        }
    }
});

// Boot up the engine
redraw();