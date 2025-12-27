export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, username, score, timeLeft, won } = req.body;
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.ADMIN_CHAT_ID;
  
  if (!botToken || !adminChatId) {
    console.error("Missing Environment Variables: Check TELEGRAM_BOT_TOKEN and ADMIN_CHAT_ID");
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Construct the message for the Admin
  // We use tg://user?id= to create a clickable link to the player's profile
  let messageText = `📡 <b>INCOMING GAME REPORT</b>\n\n`;
  messageText += `👤 <b>Player:</b> <a href="tg://user?id=${userId}">${username || 'Unknown'}</a>\n`;
  messageText += `🆔 <b>ID:</b> <code>${userId}</code>\n`;
  messageText += `➖➖➖➖➖➖➖➖\n`;
  
  if (won) {
    messageText += `🟢 <b>RESULT: SUCCESS</b>\n`;
    messageText += `💰 <b>Score:</b> $${score}\n`;
    messageText += `⏱ <b>Time Remaining:</b> ${timeLeft}s\n`;
  } else {
    messageText += `🔴 <b>RESULT: FAILED</b>\n`;
    messageText += `💰 <b>Score:</b> $${score}\n`;
    messageText += `💀 <b>Cause:</b> Flatlined\n`;
  }

  try {
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId, // Sending to YOU (The Admin)
        text: messageText,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API Error:", data);
      return res.status(502).json({ message: 'Failed to send report' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
