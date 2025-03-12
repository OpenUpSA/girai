"use client"

import { useEffect } from "react";

export default function Home() {

  // Embeds /public/chat.js which is produced from /embed/
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/chat.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="p-8 font-[family-name:var(--font-dm-sans)] text-md">
      <h1 className="text-2xl">Demo of GIRAI Chat Embed</h1>
      <p>This is a demo page that embeds the GIRAI chatbot. You should see it in the bottom right.</p>
      <p>You can embed it using <a href="https://girai.openup.org.za/chat.js">https://girai.openup.org.za/chat.js</a>:</p>
      <pre className="bg-sky-900 p-4 font-[family-name:var(--font-dm-mono)]">&lt;script src=&quot;https://girai.openup.org.za/chat.js&quot;&gt;&lt;script&gt;</pre>
      <p className="mt-4">Made by <a href="https://openup.org.za/" className="underline">OpenUp.org.za</a></p>
    </main>
  );
}
