import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jarvis AI - Ultron Assistant',
  description: 'A modern, high-performance AI chat interface powered by OpenRouter and Ultron Intelligence.',
  keywords: ['AI', 'Jarvis', 'ChatGPT', 'OpenRouter', 'Ultron', 'Next.js', 'LLM'],
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#070a11] text-slate-100 min-h-screen selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
