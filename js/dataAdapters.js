// js/dataAdapters.js
// Robust fetch helper with timeout + retries
async function robustFetch(url, { timeout=7000, retries=1, cache='no-store' } = {}){
  for(let attempt=0; attempt<=retries; attempt++){
    const ctrl = new AbortController();
    const t = setTimeout(()=>ctrl.abort(), timeout);
    try{
      const r = await fetch(url, { cache, signal: ctrl.signal });
      clearTimeout(t);
      if(!r.ok) throw new Error('HTTP '+r.status);
      return await r.json();
    }catch(e){
      clearTimeout(t);
      if(attempt===retries) throw e;
      await new Promise(res=>setTimeout(res, 400*(attempt+1)));
    }
  }
}

// aWATTar Day-Ahead (DE): returns { ct_kwh }
export async function fetchAwattarDE(){
  try{
    const j = await robustFetch('https://api.awattar.de/v1/marketdata', {retries:2});
    const now = Date.now();
    const cur = (j.data||[]).find(x => now>=x.start_timestamp && now<x.end_timestamp);
    return cur ? { ct_kwh: (cur.marketprice/10) } : null; // EUR/MWh → ct/kWh
  }catch(e){ return null; }
}

// Open‑Meteo Air Quality for Zwickau center (no key, CORS‑ok)
// Returns PM2_5 now (µg/m³)
export async function fetchOpenMeteoAirZwickau(){
  const lat = 50.7189, lon = 12.4939; // Zwickau
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5`;
  try{
    const j = await robustFetch(url, {retries:2});
    const hours = j?.hourly?.time || [];
    const idx = hours.findIndex(t => t === new Date().toISOString().slice(0,13)+":00");
    const pm = (idx>=0) ? j.hourly.pm2_5[idx] : j?.hourly?.pm2_5?.at(-1);
    if(typeof pm === 'number') return pm;
    return null;
  }catch(e){ return null; }
}

// PEGELONLINE – find Zwickau station and last water level (cm)
export async function fetchPegelZwickau(){
  try{
    const stations = await robustFetch('https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json', {retries:2});
    const st = stations.find(x => /zwickau|zwickauer mulde|p\u00f6lbitz/i.test(x.longname));
    if(!st) return null;
    const arr = await robustFetch(`https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/${st.stationuuid}/W/measurements.json?start=P6H`, {retries:2});
    if(!Array.isArray(arr) || arr.length===0) return null;
    const last = arr[arr.length-1];
    return Math.round(Number(last.value));
  }catch(e){ return null; }
}
