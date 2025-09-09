// js/dataAdapters.js
export async function fetchAwattarDE(){
  const r = await fetch('https://api.awattar.de/v1/marketdata', { cache:'no-store' });
  if(!r.ok) throw new Error('aWATTar '+r.status);
  const j = await r.json();
  const now = Date.now();
  const cur = (j.data||[]).find(x => now>=x.start_timestamp && now<x.end_timestamp);
  return cur ? { ct_kwh: (cur.marketprice/10) } : null; // EUR/MWh → ct/kWh
}

// UBA – Luftdaten Zwickau (DESN091). Hinweis: Der konkrete Pfad kann sich ändern.
// Falls der Endpoint 404/CORS liefert, gracefully auf null gehen; Spiel läuft weiter.
export async function fetchUBA_Zwickau(){
  const url = 'https://www.umweltbundesamt.de/api/air_data/v2/airquality/json?station=DESN091';
  try{
    const r = await fetch(url, { cache:'no-store' });
    if(!r.ok) throw new Error('UBA '+r.status);
    const j = await r.json();
    const val = extractAirIndex(j);
    return (typeof val==='number') ? val : null;
  }catch(e){ return null; }
}
function extractAirIndex(j){
  // Dummy-Mapping: ohne Schema-Kenntnis vorsichtig eine Indexzahl 0–100 ableiten.
  const flat = JSON.stringify(j).match(/\b(\d{1,3}(?:\.\d{1,2})?)\b/g);
  if(!flat) return null;
  const nums = flat.map(Number).filter(n=>isFinite(n));
  if(nums.length===0) return null;
  const p = Math.max(0, Math.min(100, Math.round(nums[0])));
  return p;
}

// PEGELONLINE – suche Station „Zwickau“ / „Zwickauer Mulde“ und hole letzte Messung
export async function fetchPegelZwickau(){
  try{
    const s = await (await fetch('https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json')).json();
    const st = s.find(x => /zwickau|zwickauer mulde|p\u00f6lbitz/i.test(x.longname));
    if(!st) return null;
    const url = `https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/${st.stationuuid}/W/measurements.json?start=P6H`;
    const r = await fetch(url, { cache:'no-store' });
    if(!r.ok) throw new Error('PEgel '+r.status);
    const arr = await r.json();
    if(!Array.isArray(arr) || arr.length===0) return null;
    const last = arr[arr.length-1];
    return Math.round(Number(last.value));
  }catch(e){ return null; }
}
