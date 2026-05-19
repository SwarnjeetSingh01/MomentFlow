export const metadata = {
  title: "Urban Sketcher — AI Content Intelligence",
  description:
    "4-agent AI pipeline for urban sketching creators — powered by OpenAI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
