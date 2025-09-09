// js/events.js
// Lightweight visualizer for the left 'city' pane: background mood, smog, waterlevel, neon, ticker
let els = {};
export function initCity(){
  els.bg = byId('cityBg');
  els.smog = byId('citySmog');
  els.water = byId('cityWater');
  els.neon = byId('cityNeon');
  els.ticker = byId('cityTicker');
}

export function updateCity({ stress, label, pm25, pegelCm, priceCt }){
  // Background hue by stress
  const hue = Math.round( mapRange(stress, 0,1, 190, 330) );
  els.bg.style.background = `radial-gradient(800px 400px at 60% 120%, hsl(${hue} 60% 16%), #070a11 60%)`;
  els.bg.style.filter = `saturate(${mapRange(stress,0,1,1,1.3).toFixed(2)}) brightness(${mapRange(stress,0,1,1,0.85).toFixed(2)})`;

  // Smog opacity from PM2.5 (0–80 µg/m³ typical cap)
  const smog = clamp((pm25-10)/50, 0, 1);
  els.smog.style.opacity = smog;

  // Water level (0–60%) from pegel (cap at 300 cm)
  const wl = pegelCm!=null ? clamp((pegelCm-100)/200, 0, 0.6) : 0.1;
  els.water.style.height = `${(wl*100).toFixed(0)}%`;
  els.water.style.bottom = `${-30 + wl*20}%`;

  // Neon intensity by price (higher price → dimmer, more flicker implied via CSS class in main)
  const neon = clamp(1 - ((priceCt??20)-12)/24, 0.4, 1.1);
  els.neon.style.opacity = neon;
  els.neon.style.filter = `brightness(${neon})`;

  // Ticker text summary
  const parts = [];
  if(priceCt!=null) parts.push(`⚡ ${priceCt.toFixed(2)} ct/kWh`);
  if(typeof pm25==='number') parts.push(`☁ PM2.5 ${pm25.toFixed(1)} µg/m³`);
  if(typeof pegelCm==='number') parts.push(`🌊 Pegel ${pegelCm} cm`);
  parts.push(`Σ Stress ${Math.round(stress*100)}% (${label})`);
  els.ticker.textContent = parts.join('   •   ');
}

function mapRange(v,a1,a2,b1,b2){ return b1+(b2-b1)*((v-a1)/(a2-a1)); }
function clamp(x,lo,hi){ return Math.max(lo, Math.min(hi,x)); }
function byId(id){ return document.getElementById(id); }
