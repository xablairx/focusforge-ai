export function weeklyReviewEmailHtml(opts: {
  name: string
  missionTitle: string
  weekStart: string
  weekEnd: string
  focusScore: number
  completionScore: number
  revenue: number
  tasksCompleted: number
  coaching: string
  wins: string[]
  failures: string[]
}): string {
  const { name, missionTitle, weekStart, weekEnd, focusScore, completionScore, revenue, tasksCompleted, coaching, wins, failures } = opts
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #fff; color: #111; margin: 0; padding: 0; }
  .header { background: #000; padding: 24px; border-bottom: 4px solid #f97316; }
  .brand { color: #f97316; font-size: 20px; font-weight: 900; }
  .brand span { color: #fff; }
  .container { max-width: 520px; margin: 0 auto; }
  .section { padding: 20px 24px; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 24px 20px; }
  .stat { background: #f9f9f9; border-radius: 12px; padding: 12px; text-align: center; }
  .stat-val { font-size: 22px; font-weight: 900; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #888; margin-top: 2px; }
  .coaching { background: #000; border-radius: 12px; padding: 16px; margin: 0 24px 16px; color: #ccc; font-size: 14px; line-height: 1.6; }
  .coaching-label { color: #f97316; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 8px; }
  .cta { text-align: center; padding: 16px 24px 32px; }
  .cta a { background: #f97316; color: #fff; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: .05em; padding: 12px 24px; border-radius: 12px; text-decoration: none; }
  ul { margin: 4px 0; padding-left: 16px; font-size: 14px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <div class="brand">Focus<span>Forge</span></div>
    <div style="color:#888;font-size:12px;margin-top:4px">Week of ${weekStart} – ${weekEnd}</div>
  </div>
  <div class="section">
    <div style="font-size:18px;font-weight:900">Hey ${name} 👊</div>
    <div style="color:#555;font-size:13px;margin-top:4px">Mission: <strong>${missionTitle}</strong></div>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-val" style="color:#f97316">${focusScore}%</div><div class="stat-label">Focus Score</div></div>
    <div class="stat"><div class="stat-val" style="color:#3b82f6">${completionScore}%</div><div class="stat-label">Task Rate</div></div>
    <div class="stat"><div class="stat-val" style="color:#16a34a">$${revenue.toFixed(0)}</div><div class="stat-label">Revenue</div></div>
    <div class="stat"><div class="stat-val">${tasksCompleted}</div><div class="stat-label">Tasks Done</div></div>
  </div>
  <div class="coaching">
    <div class="coaching-label">⚡ Chief of Staff</div>
    ${coaching}
  </div>
  ${wins.length > 0 ? `<div class="section"><strong style="color:#16a34a">Wins ✓</strong><ul>${wins.map(w => `<li>${w}</li>`).join('')}</ul></div>` : ''}
  ${failures.length > 0 ? `<div class="section"><strong style="color:#dc2626">Misses</strong><ul>${failures.map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}
  <div class="cta"><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000'}/app">Open FocusForge →</a></div>
</div>
</body>
</html>`
}
