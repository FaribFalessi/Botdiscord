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

const EVENT_ROLE_ID = "1334408903034667029";  // Reemplaza con el ID del rol
const EVENT_CHANNEL_ID = "1334412534127788043";  // Reemplaza con el ID del canal

// Configuración de eventos
const EVENTS = [
    { 
        name: "Evento con recordatorios", 
        days: ["Sunday", "Tuesday"], 
        times: ["02:00", "08:40"], 
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

// Función para enviar eventos
async function sendEvent(event) {
    const channel = await client.channels.fetch(EVENT_CHANNEL_ID);
    if (!channel) return console.error("Canal no encontrado");

    const mention = `<@&${EVENT_ROLE_ID}> 🔔 **¡Atención! Se ha programado un nuevo evento.**`;
    await channel.send(mention);

    const embed = new EmbedBuilder()
        .setTitle(event.name)
        .setDescription(`Este evento ha comenzado y durará **${event.duration} horas**.`)
        .setColor('#ffcc00')
        .setTimestamp();

    const message = await channel.send({ embeds: [embed] });
    await message.react("✅");

    if (event.reminders) {
        scheduleReminders(event, message);
    }
}

// Función para programar recordatorios
function scheduleReminders(event, originalMessage) {
    let elapsed = 1;
    const reminderInterval = setInterval(async () => {
        if (elapsed >= event.duration) {
            clearInterval(reminderInterval);
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

        // Eliminar el mensaje anterior de recordatorio
        await originalMessage.delete().catch(() => {});
        originalMessage = newMessage;

        elapsed++;
    }, 60 * 60 * 1000);
}

// Función para verificar si es hora de enviar un evento
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

// Evento de inicio del bot
client.once('ready', async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    // Registrar comando /testevent en el servidor
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
    setInterval(checkEvents, 60 * 1000); // Verifica cada minuto
});

// Evento para eliminar mensaje cuando alguien reacciona con ✅
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.emoji.name === "✅") {
        await reaction.message.delete().catch(() => {});
    }
});

// Comando para testear eventos
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "testevent") {
        const eventName = interaction.options.getString("evento");

        // Buscar el evento por nombre
        const event = EVENTS.find(e => e.name.toLowerCase() === eventName.toLowerCase());

        if (!event) {
            return await interaction.reply({ content: "⚠️ Evento no encontrado. Usa un nombre válido.", ephemeral: true });
        }

        await sendEvent(event);
        await interaction.reply({ content: `✅ Evento **${event.name}** enviado correctamente.`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);


