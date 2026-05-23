export const metadata = {
  title: "Urban Sketcher — AI Content Intelligence",
  description:
    "5-agent AI pipeline for urban sketching creators — powered by Claude.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0a0a', overflowX: 'hidden' }}>{children}</body>
    </html>
  );
}
