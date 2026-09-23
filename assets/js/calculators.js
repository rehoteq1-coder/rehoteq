/* Educational estimates, not installation designs. Formulas and source tables are
 * documented on the corresponding HTML pages. No network or storage access. */
(function (root) {
  'use strict';
  function number(value, min, max, label) {
    if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && value.trim() === '')) throw new Error(`${label} is required.`);
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label} must be between ${min} and ${max}.`);
    return n;
  }
  function choice(value, options, label) {
    if (!Object.hasOwn(options, value)) throw new Error(`Choose a supported ${label}.`);
    return options[value];
  }
  const sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35];
  // Schneider Electrical Installation Guide, G20, copper/PVC, THREE loaded conductors.
  const ampacity = {B2: [15,20,27,34,46,62,80,99], C: [17.5,24,32,41,57,76,96,119]};
  const temperatureFactors = {30:1,35:0.94,40:0.87,45:0.79,50:0.71,55:0.61,60:0.5};
  const groupingFactors = {1:1,2:0.8,3:0.7,4:0.65};
  function voltageDrop(o) {
    const current = number(o.current,0,500,'Current (A)');
    const length = number(o.length,0,1000,'One-way length (m)');
    const area = number(o.area,1.5,35,'Copper area (mm²)');
    if (!sizes.includes(area)) throw new Error('Choose a listed conductor size.');
    const voltage = number(o.voltage,100,260,'Single-phase voltage (V)');
    const pf = number(o.pf,0.5,1,'Power factor');
    const target = number(o.target,0.1,10,'Drop budget (%)');
    // G29: R=23.7/S ohm/km; X=0.08 ohm/km. One-way metres, single phase.
    const volts = 2 * current * length / 1000 * (23.7 / area * pf + 0.08 * Math.sqrt(1-pf*pf));
    const percent = volts / voltage * 100;
    return {volts, percent, receiving: voltage-volts, within: percent <= target};
  }
  function cable(o) {
    const watts = number(o.watts,1,50000,'Electrical input load (W)');
    const voltage = number(o.voltage,100,260,'Voltage (V)');
    const pf = number(o.pf,0.5,1,'Power factor');
    const table = choice(o.method,ampacity,'installation method');
    const temp = choice(o.ambient,temperatureFactors,'ambient temperature');
    const group = choice(o.circuits,groupingFactors,'circuit count');
    const current = watts / (voltage*pf);
    // Validate even when no size has sufficient ampacity.
    voltageDrop({...o,current,area:1.5});
    const candidates = sizes.map((area,i) => ({area, capacity:table[i]*temp*group, ...voltageDrop({...o,current,area})}));
    return {current, temp, group, candidate:candidates.find(c => c.capacity >= current && c.within) || null};
  }
  const dodPresets = {lithium:80,agm:50,gel:50,tubular:50};
  function battery(o) {
    if (!Array.isArray(o.loads) || !o.loads.length || o.loads.length > 30) throw new Error('Enter 1–30 loads.');
    let energy = 0, watts = 0;
    o.loads.forEach((load,i) => {
      const w = number(load.watts,1,50000,`Load ${i+1} watts`);
      const q = number(load.quantity,1,100,`Load ${i+1} quantity`);
      if (!Number.isInteger(q)) throw new Error('Load quantity must be a whole number.');
      const h = number(load.hours,0,24,`Load ${i+1} hours`);
      energy += w*q*h; watts += w*q;
    });
    if (!energy) throw new Error('At least one load needs backup hours above zero.');
    const voltage = number(o.voltage,12,60,'Nominal bank voltage (V)');
    const dod = choice(o.type,dodPresets,'battery type') / 100;
    const efficiency = number(o.efficiency,50,100,'Inverter efficiency (%)') / 100;
    const pf = number(o.pf,0.5,1,'Aggregate load power factor');
    const reserve = number(o.reserve,0,100,'Energy reserve (%)') / 100;
    const nominalWh = energy*(1+reserve)/(dod*efficiency);
    return {energy,watts,dod,nominalWh,ah:nominalWh/voltage,inverterW:watts*1.25,inverterVA:watts*1.25/pf,dcA:watts/(voltage*efficiency)};
  }
  const scales = {standard:[[70,5],[60,4],[50,3],[45,2],[40,1],[0,0]], noE:[[70,5],[60,4],[50,3],[45,2],[0,0]]};
  function gpa(o) {
    const scale = choice(o.scale,scales,'grading scale');
    if (!Array.isArray(o.courses) || !o.courses.length || o.courses.length > 50) throw new Error('Enter 1–50 courses.');
    let units = 0, points = 0;
    const grades = o.courses.map((course,i) => {
      const u = number(course.units,1,30,`Course ${i+1} units`);
      if (!Number.isInteger(u)) throw new Error('Course units must be whole numbers.');
      const score = number(course.score,0,100,`Course ${i+1} mark`);
      const point = scale.find(([cutoff]) => score >= cutoff)[1];
      units += u; points += u*point;
      return point;
    });
    const previousUnits = number(o.previousUnits,0,10000,'Previous units');
    const previousPoints = number(o.previousPoints,0,50000,'Previous quality points');
    if (!Number.isInteger(previousUnits)) throw new Error('Previous units must be whole numbers.');
    if (previousPoints > previousUnits*5) throw new Error('Previous quality points cannot exceed 5 × previous units.');
    return {units,points,grades,gpa:points/units,cgpa:(points+previousPoints)/(units+previousUnits)};
  }
  const api = {voltageDrop,cable,battery,gpa};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RehoteqCalculators = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
