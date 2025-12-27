export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, username, score, timeLeft, won } = req.body;

  // Security Check: Ideally, you should validate Telegram's 'initData' hash here 
  // to prevent spoofing, but for this simple example we will proceed.
  
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN is missing in environment variables.");
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Construct the message
  let messageText = "";
  if (won) {
    messageText = `🏆 <b>MISSION SUCCESS!</b>\n\n`;
    messageText += `👤 <b>Operative:</b> @${username || 'Unknown'} (ID: <code>${userId}</code>)\n`;
    messageText += `💰 <b>Loot Secured:</b> $${score}\n`;
    messageText += `⏱ <b>Time Left:</b> ${timeLeft}s\n\n`;
    messageText += `<i>"The data has been extracted."</i>`;
  } else {
    messageText = `💀 <b>MISSION FAILED</b>\n\n`;
    messageText += `👤 <b>Operative:</b> @${username || 'Unknown'} (ID: <code>${userId}</code>)\n`;
    messageText += `💰 <b>Recovered:</b> $${score}\n`;
    messageText += `<i>Signal lost...</i>`;
  }

  try {
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userId, // Send back to the user's private chat
        text: messageText,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API Error:", data);
      return res.status(502).json({ message: 'Failed to send Telegram message' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
