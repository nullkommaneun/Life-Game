// js/simMapping.js
export function computeZwickauGridStress({ airIndex, pegelCm, priceCt }){
  const air = clamp((airIndex - 20)/60, 0, 1);        // 20→80 Index
  const peg = pegelCm!=null ? clamp((pegelCm - 120)/180, 0, 1) : 0.2; // 120→300 cm
  const cost = priceCt!=null ? clamp((priceCt - 12)/18, 0, 1) : 0.3;  // 12→30 ct/kWh

  const stress = clamp(0.4*cost + 0.35*air + 0.25*peg, 0, 1);
  const energyMult = roundTo(mapRange(stress, 0, 1, 0.6, 2.4), 2);
  const label = stress < 0.25 ? 'Stabil' : stress < 0.6 ? 'Angespannt' : 'Kritisch';
  return { stress, energyMult, label };
}
export function actionCost(base, mult){ return Math.ceil(base*mult); }
function mapRange(v,a1,a2,b1,b2){ return b1+(b2-b1)*((v-a1)/(a2-a1)); }
function clamp(x,lo,hi){ return Math.max(lo, Math.min(hi,x)); }
function roundTo(x,n){ const p=10**n; return Math.round(x*p)/p; }
