import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Discerned — Signal, not noise.',
  description: 'A value-attribution layer for the web. Clip, rate, broadcast.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="style-editorial">{children}</body>
    </html>
  );
}
