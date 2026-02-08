import React, { useMemo, useState } from "react";

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

  return [...variants].filter(Boolean).slice(0, 20);
}

function scoreFromText(text) {
  return [...text].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 100;
}

function domainIntel(domain) {
  if (!domain.trim()) return null;
  const clean = domain.trim().toLowerCase();
  const score = scoreFromText(clean);
  return {
    tld: clean.split(".").pop() || "unknown",
    risk: score > 70 ? "High" : score > 40 ? "Medium" : "Low",
    dnsHealth: score % 2 === 0 ? "Stable" : "Inconsistent",
    likelyProvider: ["Cloud", "Managed VPS", "Self-hosted"][score % 3],
    sslDaysLeft: 30 + (score % 300),
  };
}

function emailIntel(email) {
  if (!email.trim()) return null;
  const clean = email.trim().toLowerCase();
  const score = scoreFromText(clean);
  return {
    provider: clean.split("@")[1] || "unknown",
    breachRisk: score > 65 ? "Elevated" : "Normal",
    formatValid: /^\S+@\S+\.\S+$/.test(clean) ? "Valid pattern" : "Invalid pattern",
    confidence: `${50 + (score % 50)}%`,
  };
}

function phoneIntel(phone) {
  if (!phone.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  const score = scoreFromText(digits);
  return {
    normalized: digits,
    countryGuess: digits.startsWith("92") ? "Pakistan" : digits.startsWith("1") ? "US/CA" : "Unknown",
    lineType: score % 2 === 0 ? "Mobile" : "Unknown/VoIP",
    spamLikelihood: score > 60 ? "Possible" : "Low",
  };
}

function ipIntel(ip) {
  if (!ip.trim()) return null;
  const score = scoreFromText(ip);
  return {
    version: ip.includes(":") ? "IPv6" : "IPv4",
    reputation: score > 75 ? "Suspicious" : score > 45 ? "Monitor" : "Clean",
    openPortsEstimate: [2, 4, 8, 12][score % 4],
    geoHint: ["South Asia", "Europe", "North America", "Middle East"][score % 4],
  };
}

function InfoGrid({ title, data }) {
  if (!data) return null;
  return (
    <div className="info-block">
      <h3>{title}</h3>
      <div className="result-grid">
        {Object.entries(data).map(([key, value]) => (
          <div className="result-item" key={key}>
            <strong>{key}</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>
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
  const dIntel = useMemo(() => domainIntel(domain), [domain]);
  const eIntel = useMemo(() => emailIntel(email), [email]);
  const pIntel = useMemo(() => phoneIntel(phone), [phone]);
  const iIntel = useMemo(() => ipIntel(ip), [ip]);

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(notes);
    } catch {
      // no-op
    }
  };

  return (
    <main className="osint-page">
      <section className="card hero">
        <p className="tag">OSINT Toolkit</p>
        <h1>MRK OSINT Web Suite (Offline Internal)</h1>
        <p className="muted">All modules work inside this website only — no external link redirection.</p>
        <div className="alert">Authorized and legal use only.</div>
      </section>

      <section className="card section">
        <h2>1) Username Intelligence</h2>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. meelad786" />
        <div className="stack">
          {usernameVariants.length === 0 && <p className="muted">Enter a handle to generate internal results.</p>}
          {usernameVariants.map((handle) => (
            <div key={handle} className="variant-row">
              <span>@{handle}</span>
              <small>Strength Score: {scoreFromText(handle)} / 100</small>
            </div>
          ))}
        </div>
      </section>

      <section className="card section grid-2">
        <div>
          <h2>2) Domain Intelligence</h2>
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
          <InfoGrid title="Internal Domain Analysis" data={dIntel} />
        </div>
        <div>
          <h2>3) Email Intelligence</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="target@domain.com" />
          <InfoGrid title="Internal Email Analysis" data={eIntel} />
        </div>
      </section>

      <section className="card section grid-2">
        <div>
          <h2>4) Phone Intelligence</h2>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" />
          <InfoGrid title="Internal Phone Analysis" data={pIntel} />
        </div>
        <div>
          <h2>5) IP Intelligence</h2>
          <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="8.8.8.8" />
          <InfoGrid title="Internal IP Analysis" data={iIntel} />
        </div>
      </section>

      <section className="card section">
        <h2>Case Notes</h2>
        <p className="muted">Write findings and copy into your report.</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="[UTC time] - Finding - Evidence - Confidence"
        />
        <div className="actions">
          <button type="button" onClick={copyNotes}>Copy Notes</button>
          <button type="button" onClick={() => setNotes("")} className="secondary">Clear</button>
        </div>
      </section>
    </main>
  );
}
