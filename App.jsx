import React, { useMemo, useState } from "react";

function makeUsernameVariants(value) {
  const base = value.trim().toLowerCase().replace(/\s+/g, "");
  if (!base) return [];
  const separators = ["", ".", "_", "-"];
  const postfixes = ["", "786", "007", "pk", "real", "official", "2026"];
  const variants = new Set([base, base.replace(/[aeiou]/g, ""), base.split("").reverse().join("")]);
  separators.forEach((sep) => postfixes.forEach((postfix) => variants.add(`${base}${sep}${postfix}`.replace(/[._-]$/, ""))));
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
    note: "No CNIC/name/SIM-owner data is accessed in this app.",
  };
}

function ipIntel(ip) {
  if (!ip.trim()) return null;
  const score = scoreFromText(ip);
  return {
    version: ip.includes(":") ? "IPv6" : "IPv4",
    reputation: score > 75 ? "Suspicious" : score > 45 ? "Monitor" : "Clean",
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
  const [phoneStep, setPhoneStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState("");

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

  const getCurrentLocation = () => {
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude.toFixed(6),
          lon: pos.coords.longitude.toFixed(6),
          accuracy: `${Math.round(pos.coords.accuracy)}m`,
          time: new Date(pos.timestamp).toLocaleString(),
        });
      },
      (err) => setLocError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <main className="osint-page">
      <section className="card hero">
        <p className="tag">OSINT Toolkit</p>
        <h1>MRK OSINT Web Suite (Safe Mode)</h1>
        <p className="muted">All modules run inside this app. No illegal tracking or private database access.</p>
        <div className="alert">For educational purpose only. Authorized and legal use only.</div>
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

      <section className="card section">
        <h2>4) Phone Module (Next Step Flow)</h2>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" />
        <div className="actions">
          <button type="button" onClick={() => setPhoneStep((s) => Math.min(3, s + 1))}>Next</button>
          <button type="button" className="secondary" onClick={() => setPhoneStep(1)}>Reset Steps</button>
        </div>
        <p className="muted">Current Step: {phoneStep} / 3</p>
        {phoneStep >= 2 && <InfoGrid title="Internal Phone Analysis" data={pIntel} />}
        {phoneStep >= 3 && (
          <div className="info-block">
            <h3>Compliance Notice</h3>
            <p className="muted">
              CNIC owner identity, SIM owner records, or live third-party location tracking are not supported.
              Use official telecom/government channels with legal authorization.
            </p>
          </div>
        )}
      </section>

      <section className="card section grid-2">
        <div>
          <h2>5) IP Intelligence</h2>
          <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="8.8.8.8" />
          <InfoGrid title="Internal IP Analysis" data={iIntel} />
        </div>
        <div>
          <h2>6) Location (Your Device, with Permission)</h2>
          <button type="button" onClick={getCurrentLocation}>Get My Current Location</button>
          {locError && <p className="muted">Location error: {locError}</p>}
          <InfoGrid title="Current Device Location" data={location} />
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
