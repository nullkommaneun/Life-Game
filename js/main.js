// js/main.js
import { fetchAwattarDE, fetchOpenMeteoAirZwickau, fetchPegelZwickau } from './dataAdapters.js';
import { computeZwickauGridStress, actionCost } from './simMapping.js';
import { initUI, updateUI, pushLog, onEvent } from './ui.js';
import { initCity, updateCity } from './events.js';

let state = { energy: 100, last: { pm25:null, pegelCm:null, priceCt:null, stress:0, energyMult:1, label:'–' } };

export async function startApp(){
  initCity();
  onEvent('act', (type)=>{
    if(type==='patrol') doAction('Drohnen‑Patrouille', 12);
    if(type==='battery') doAction('Batterien schmuggeln', 8);
    if(type==='overclock') doOverclock();
  });
  await refreshData();
  setInterval(refreshData, 60_000);
}

// one-shot guard to avoid overlapping fetch cycles on slow networks
let fetching = false;
async function refreshData(){
  if(fetching) return;
  fetching = true;
  try{
    const [price, pm25, pegel] = await Promise.all([
      fetchAwattarDE(),
      fetchOpenMeteoAirZwickau(),
      fetchPegelZwickau()
    ]);
    const priceCt = price?.ct_kwh ?? null;
    const pegelCm = pegel ?? null;

    const { stress, energyMult, label } = computeZwickauGridStress({ pm25, pegelCm, priceCt });
    state.last = { pm25, pegelCm, priceCt, stress, energyMult, label };
    updateUI(state.last);
    updateCity({ ...state.last });
    pushLog(`Daten aktualisiert – Status: ${label}, Multiplier ${energyMult}x`);
    if(stress>0.75) pushLog(`<span class="warn">Warnung: Netzspannung kritisch – Aktionen extrem teuer.</span>`);
  }catch(e){ pushLog(`<span class="warn">Datenfehler:</span> ${e.message}`); }
  finally{ fetching = false; }
}

function doAction(name, base){
  const cost = actionCost(base, state.last.energyMult);
  if(state.energy < cost){ pushLog(`<span class="warn">${name} abgebrochen:</span> zu wenig Energie (${state.energy}/${cost}).`); return; }
  state.energy -= cost;
  pushLog(`${name}: −${cost} Energie (Rest: ${state.energy}).`);
  if(state.last.stress>0.6) pushLog(`Nebenwirkung: Netz flackert… Sicherheitsdrohnen reagieren nervös.`);
  if(state.energy<=0){ state.energy=0; pushLog(`<span class="warn">Energie erschöpft. Warte auf günstigere Lage.</span>`); }
}

function doOverclock(){
  if(state.last.energyMult>1.2){ pushLog(`<span class="warn">Übertakten ineffizient:</span> Energiekosten aktuell zu hoch.`); return; }
  doAction('Serverfarm übertakten', 15);
  const bonus = Math.max(5, Math.round(20*(1 - state.last.stress)));
  state.energy = Math.min(120, state.energy + bonus);
  pushLog(`Datenscore +${bonus}. Energiepuffer aufgefüllt (jetzt ${state.energy}).`);
}
