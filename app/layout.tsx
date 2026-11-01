import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MDSSPL Service Hub',
  description: 'Sustainability services — GHG, ESG, BRSR, ZWTL, LCA/PCF, Water, CNA, Net Zero and Energy Audit.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
