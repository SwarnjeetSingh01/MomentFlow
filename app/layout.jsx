import './globals.css';

import { AuthProvider } from '../context/AuthContext';
import { SpeedInsights } from "@vercel/speed-insights/next";
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata = {
  title: "MomentFlows — AI Content Intelligence",
  description:
    "5-agent AI pipeline for urban sketching creators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
        <SpeedInsights />
      </body>
    </html>
  );
}
