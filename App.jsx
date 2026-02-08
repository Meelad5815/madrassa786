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


function approximatePhoneArea(digits) {
  if (!digits) return { capability: "Unavailable", reason: "No number provided" };
  if (digits.startsWith("92")) return { capability: "Approx only", country: "Pakistan", area: "Unknown without telecom records" };
  if (digits.startsWith("91")) return { capability: "Approx only", country: "India", area: "Unknown without telecom records" };
  if (digits.startsWith("1")) return { capability: "Approx only", country: "US/Canada", area: "Unknown without telecom records" };
  return { capability: "Approx only", country: "Unknown", area: "Unknown without telecom records" };
}

function InfoGrid({ title, data }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="info-block">
      <h3>{title}</h3>
      <div className="result-grid">
        {Object.entries(data).map(([key, value]) => (
          <div className="result-item" key={key}>
            <strong>{key}</strong>
            <span>{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function App() {
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ip, setIp] = useState("");

  const [usernameWeb, setUsernameWeb] = useState(null);
  const [domainWeb, setDomainWeb] = useState(null);
  const [emailWeb, setEmailWeb] = useState(null);
  const [phoneWeb, setPhoneWeb] = useState(null);
  const [ipWeb, setIpWeb] = useState(null);
  const [status, setStatus] = useState("");

  const [notes, setNotes] = useState("");
  const [phoneStep, setPhoneStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState("");

  const usernameVariants = useMemo(() => makeUsernameVariants(username), [username]);

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(notes);
    } catch {
      // no-op
    }
  };

  const fetchUsernameData = async () => {
    if (!username.trim()) return;
    setStatus("Fetching username data...");
    try {
      const data = await fetchJson(`https://api.github.com/users/${username.trim()}`);
      setUsernameWeb({
        source: "GitHub API",
        login: data.login,
        name: data.name || "N/A",
        followers: data.followers,
        following: data.following,
        publicRepos: data.public_repos,
        location: data.location || "N/A",
      });
      setStatus("Username data loaded.");
    } catch (e) {
      setStatus(`Username fetch failed: ${e.message}`);
    }
  };

  const fetchDomainData = async () => {
    if (!domain.trim()) return;
    setStatus("Fetching domain data...");
    try {
      const data = await fetchJson(`https://rdap.org/domain/${domain.trim()}`);
      setDomainWeb({
        source: "RDAP",
        ldhName: data.ldhName || "N/A",
        handle: data.handle || "N/A",
        status: Array.isArray(data.status) ? data.status.join(", ") : "N/A",
        nameservers: Array.isArray(data.nameservers) ? data.nameservers.length : 0,
      });
      setStatus("Domain data loaded.");
    } catch (e) {
      setStatus(`Domain fetch failed: ${e.message}`);
    }
  };

  const fetchEmailData = async () => {
    if (!email.trim()) return;
    setStatus("Fetching email data...");
    try {
      const [verify, disposable] = await Promise.all([
        fetchJson(`https://api.eva.pingutil.com/email?email=${encodeURIComponent(email.trim())}`),
        fetchJson(`https://open.kickbox.com/v2/disposable/${encodeURIComponent(email.trim())}`),
      ]);
      setEmailWeb({
        source: "PingUtil + Kickbox",
        validSyntax: verify?.data?.valid_syntax,
        deliverable: verify?.data?.deliverable,
        domain: verify?.data?.domain || "N/A",
        disposable: disposable?.disposable,
      });
      setStatus("Email data loaded.");
    } catch (e) {
      setStatus(`Email fetch failed: ${e.message}`);
    }
  };

  const trackPhoneLocation = () => {
    if (!phone.trim()) return;
    const digits = phone.replace(/\D/g, "");
    const approx = approximatePhoneArea(digits);
    setPhoneWeb((prev) => ({
      ...(prev || {}),
      trackingResult: "Exact live tracking by phone number is not available in this app.",
      approximateCountry: approx.country,
      approximateArea: approx.area,
      legalPath: "Use authorized telecom/law-enforcement channels for lawful requests.",
    }));
    setStatus("Phone tracking request handled with legal-safe response.");
  };

  const fetchPhoneData = async () => {
    if (!phone.trim()) return;
    setStatus("Fetching phone data...");
    const digits = phone.replace(/\D/g, "");
    try {
      const data = await fetchJson(`https://htmlweb.ru/geo/api.php?json&telcod=${digits}`);
      setPhoneWeb({
        source: "htmlweb phone geo",
        normalized: digits,
        country: data?.country?.name || "N/A",
        region: data?.region?.name || "N/A",
        operator: data?.["0"]?.oper || data?.oper || "N/A",
      });
      setStatus("Phone data loaded.");
    } catch (e) {
      setPhoneWeb({ source: "Web API", normalized: digits, note: "Public phone API unavailable in this environment." });
      setStatus(`Phone fetch limited: ${e.message}`);
    }
  };

  const fetchIpData = async () => {
    if (!ip.trim()) return;
    setStatus("Fetching IP data...");
    try {
      const data = await fetchJson(`https://ipapi.co/${ip.trim()}/json/`);
      setIpWeb({
        source: "ipapi.co",
        ip: data.ip,
        city: data.city || "N/A",
        region: data.region || "N/A",
        country: data.country_name || "N/A",
        org: data.org || "N/A",
      });
      setStatus("IP data loaded.");
    } catch (e) {
      setStatus(`IP fetch failed: ${e.message}`);
    }
  };

  const getCurrentLocation = () => {
    setLocError("");
    if (!navigator.geolocation) return setLocError("Geolocation is not supported in this browser.");
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
        <h1>MRK OSINT Web Suite (Web Fetch Mode)</h1>
        <p className="muted">Fetches public OSINT data from web APIs directly inside your website.</p>
        <div className="alert">For educational purpose only. Authorized and legal use only.</div>
        {status && <p className="muted">{status}</p>}
      </section>

      <section className="card section">
        <h2>1) Username Intelligence</h2>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. octocat" />
        <div className="actions">
          <button type="button" onClick={fetchUsernameData}>Fetch Username Data</button>
        </div>
        <div className="stack">
          {usernameVariants.map((handle) => <div key={handle} className="variant-row"><span>@{handle}</span></div>)}
        </div>
        <InfoGrid title="Username Web Results" data={usernameWeb} />
      </section>

      <section className="card section grid-2">
        <div>
          <h2>2) Domain Intelligence</h2>
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
          <div className="actions"><button type="button" onClick={fetchDomainData}>Fetch Domain Data</button></div>
          <InfoGrid title="Domain Web Results" data={domainWeb} />
        </div>
        <div>
          <h2>3) Email Intelligence</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="target@domain.com" />
          <div className="actions"><button type="button" onClick={fetchEmailData}>Fetch Email Data</button></div>
          <InfoGrid title="Email Web Results" data={emailWeb} />
        </div>
      </section>

      <section className="card section">
        <h2>4) Phone Module (Next Step Flow)</h2>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" />
        <div className="actions">
          <button type="button" onClick={() => setPhoneStep((s) => Math.min(3, s + 1))}>Next</button>
          <button type="button" className="secondary" onClick={() => setPhoneStep(1)}>Reset Steps</button>
          <button type="button" onClick={fetchPhoneData}>Fetch Phone Data</button>
          <button type="button" className="secondary" onClick={trackPhoneLocation}>Track by Number</button>
        </div>
        <p className="muted">Current Step: {phoneStep} / 3</p>
        {phoneStep >= 2 && <InfoGrid title="Phone Web Results" data={phoneWeb} />}
        {phoneStep >= 3 && <p className="muted">CNIC/SIM ownership data is not provided by this app.</p>}
      </section>

      <section className="card section grid-2">
        <div>
          <h2>5) IP Intelligence</h2>
          <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="8.8.8.8" />
          <div className="actions"><button type="button" onClick={fetchIpData}>Fetch IP Data</button></div>
          <InfoGrid title="IP Web Results" data={ipWeb} />
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
