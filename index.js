require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Partials, SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');

const express = require("express");
const app = express();
const port = 3000;
app.listen(port, () => console.log("Bot encendido"));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Reaction, Partials.User]
});

const EVENT_ROLE_ID = "1334408903034667029";
const EVENT_CHANNEL_ID = "1334412534127788043";

const EVENTS = [
    { name: "ROBO A VEHÍCULO", days: ["Sunday", "Tuesday"], times: ["02:00", "14:42"], duration: 3, reminders: true },
    { name: "MISIÓN DE TRÁFICO ILEGAL", days: ["Thursday"], times: ["15:00"], duration: 2, reminders: false }
];

// Función para obtener el embed según el evento
function getEventEmbed(eventName) {
    const eventEmbeds = {
        "ROBO A VEHÍCULO": {
            title: "🚨 ROBO A VEHÍCULO 🚨",
            description: "🚗 Un vehículo está siendo robado. ¡Únete a la acción antes de que sea tarde!",
            thumbnail: "https://i.imgur.com/5gsm8Rv.png"
        },
        "MISIÓN DE TRÁFICO ILEGAL": {
            title: "🚛 MISIÓN DE TRÁFICO ILEGAL 🚛",
            description: "🚛 Un nuevo cargamento ilegal debe ser transportado. ¡Ten cuidado con la policía!",
            thumbnail: "https://i.imgur.com/EXbQ7Mw.png"
        }
    };

    const data = eventEmbeds[eventName];
    if (!data) return null;

    return new EmbedBuilder()
        .setTitle(data.title)
        .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n${data.description}`)
        .setColor(0xff0000)
        .setThumbnail(data.thumbnail)
        .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
}

// Enviar evento
async function sendEvent(event) {
    const channel = await client.channels.fetch(EVENT_CHANNEL_ID);
    if (!channel) return console.error("Canal no encontrado");

    const mentionMessage = await channel.send(`<@&${EVENT_ROLE_ID}> 🔔 **¡Atención! Se ha programado un nuevo evento.**`);

    const embed = getEventEmbed(event.name);
    if (!embed) return console.error(`Embed no encontrado para el evento: ${event.name}`);

    const message = await channel.send({ embeds: [embed] });
    await message.react("✅");
}

function checkEvents() {
    const now = moment().tz("America/Argentina/Buenos_Aires");
    const currentDay = now.format("dddd");
    const currentTime = now.format("HH:mm");

    EVENTS.forEach(event => {
        if (event.days.includes(currentDay) && event.times.includes(currentTime)) {
            sendEvent(event);
        }
    });
}

client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    checkEvents();
    setInterval(checkEvents, 60 * 1000);
});

client.login(process.env.TOKEN);


