# MRK OSINT Web Suite

A React + Vite OSINT dashboard that fetches public data from web APIs and displays it inside your website.

> For educational purpose only.

## Features

- Username fetch (GitHub public API)
- Domain fetch (RDAP)
- Email checks (PingUtil + Kickbox disposable)
- Phone lookup (public phone geo API where available)
- Phone provider connectors with API key:
  - Veriphone
  - AbstractAPI Phone Validation
  - Truecaller/etc website mode guidance
- Phone number "Track by Number" returns only approximate country hints, not exact live tracking
- IP lookup (ipapi.co)
- Browser geolocation for current device (with permission)
- Case notes copy/clear workflow

## Notes

- Some APIs may fail due to CORS, rate limits, invalid API keys, or network restrictions.
- Truecaller and similar websites generally block direct client-side scraping/fetch due to auth/CORS protections.
- CNIC/SIM owner private databases are not integrated.
- Exact live tracking from a phone number is not provided; lawful telecom channels are required.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
