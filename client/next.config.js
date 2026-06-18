/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a fully static site (HTML/CSS/JS) in the `out/` folder.
  // This lets the game run on any static host (Hostinger shared hosting)
  // with no Node.js server. Single-player vs AI is 100% client-side.
  output: "export",

  // Static hosts can't run Next.js image optimization.
  images: { unoptimized: true },

  // Emit each route as a folder with index.html (clean URLs on static hosts).
  trailingSlash: true,

  env: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001",
    // Multiplayer needs the Socket.io backend. Disabled for the static build
    // since shared hosting can't run it. Set to "true" when a backend exists.
    NEXT_PUBLIC_ENABLE_MULTIPLAYER: process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER || "false",
  },
};

module.exports = nextConfig;
