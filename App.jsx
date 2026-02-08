import React, { useMemo, useState } from "react";

const platformTemplates = [
  { label: "GitHub", url: (u) => `https://github.com/${u}` },
  { label: "X/Twitter", url: (u) => `https://x.com/${u}` },
  { label: "Instagram", url: (u) => `https://instagram.com/${u}` },
  { label: "TikTok", url: (u) => `https://www.tiktok.com/@${u}` },
  { label: "Reddit", url: (u) => `https://www.reddit.com/user/${u}` },
  { label: "Telegram", url: (u) => `https://t.me/${u}` },
];

const domainPivots = [
  { label: "WHOIS", url: (d) => `https://who.is/whois/${d}` },
  { label: "DNS Records", url: (d) => `https://dnschecker.org/all-dns-records-of-domain.php?query=${d}` },
  { label: "crt.sh", url: (d) => `https://crt.sh/?q=${d}` },
  { label: "Wayback", url: (d) => `https://web.archive.org/web/*/${d}` },
  { label: "VirusTotal", url: (d) => `https://www.virustotal.com/gui/domain/${d}` },
  { label: "SecurityTrails", url: (d) => `https://securitytrails.com/domain/${d}` },
];

const emailPivots = [
  { label: "HIBP", url: (e) => `https://haveibeenpwned.com/unifiedsearch/${e}` },
  { label: "Email Rep", url: (e) => `https://emailrep.io/${e}` },
  { label: "Hunter", url: (e) => `https://hunter.io/email-verifier/${e}` },
  { label: "Gravatar", url: (e) => `https://www.gravatar.com/avatar/${encodeURIComponent(e)}` },
];

const phonePivots = [
  { label: "Truecaller", url: (p) => `https://www.truecaller.com/search/pk/${p}` },
  { label: "Sync.me", url: (p) => `https://sync.me/search/?number=${p}` },
  { label: "WhatsApp check", url: (p) => `https://wa.me/${p.replace(/[^\d]/g, "")}` },
];

const ipPivots = [
  { label: "AbuseIPDB", url: (ip) => `https://www.abuseipdb.com/check/${ip}` },
  { label: "Shodan", url: (ip) => `https://www.shodan.io/host/${ip}` },
  { label: "IPInfo", url: (ip) => `https://ipinfo.io/${ip}` },
  { label: "Censys", url: (ip) => `https://search.censys.io/hosts/${ip}` },
];

function makeUsernameVariants(value) {
  const base = value.trim().toLowerCase().replace(/\s+/g, "");
  if (!base) return [];

  const separators = ["", ".", "_", "-"];
  const postfixes = ["", "786", "007", "pk", "real", "official", "2026"];
  const variants = new Set([base, base.replace(/[aeiou]/g, ""), base.split("").reverse().join("")]);

  separators.forEach((sep) => {
    postfixes.forEach((postfix) => {
      variants.add(`${base}${sep}${postfix}`.replace(/[._-]$/, ""));
    });
  });

  return [...variants].filter(Boolean).slice(0, 30);
}

function PivotChips({ items, value }) {
  if (!value.trim()) {
    return <p className="muted">Type a value to enable pivot links.</p>;
  }

  return (
    <div className="chip-wrap">
      {items.map((item) => (
        <a key={item.label} className="chip" href={item.url(value.trim())} target="_blank" rel="noreferrer">
          {item.label}
        </a>
      ))}
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ip, setIp] = useState("");
  const [notes, setNotes] = useState("");

  const usernameVariants = useMemo(() => makeUsernameVariants(username), [username]);

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(notes);
    } catch {
      // no-op: clipboard might be restricted in browser privacy contexts
    }
  };

  return (
    <main className="osint-page">
      <section className="card hero">
        <p className="tag">OSINT Toolkit</p>
        <h1>MRK OSINT Web Suite</h1>
        <p className="muted">
          Fast, legal-first recon dashboard for username, domain, email, phone and IP intelligence.
        </p>
        <div className="alert">Use only for authorized investigations and compliant reporting.</div>
      </section>

      <section className="card section">
        <h2>1) Username Footprint</h2>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. meelad786" />
        <div className="stack">
          {usernameVariants.length === 0 && <p className="muted">Enter a handle to generate variants.</p>}
          {usernameVariants.map((handle) => (
            <div key={handle} className="variant-row">
              <span>@{handle}</span>
              <div className="chip-wrap">
                {platformTemplates.map((platform) => (
                  <a
                    key={`${handle}-${platform.label}`}
                    className="chip"
                    href={platform.url(handle)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {platform.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card section">
        <h2>2) Domain Recon</h2>
        <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
        <PivotChips items={domainPivots} value={domain} />
      </section>

      <section className="card section grid-2">
        <div>
          <h2>3) Email Intel</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="target@domain.com" />
          <PivotChips items={emailPivots} value={email} />
        </div>
        <div>
          <h2>4) Phone Intel</h2>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" />
          <PivotChips items={phonePivots} value={phone} />
        </div>
      </section>

      <section className="card section">
        <h2>5) IP Intelligence</h2>
        <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="8.8.8.8" />
        <PivotChips items={ipPivots} value={ip} />
      </section>

      <section className="card section">
        <h2>Case Notes</h2>
        <p className="muted">Store timestamps, observed links and confidence scores while investigating.</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="[UTC time] - Finding - Source URL - Confidence"
        />
        <div className="actions">
          <button type="button" onClick={copyNotes}>Copy Notes</button>
          <button type="button" onClick={() => setNotes("")} className="secondary">Clear</button>
        </div>
      </section>
    </main>
  );
}
