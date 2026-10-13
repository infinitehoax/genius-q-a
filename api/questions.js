export const config = {
  runtime: 'edge', // This forces it to run on Vercel's Edge network (bypasses Cloudflare)
};

export default async function handler(request) {
  // Parse URL parameters in Edge runtime
  const { searchParams } = new URL(request.url);
  const song_id = searchParams.get('song_id');

  if (!song_id) {
    return new Response(JSON.stringify({ error: "Missing song_id parameter" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const targetUrl = `https://genius.com/api/questions?song_id=${song_id}`;

  // Perfectly mimic a real Google Chrome browser
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://genius.com/',
    'Origin': 'https://genius.com',
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin'
  };

  try {
    // Attempt 1: Direct fetch via Vercel Edge (Usually succeeds)
    let res = await fetch(targetUrl, { headers });
    
    // Attempt 2: Auto-fallback to public scrape proxy if Attempt 1 gets 403 Forbidden
    if (!res.ok) {
      res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
    }

    // Attempt 3: Final fallback to a secondary proxy
    if (!res.ok) {
      res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
    }

    // If it still fails, return the error
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `All fetch attempts blocked by Cloudflare. Status: ${res.status}` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await res.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
