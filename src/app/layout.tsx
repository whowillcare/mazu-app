import type { Metadata } from 'next';
import './globals.css';
import './admin.css';

export const metadata: Metadata = {
  title: 'Mazu Sixty Jiazi Lots · 媽祖六十甲子靈籤 | Cultural Oracle & Reflective Guidance',
  description:
    'Experience the Sixty Jiazi Lots of the Mazu temple tradition. Draw a lot, explore unrhymed contemplative verses, and read in the light of your natal Four Pillars.',
  keywords: [
    'Mazu 60 Lots',
    '媽祖靈籤',
    'Sixty Jiazi',
    'BaZi Four Pillars',
    'Taoist Oracle',
    'Cultural Heritage',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="celestial-bg" />
        <div className="celestial-stars" />
        {children}
      </body>
    </html>
  );
}
