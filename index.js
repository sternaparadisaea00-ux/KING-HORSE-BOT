
const express = require("express");
const pino = require("pino");

const app = express();

app.get("/", (req, res) => {
  res.send("👑 KING HORSE BOT IS ACTIVE 🐎");
});

app.listen(process.env.PORT || 3000);

async function startBot() {
  const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
  } = await import("@whiskeysockets/baileys");

  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["KING HORSE", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("👑 KING HORSE CONNECTED!");
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;

      if (code !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log("Session logged out. Scan a new QR.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const jid = msg.key.remoteJid;
      if (!jid || jid === "status@broadcast") continue;

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      if (!text.startsWith("..")) continue;

      const command = text.slice(2).trim().toLowerCase();

      if (command === "menu") {
        await sock.sendMessage(jid, {
          text: `👑 KING HORSE BOT 🐎

╭━━〔 MAIN MENU 〕━━╮
┃ ..menu
┃ ..alive
┃ ..ping
┃ ..owner
┃ ..joke
┃ ..groupinfo
┃ ..help
╰━━━━━━━━━━━━━━╯

🔥 POWERED BY KING HORSE
🐎 Your WhatsApp Assistant`
        });
      }

      else if (command === "alive") {
        await sock.sendMessage(jid, {
          text: "👑 KING HORSE IS ALIVE! 🐎🔥"
        });
      }

      else if (command === "ping") {
        await sock.sendMessage(jid, {
          text: "🏓 KING HORSE PONG! ⚡"
        });
      }

      else if (command === "owner") {
        await sock.sendMessage(jid, {
          text: "👑 OWNER: KING HORSE ADMIN"
        });
      }

      else if (command === "joke") {
        await sock.sendMessage(jid, {
          text: "😂 Kwa nini farasi hapendi kuchelewa? Kwa sababu hupenda kukimbia mbele!"
        });
      }

      else if (command === "groupinfo") {
        if (!jid.endsWith("@g.us")) {
          await sock.sendMessage(jid, {
            text: "Command hii inafanya kazi kwenye group tu."
          });
          continue;
        }

        const group = await sock.groupMetadata(jid);

        await sock.sendMessage(jid, {
          text: `👑 GROUP INFO

📛 Name: ${group.subject}
👥 Members: ${group.participants.length}
🐎 Bot: KING HORSE`
        });
      }

      else if (command === "help") {
        await sock.sendMessage(jid, {
          text: "👑 Tumia ..menu kuona commands zote za KING HORSE."
        });
      }
    }
  });
}

startBot().catch(console.error);
