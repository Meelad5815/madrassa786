import React, { useMemo, useState } from "react";

const quickTools = [
  {
    title: "Username Footprint",
    description: "Generate likely handles and quickly pivot to major platforms.",
  },
  {
    title: "Domain Recon",
    description: "Build fast links for WHOIS, DNS, SSL certificate and archive checks.",
  },
  {
    title: "Email Intel",
    description: "Prepare breach, gravatar and verification pivots in one click.",
  },
  {
    title: "IP & Infrastructure",
    description: "Open reputation and geolocation resources for an IP address.",
  },
];

function makeUsernameVariants(input) {
  const clean = input.trim().toLowerCase().replace(/\s+/g, "");
  if (!clean) return [];

  const separators = ["", ".", "_", "-"];
  const years = ["", "786", "123", "24", "2026"];
  const variants = new Set();

  separators.forEach((sep) => {
    years.forEach((year) => {
      variants.add(`${clean}${sep}${year}`.replace(/[._-]$/, ""));
    });
  });

  variants.add(clean.replace(/[aeiou]/g, ""));
  variants.add(clean.split("").reverse().join(""));

  return [...variants].filter(Boolean).slice(0, 24);
}

function ExternalLink({ href, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="chip">
      {label}
    </a>
  );
}

export default function App() {
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ip, setIp] = useState("");

  const usernameVariants = useMemo(() => makeUsernameVariants(username), [username]);

  return (
    <main className="osint-page">
      <section className="hero card">
        <p className="tag">OSINT Toolkit</p>
        <h1>MRK OSINT Web Suite</h1>
        <p>
          Ethical intelligence toolkit for investigators, journalists, cyber learners, and SOC teams.
          Use only with legal authorization.
        </p>
        <div className="tool-grid">
          {quickTools.map((tool) => (
            <article key={tool.title} className="mini-card">
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card section">
        <h2>1) Username Footprint</h2>
        <div className="field-row">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter name or handle (e.g. meelad786)"
          />
        </div>
        <div className="chip-wrap">
          {usernameVariants.map((handle) => (
            <ExternalLink key={handle} href={`https://github.com/${handle}`} label={`GitHub: ${handle}`} />
          ))}
          {usernameVariants.length === 0 && <p className="muted">Enter a username to generate variants.</p>}
        </div>
      </section>

      <section className="card section">
        <h2>2) Domain Recon</h2>
        <div className="field-row">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
          />
        </div>
        <div className="chip-wrap">
          <ExternalLink href={`https://who.is/whois/${domain}`} label="WHOIS" />
          <ExternalLink href={`https://dnschecker.org/all-dns-records-of-domain.php?query=${domain}`} label="DNS Records" />
          <ExternalLink href={`https://crt.sh/?q=${domain}`} label="SSL Certificates" />
          <ExternalLink href={`https://web.archive.org/web/*/${domain}`} label="Wayback History" />
          <ExternalLink href={`https://www.virustotal.com/gui/domain/${domain}`} label="VirusTotal" />
        </div>
      </section>

      <section className="card section">
        <h2>3) Email Intelligence</h2>
        <div className="field-row">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="target@email.com"
          />
        </div>
        <div className="chip-wrap">
          <ExternalLink href={`https://haveibeenpwned.com/unifiedsearch/${email}`} label="Breach Check" />
          <ExternalLink href={`https://www.gravatar.com/${email}`} label="Gravatar Probe" />
          <ExternalLink href={`https://hunter.io/email-verifier/${email}`} label="Verifier" />
        </div>
      </section>

      <section className="card section split">
        <div>
          <h2>4) Phone Intel</h2>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+923001234567"
          />
          <div className="chip-wrap">
            <ExternalLink href={`https://www.truecaller.com/search/pk/${phone}`} label="Truecaller" />
            <ExternalLink href={`https://sync.me/search/?number=${phone}`} label="Sync.me" />
          </div>
        </div>
        <div>
          <h2>5) IP Intelligence</h2>
          <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="8.8.8.8" />
          <div className="chip-wrap">
            <ExternalLink href={`https://www.abuseipdb.com/check/${ip}`} label="AbuseIPDB" />
            <ExternalLink href={`https://www.shodan.io/host/${ip}`} label="Shodan" />
            <ExternalLink href={`https://ipinfo.io/${ip}`} label="IPInfo" />
          </div>
        </div>
      </section>

      <section className="card footer-note">
        <h3>Investigation Workflow</h3>
        <ol>
          <li>Start with username and email pivots.</li>
          <li>Correlate domain + certificate trails.</li>
          <li>Enrich infrastructure with IP reputation.</li>
          <li>Document findings with source timestamps.</li>
        </ol>
      </section>
    </main>
  );
}
