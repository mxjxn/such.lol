import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ERC-20 Mint Extension - JokeRace',
  description: 'Mint winning JokeRace submissions as ERC-20 tokens using Clanker SDK',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
