import type { Metadata } from 'next';
import './globals.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'FUTURE 3a10candidatesV2 — Audit-Ready 3(a)(10) Screener',
  description: 'Internal review-grade screening system for US Public Micro/Small-Cap 3(a)(10) debt settlement candidates ($100M Default Microcap Filter, Up to $500M Cap Ceiling).',
  keywords: ['3(a)(10)', 'SEC EDGAR', 'XBRL', 'Accounts Payable', 'Debt Settlement', 'Microcap Screener'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
