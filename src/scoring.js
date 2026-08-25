// The health score is a simple, transparent weighted formula —
// not a black box. Tune the weights here as you learn more.
export function scoreProduct(p) {
  let s = 50
  s += (p.stars - 2.5) * 8
  s += Math.max(0, 5 - p.sugar / 3)
  s += p.protein * 2
  s += p.fibre * 2
  s -= p.sodium / 40
  s -= Math.max(0, (p.cal - 150) / 20)
  return Math.round(Math.max(0, Math.min(100, s)))
}

export function perServePrice(p) {
  return p.price / p.servePerPack
}

export function buildVerdict(pa, pb) {
  const sa = scoreProduct(pa)
  const sb = scoreProduct(pb)
  if (sa === sb) return 'These two are about equally healthy overall.'

  const winner = sa > sb ? pa : pb
  const loser = sa > sb ? pb : pa
  const diffs = []
  if (winner.protein > loser.protein) diffs.push(`${(winner.protein - loser.protein).toFixed(1)}g more protein`)
  if (winner.sugar < loser.sugar) diffs.push(`${(loser.sugar - winner.sugar).toFixed(1)}g less sugar`)
  if (winner.fibre > loser.fibre) diffs.push(`${(winner.fibre - loser.fibre).toFixed(1)}g more fibre`)

  let verdict = `${winner.name} is the healthier pick — ${diffs.slice(0, 2).join(', ')} per serve.`
  const priceDiff = perServePrice(winner) - perServePrice(loser)
  if (priceDiff > 0.01) verdict += ` It costs $${priceDiff.toFixed(2)} more per serve though.`
  return verdict
}
