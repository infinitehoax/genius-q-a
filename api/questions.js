export default async function handler(req, res) {
  const { song_id } = req.query;

  if (!song_id) {
    return res.status(400).json({ error: "Missing song_id parameter" });
  }

  try {
    const geniusRes = await fetch(`https://genius.com/api/questions?song_id=${encodeURIComponent(song_id)}`, {
      headers: {
        // Standard browser user-agent to bypass basic bot filtering
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!geniusRes.ok) {
      return res.status(geniusRes.status).json({ error: `Genius API returned ${geniusRes.status}` });
    }

    const data = await geniusRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
