import { analyzeUrl } from "../utils/urlThreatAnalyzer";

const riskStyles = {
  low: "border-neon-green/30 bg-neon-green/5 text-neon-green",
  moderate: "border-yellow-400/30 bg-yellow-400/5 text-yellow-300",
  high: "border-orange-400/30 bg-orange-400/5 text-orange-300",
  critical: "border-danger/30 bg-danger/5 text-danger",
  unknown: "border-cyber-border bg-white/5 text-slate-400",
};

const formatRisk = (risk) => risk.charAt(0).toUpperCase() + risk.slice(1);

export const UrlThreatAnalysis = ({ urls = [], title = "URL Threat Analysis" }) => {
  const analyses = urls.map((item) => ({
    label: item.label || item.url,
    url: item.url,
    result: analyzeUrl(item.url),
  }));

  return (
    <section className="space-y-4" aria-label={title}>
      <div>
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Local heuristic analysis only. A low score does not guarantee that a website is safe.
        </p>
      </div>

      {analyses.length === 0 ? (
        <div className="rounded-lg border border-cyber-border bg-white/5 p-4 text-sm text-slate-400">
          No web links were found to analyze.
        </div>
      ) : (
        analyses.map(({ label, url, result }, index) => (
          <article
            key={`${url}-${index}`}
            className="rounded-xl border border-cyber-border bg-cyber-card/60 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="font-mono text-sm text-slate-200 break-all">{url}</p>
              </div>
              {result.isValid && (
                <div className={`rounded-lg border px-3 py-2 text-center ${riskStyles[result.riskLevel]}`}>
                  <p className="text-[10px] uppercase tracking-wider">Risk score</p>
                  <p className="text-xl font-bold tabular-nums">{result.score}/100</p>
                  <p className="text-xs font-semibold">{formatRisk(result.riskLevel)} risk</p>
                </div>
              )}
            </div>

            {!result.isValid ? (
              <p role="status" className="text-sm text-warning">{result.error}</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                  <span>Host: {result.hostname}</span>
                  <span>Registered domain: {result.registrableDomain}</span>
                </div>
                {result.findings.length > 0 ? (
                  <ul className="space-y-2">
                    {result.findings.map((finding) => (
                      <li key={finding.code} className="rounded-lg bg-black/20 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-slate-200">{finding.title}</p>
                          <span className="shrink-0 text-xs font-mono text-danger">+{finding.points}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-400 mt-1">{finding.detail}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neon-green">
                    No configured URL warning patterns were detected.
                  </p>
                )}
              </>
            )}
          </article>
        ))
      )}
    </section>
  );
};
