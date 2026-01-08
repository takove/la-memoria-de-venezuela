import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/public";

const API_URL = env.PUBLIC_API_URL || "http://localhost:3000/api/v1";

// Simple SVG-based OG image generator
function generateOGImage(official: {
  fullName?: string;
  status?: string;
  confidenceLevel?: number;
  sanctions?: Array<{ id: string; type: string }>;
}): string {
  const name = official.fullName || "Funcionario";
  const status = official.status || "unknown";
  const confidenceLevel = official.confidenceLevel || 3;

  // Status colors
  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: "#fee2e2", text: "#991b1b" },
    inactive: { bg: "#f3f4f6", text: "#374151" },
    deceased: { bg: "#1f2937", text: "#ffffff" },
    exiled: { bg: "#fef3c7", text: "#92400e" },
    imprisoned: { bg: "#fee2e2", text: "#991b1b" },
  };

  const statusLabels: Record<string, string> = {
    active: "Activo",
    inactive: "Inactivo",
    deceased: "Fallecido",
    exiled: "Exiliado",
    imprisoned: "Encarcelado",
  };

  const statusColor = statusColors[status] || statusColors.inactive;
  const statusLabel = statusLabels[status] || status;

  // Confidence badge
  const confidenceBadges = ["🔴", "🟠", "🟡", "🟢", "✅"];
  const validConfidence = Math.max(1, Math.min(5, confidenceLevel)); // Clamp to 1-5
  const confidenceBadge = confidenceBadges[validConfidence - 1] || "⚪";
  const confidenceText = `Confianza: ${validConfidence}/5`;

  // Generate SVG
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <!-- Background gradient -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#grad)"/>
      
      <!-- White overlay -->
      <rect x="50" y="50" width="1100" height="530" fill="white" rx="10"/>
      
      <!-- Header -->
      <text x="80" y="120" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#1f2937">
        La Memoria de Venezuela
      </text>
      
      <!-- Divider -->
      <line x1="80" y1="140" x2="1120" y2="140" stroke="#e5e7eb" stroke-width="2"/>
      
      <!-- Official Name -->
      <text x="80" y="250" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#111827">
        ${escapeXml(name.length > 25 ? name.substring(0, 25) + "..." : name)}
      </text>
      
      <!-- Status Badge -->
      <rect x="80" y="290" width="200" height="50" fill="${statusColor.bg}" rx="8"/>
      <text x="180" y="322" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="${statusColor.text}" text-anchor="middle">
        ${statusLabel}
      </text>
      
      <!-- Confidence Badge -->
      <text x="300" y="322" font-family="Arial, sans-serif" font-size="32">
        ${confidenceBadge}
      </text>
      <text x="350" y="322" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">
        ${confidenceText}
      </text>
      
      <!-- Sanctions count if available -->
      ${
        official.sanctions?.length
          ? `
        <text x="80" y="380" font-family="Arial, sans-serif" font-size="28" fill="#dc2626" font-weight="600">
          🚫 ${official.sanctions.length} ${official.sanctions.length === 1 ? "Sanción" : "Sanciones"}
        </text>
      `
          : ""
      }
      
      <!-- Footer -->
      <text x="80" y="540" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af">
        Base de datos de funcionarios del régimen venezolano
      </text>
    </svg>
  `.trim();

  return svg;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  try {
    // Fetch official data from API
    const response = await fetch(`${API_URL}/officials/${id}`);

    if (!response.ok) {
      throw error(404, "Official not found");
    }

    const official = await response.json();

    // Generate SVG
    const svg = generateOGImage(official);

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("Error generating OG image:", err);
    throw error(500, "Failed to generate OG image");
  }
};
