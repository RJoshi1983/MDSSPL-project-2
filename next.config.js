/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        // The MDSSPL Service Hub app (single page, from the Claude artifact) is the home page.
        { source: '/', destination: '/mdsspl.html' },
        // The app was written for Netlify; these addresses are answered by this server instead.
        { source: '/.netlify/functions/ai', destination: '/api/ai' },
        { source: '/.netlify/functions/supabase-config', destination: '/api/supabase-config' },
      ],
    };
  },
};
