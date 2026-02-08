# MRK OSINT Web Suite

A React + Vite OSINT dashboard that fetches public data from web APIs and displays it inside your website.

> For educational purpose only.

## Features

- Username fetch (GitHub public API)
- Domain fetch (RDAP)
- Email checks (PingUtil + Kickbox disposable)
- Phone lookup (public phone geo API where available)
- IP lookup (ipapi.co)
- Browser geolocation for current device (with permission)
- Case notes copy/clear workflow

## Notes

- Some APIs may fail due to CORS, rate limits, or network restrictions.
- CNIC/SIM owner private databases are not integrated.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
