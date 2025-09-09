// js/ui.js
let logEl, cityEl, powerEl, gridEl, multEl, airEl, pegEl, awEl, clockEl;
export function initUI(){
  logEl = byId('log'); cityEl = byId('city'); powerEl = byId('powerState');
  gridEl = byId('gridStress'); multEl = byId('energyMult');
  airEl = byId('air'); pegEl = byId('pegel'); awEl = byId('awattar'); clockEl = byId('clock');
  on('#btn_patrol','click', ()=>emit('act','patrol'));
  on('#btn_overclock','click', ()=>emit('act','overclock'));
  on('#btn_battery','click', ()=>emit('act','battery'));
  tickClock(); setInterval(tickClock,1000);
}
function tickClock(){ clockEl.textContent = new Date().toLocaleTimeString(); }
export function updateUI(d){
  const { airIndex, pegelCm, priceCt, label, stress, energyMult } = d;
  gridEl.textContent = `${Math.round(stress*100)}% (${label})`;
  multEl.textContent = energyMult;
  airEl.textContent = airIndex!=null ? airIndex : '–';
  pegEl.textContent = pegelCm!=null ? pegelCm : '–';
  awEl.textContent = priceCt!=null ? priceCt.toFixed(2) : '–';
  cityEl.classList.toggle('flicker', stress>0.6);
  powerEl.innerHTML = stress>0.6 ? `<span class="warn">Blackout‑Gefahr</span>` : (stress>0.25 ? `Netz <span class="warn">angespannt</span>` : `<span class="ok">Versorgung stabil</span>`);
}
export function pushLog(msg){ const t=new Date().toLocaleTimeString(); logEl.innerHTML = `[${t}] ${msg}<br>` + logEl.innerHTML; }
const listeners={};
export function onEvent(n,cb){ (listeners[n] ||= []).push(cb); }
function emit(n,p){ (listeners[n]||[]).forEach(f=>f(p)); }
function on(sel,ev,cb){ document.querySelector(sel).addEventListener(ev,cb); }
function byId(id){ return document.getElementById(id); }
