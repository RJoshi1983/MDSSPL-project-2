import Link from 'next/link';
import { SERVICES } from '@/modules/registry';
import { svcStyle } from '@/lib/ui';
import { DemoBanner } from '@/components/AppShell';

// The public front page: choose a sign-in portal.
export default function Home() {
  return (
    <>
      <DemoBanner />
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div>
              <div className="logo" style={{ marginBottom: 24 }}>MDSSPL</div>
              <h1>MDSSPL Service Hub</h1>
              <p>One hub for every sustainability service, from data entry to verified report.</p>
            </div>
            {/* Cover art from the design system: the hub as a grid of service modules, one verified */}
            <svg className="hero-art" viewBox="0 0 480 288" width="480" height="288" aria-hidden="true">
              <rect className="deep" x="16" y="32" width="144" height="224" rx="16" />
              <rect className="brand" x="40" y="200" width="24" height="24" rx="4" />
              <rect className="brand" x="72" y="200" width="24" height="24" rx="4" />
              <rect className="soft" x="104" y="200" width="24" height="24" rx="4" />
              <rect className="brand" x="176" y="32" width="144" height="144" rx="16" />
              <rect className="soft" x="336" y="32" width="64" height="64" rx="8" />
              <rect className="soft" x="416" y="32" width="64" height="64" rx="8" />
              <rect className="soft" x="336" y="112" width="64" height="64" rx="8" />
              <rect className="ok" x="416" y="112" width="64" height="64" rx="8" />
              <rect className="soft" x="176" y="192" width="64" height="64" rx="8" />
              <rect className="soft" x="256" y="192" width="64" height="64" rx="8" />
              <rect className="soft" x="336" y="192" width="144" height="64" rx="8" />
            </svg>
          </div>
          <div className="portal-cards">
            <Link className="portal" href="/sign-in/client">
              <h3>Client sign-in</h3>
              <p className="muted">Enter your organisation&apos;s data and download your reports. New clients can register here.</p>
            </Link>
            <Link className="portal" href="/sign-in/staff">
              <h3>Staff &amp; verifier sign-in</h3>
              <p className="muted">MDSSPL consultants and third-party verifiers review and verify projects.</p>
            </Link>
            <Link className="portal" href="/sign-in/admin">
              <h3>Admin sign-in</h3>
              <p className="muted">Manage users, roles and every project.</p>
            </Link>
          </div>
        </div>
      </section>
      <main className="page">
        <h2>Our services</h2>
        <div className="grid">
          {SERVICES.map((s) => (
            <div key={s.id} className="tile" style={svcStyle(s)}>
              <span className="short">{s.short}</span>
              <h3>{s.name}</h3>
              <p>{s.summary}</p>
              <span className="caption">{s.standards.join(' · ')}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
