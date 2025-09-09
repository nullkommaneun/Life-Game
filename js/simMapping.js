// js/simMapping.js
// Compute master stress from three inputs
export function computeZwickauGridStress({ pm25, pegelCm, priceCt }){
  // pm2.5 mapping (µg/m³): 0–10 gut, 10–25 moderat, 25–50 schlecht, 50+ sehr schlecht
  const air = clamp((pm25 - 10)/40, 0, 1);
  const peg = pegelCm!=null ? clamp((pegelCm - 120)/180, 0, 1) : 0.2;
  const cost = priceCt!=null ? clamp((priceCt - 12)/18, 0, 1) : 0.3;

  const stress = clamp(0.42*cost + 0.33*air + 0.25*peg, 0, 1);
  const energyMult = roundTo(mapRange(stress, 0, 1, 0.6, 2.4), 2);
  const label = stress < 0.25 ? 'Stabil' : stress < 0.6 ? 'Angespannt' : 'Kritisch';
  return { stress, energyMult, label };
}
export function actionCost(base, mult){ return Math.ceil(base*mult); }
function mapRange(v,a1,a2,b1,b2){ return b1+(b2-b1)*((v-a1)/(a2-a1)); }
function clamp(x,lo,hi){ return Math.max(lo, Math.min(hi,x)); }
function roundTo(x,n){ const p=10**n; return Math.round(x*p)/p; }
