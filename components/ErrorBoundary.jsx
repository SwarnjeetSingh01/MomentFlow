"use client";

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", background: "#050505", color: "#f5f5f5",
          fontFamily: "'Outfit', sans-serif", padding: "40px", textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", marginBottom: 20,
          }}>
            ⚠
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600, margin: "0 0 8px 0" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#999", fontSize: "0.9rem", maxWidth: 400, lineHeight: 1.5, margin: "0 0 24px 0" }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <code style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "12px 20px", fontSize: "0.78rem",
            color: "#ef4444", maxWidth: 500, overflowX: "auto", marginBottom: 24,
          }}>
            {this.state.error?.message || "Unknown error"}
          </code>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)", color: "#f5f5f5",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
