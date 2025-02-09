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

const EVENT_ROLE_ID = "1334408903034667029";  // ID del rol a mencionar
const EVENT_CHANNEL_ID = "1334412534127788043";  // ID del canal donde se envían los eventos

const EVENTS = [
    { 
        name: "Evento con recordatorios", 
        days: ["Sunday", "Tuesday"], 
        times: ["02:00", "12:00"], 
        duration: 3, 
        reminders: true 
    },
    { 
        name: "Evento sin recordatorios", 
        days: ["Thursday"], 
        times: ["15:00"], 
        duration: 2, 
        reminders: false 
    }
];

// Mapas para gestionar eventos activos y recordatorios
const activeEvents = new Map();  // Guarda mensajes de eventos activos
const activeReminders = new Map();  // Guarda los intervalos de recordatorios

async function sendEvent(event) {
    const channel = await client.channels.fetch(EVENT_CHANNEL_ID);
    if (!channel) return console.error("Canal no encontrado");

    const mentionMessage = await channel.send(`<@&${EVENT_ROLE_ID}> 🔔 **¡Atención! Se ha programado un nuevo evento.**`);

    const embed = new EmbedBuilder()
        .setTitle(event.name)
        .setDescription(`Este evento ha comenzado y durará **${event.duration} horas**.`)
        .setColor('#ffcc00')
        .setTimestamp();

    const message = await channel.send({ embeds: [embed] });
    await message.react("✅");

    // Guardar la referencia del mensaje de evento y de la mención
    activeEvents.set(message.id, { mentionMessage, event });

    if (event.reminders) {
        scheduleReminders(event, message);
    }
}

function scheduleReminders(event, originalMessage) {
    let elapsed = 1;
    
    const reminderInterval = setInterval(async () => {
        if (elapsed >= event.duration) {
            clearInterval(reminderInterval);
            activeReminders.delete(event.name);
            return;
        }

        const channel = await client.channels.fetch(EVENT_CHANNEL_ID);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle(`⏰ Recordatorio: ${event.name}`)
            .setDescription(`Han pasado **${elapsed} hora(s)** desde el inicio del evento.`)
            .setColor('#ff9900')
            .setTimestamp();

        const newMessage = await channel.send({ embeds: [embed] });
        await newMessage.react("✅");

        // Guardar el nuevo recordatorio en el mapa
        activeEvents.set(newMessage.id, { mentionMessage: originalMessage, event });

        await originalMessage.delete().catch(() => {});
        originalMessage = newMessage;

        elapsed++;
    }, 60 * 60 * 1000);

    activeReminders.set(event.name, reminderInterval);
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

client.once('ready', async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (guild) {
        await guild.commands.create(
            new SlashCommandBuilder()
                .setName("testevent")
                .setDescription("Envía un evento de prueba")
                .addStringOption(option => 
                    option.setName("evento")
                        .setDescription("Nombre del evento a probar")
                        .setRequired(true)
                )
        );
        console.log("✅ Comando /testevent registrado");
    }

    checkEvents();
    setInterval(checkEvents, 60 * 1000);
});

// Manejo de reacciones para detener recordatorios y eliminar mensajes del evento
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.emoji.name !== "✅") return;

    const eventData = activeEvents.get(reaction.message.id);
    if (!eventData) return;

    const { mentionMessage, event } = eventData;

    // Eliminar el mensaje de mención si existe
    if (mentionMessage) {
        await mentionMessage.delete().catch(() => {});
    }

    // Eliminar todos los mensajes asociados al evento
    for (const [msgId, data] of activeEvents) {
        if (data.event.name === event.name) {
            const msg = await reaction.message.channel.messages.fetch(msgId).catch(() => null);
            if (msg) await msg.delete().catch(() => {});
            activeEvents.delete(msgId);
        }
    }

    // Detener los recordatorios si existen
    if (activeReminders.has(event.name)) {
        clearInterval(activeReminders.get(event.name));
        activeReminders.delete(event.name);
    }

    // Eliminar el mensaje reaccionado
    await reaction.message.delete().catch(() => {});
});

// Comando de prueba para enviar eventos manualmente
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "testevent") {
        const eventName = interaction.options.getString("evento");
        const event = EVENTS.find(e => e.name.toLowerCase() === eventName.toLowerCase());

        if (!event) {
            return await interaction.reply({ content: "⚠️ Evento no encontrado. Usa un nombre válido.", ephemeral: true });
        }

        await sendEvent(event);
        await interaction.reply({ content: `✅ Evento **${event.name}** enviado correctamente.`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);


