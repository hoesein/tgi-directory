import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Directory API',
  description: 'Next.js backend for the Directory App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
