/* Progressive enhancement: methodology and examples remain readable without JS. */
(function () {
  'use strict';
  const form = document.querySelector('[data-calculator]');
  if (!form) return;
  const kind = form.dataset.calculator;
  const result = document.getElementById('result');
  const error = document.getElementById('error');
  const fmt = (n, digits=2) => n.toLocaleString('en-NG',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const rows = document.getElementById('rows');
  const template = document.getElementById('row-template');
  let rowId = 0;
  function invalidate() { result.hidden = true; result.replaceChildren(); error.textContent = ''; }
  function addRow(values) {
    const max = kind === 'gpa' ? 50 : 30;
    if (rows.children.length >= max) { error.textContent = `Maximum ${max} rows.`; return; }
    const row = template.content.firstElementChild.cloneNode(true);
    const id = ++rowId;
    row.querySelectorAll('input').forEach(input => {
      input.id = `${input.name}-${id}`;
      input.closest('label').htmlFor = input.id;
      if (values && Object.hasOwn(values,input.name)) input.value = values[input.name];
    });
    row.querySelector('button').addEventListener('click',() => {
      if (rows.children.length === 1) { error.textContent = 'Keep at least one row.'; return; }
      row.remove(); invalidate(); document.getElementById('add-row').focus();
    });
    rows.append(row); invalidate();
    return row;
  }
  if (rows) {
    const defaults = kind === 'battery' ? [
      {label:'LED lights',watts:10,quantity:6,hours:5},
      {label:'Fans',watts:60,quantity:2,hours:6},
      {label:'Television',watts:80,quantity:1,hours:4},
      {label:'Router',watts:12,quantity:1,hours:8}
    ] : [{label:'Course 1',units:3,score:72},{label:'Course 2',units:2,score:63},{label:'Course 3',units:1,score:38}];
    function resetRows() { rows.replaceChildren(); defaults.forEach(addRow); }
    resetRows();
    document.getElementById('add-row').addEventListener('click',() => { const row=addRow(); if(row) row.querySelector('input').focus(); });
    form.addEventListener('reset',() => { setTimeout(resetRows,0); });
  }
  form.addEventListener('input',invalidate);
  form.addEventListener('change',invalidate);
  form.addEventListener('reset',invalidate);
  form.addEventListener('invalid',invalidate,true);
  form.addEventListener('submit',event => {
    event.preventDefault(); invalidate();
    if (!form.reportValidity()) return;
    try {
      const data = Object.fromEntries(new FormData(form));
      if (rows) data[kind === 'gpa' ? 'courses' : 'loads'] = [...rows.children].map(row => Object.fromEntries([...row.querySelectorAll('input')].map(input => [input.name,input.value])));
      const r = RehoteqCalculators[kind](data);
      let metrics, note;
      if (kind === 'cable') {
        metrics = [['Design current',`${fmt(r.current)} A`],['Temperature × grouping',`${r.temp} × ${r.group}`]];
        if(r.candidate) {
          metrics.push(['Candidate for professional review',`${r.candidate.area} mm² copper`],['Corrected table capacity',`${fmt(r.candidate.capacity)} A`],['Estimated run drop',`${fmt(r.candidate.volts)} V (${fmt(r.candidate.percent)}%)`]);
          note = 'Meets only this model’s load-current and run-drop checks. NOT a safe-to-install verdict. Breaker coordination, fault protection, earthing, route and manufacturer data must be checked by a qualified electrical professional.';
        } else note = 'No candidate in the supported 1.5–35 mm² table meets both checks. Do not extrapolate, parallel cables or buy the largest size: obtain a site-specific professional design.';
      } else if(kind === 'voltageDrop') {
        metrics = [['Voltage drop',`${fmt(r.volts)} V`],['Percentage drop',`${fmt(r.percent)}%`],['Estimated receiving voltage',`${fmt(r.receiving)} V`]];
        note = `${r.within ? 'Within' : 'Exceeds'} your selected run-drop budget. This is NOT an installation compliance check. Add upstream drops and check starting current, cable heating and protection separately.${r.receiving <= 0 ? ' Non-positive receiving voltage: this operating point is not physically supported by the simple steady-state model; seek professional assessment.' : ''}`;
      } else if(kind === 'battery') {
        metrics = [['Backup load energy',`${fmt(r.energy/1000)} kWh`],['Nominal bank energy (with reserve)',`${fmt(r.nominalWh/1000)} kWh`],['Bank capacity at selected voltage',`${fmt(r.ah)} Ah`],['All listed loads running',`${fmt(r.watts)} W`],['Continuous inverter targets (both required)',`${fmt(r.inverterW)} W / ${fmt(r.inverterVA)} VA`],['Approximate running DC current',`${fmt(r.dcA)} A`]];
        note = `Uses ${r.dod*100}% depth of discharge. Capacity is for the whole bank, NOT per battery. The 25% inverter margin does not cover motor starting. Verify surge duration, battery/BMS current, charging window and the manufacturer’s usable capacity before choosing equipment.`;
      } else {
        metrics = [['Semester units',fmt(r.units,0)],['Semester quality points',fmt(r.points,0)],['Semester GPA',`${fmt(r.gpa)} / 5.00`],['Cumulative CGPA',`${fmt(r.cgpa)} / 5.00`]];
        note = `Grade points by row: ${r.grades.join(', ')}. Estimate only, not an official transcript or degree classification. Failed courses count in attempted units here. Confirm your institution’s repeat, rounding and exclusion rules.`;
      }
      const title = document.createElement('h2'); title.textContent = 'Your estimate'; result.append(title);
      const dl = document.createElement('dl'); dl.className = 'metrics';
      metrics.forEach(([label,value]) => { const box=document.createElement('div'); const dt=document.createElement('dt'); const dd=document.createElement('dd'); dt.textContent=label; dd.textContent=value; box.append(dt,dd); dl.append(box); });
      const p=document.createElement('p'); p.textContent=note; result.append(dl,p); result.hidden=false;
    } catch(e) { error.textContent=e.message; }
  });
})();
