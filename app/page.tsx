import { redirect } from 'next/navigation';

// The home page "/" is served from public/mdsspl.html (see next.config.js).
// This file only exists as a fallback and sends visitors to the classic hub.
export default function Home() {
  redirect('/classic');
}
