require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Partials, SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { InteractionType } = require('discord.js');

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

// Eventos con los días, horarios y si tienen recordatorios o no
const EVENTS = [
    { nombre: 'ROBO A VEHÍCULO', dias: [2, 3], horarios: ['22:00', '13:00', '15:00', '17:00'], duracion: 2, recordatorio: true },
    { nombre: 'MISIÓN DE TRÁFICO ILEGAL', dias: [1, 4, 6], horarios: ['06:00', '15:00', '20:00'], duracion: 3, recordatorio: false },
    { nombre: 'ROBO A NEGOCIO', dias: [1, 3, 5, 0], horarios: ['02:10', '10:00'], duracion: 11, recordatorio: true },
    { nombre: 'LANCHA ENCALLADA', dias: [1, 2, 5, 0], horarios: ['00:00', '14:00', '16:00', '18:00'], duracion: 2, recordatorio: true },
    { nombre: 'METAFETAMINA DIA 1', dias: [1], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'METAFETAMINA DIA 2', dias: [3], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'METAFETAMINA DIA 3', dias: [5], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'DIA RECOMPENSA', dias: [0], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'REPARTO AEREO', dias: [2, 5], horarios: ['07:00', '15:00', '20:00'], duracion: 3, recordatorio: true },
    { nombre: 'BUSQUEDA DE CONTENEDORES', dias: [4, 5], horarios: ['00:00', '15:00', '17:00', '19:00'], duracion: 2, recordatorio: true }
];

// Mapas para gestionar eventos activos y recordatorios
const activeEvents = new Map();  // Guarda mensajes de eventos activos
const activeReminders = new Map();  // Guarda los intervalos de recordatorios

async function sendEvent(event) {
    const channel = await client.channels.fetch(EVENT_CHANNEL_ID);
    if (!channel) return console.error("Canal no encontrado");

    const mentionMessage = await channel.send(`<@&${EVENT_ROLE_ID}> 🔔 **¡Atención! Se ha programado un nuevo evento.**`);

    let embed;
    switch (event.nombre) {
    case 'ROBO A VEHÍCULO':
        embed = new EmbedBuilder()
            .setTitle(`🚨 ROBO A VEHÍCULO 🚨`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🚗 Un vehículo está siendo robado. ¡Únete a la acción antes de que sea tarde!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/5gsm8Rv.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
    case 'MISIÓN DE TRÁFICO ILEGAL':
        embed = new EmbedBuilder()
            .setTitle(`🚛 MISIÓN DE TRÁFICO ILEGAL 🚛`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🚛 Un nuevo cargamento ilegal debe ser transportado. ¡Ten cuidado con la policía!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/EXbQ7Mw.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
    case 'ROBO A NEGOCIO':
        embed = new EmbedBuilder()
            .setTitle(`🏪 ROBO A NEGOCIO 🏪`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🏪 Se está ejecutando un robo a un comercio. ¡Corre antes de que llegue la policía!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/JQRIWS1.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
    case 'LANCHA ENCALLADA':
        embed = new EmbedBuilder()
            .setTitle(`⛵ LANCHA ENCALLADA ⛵`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n ⛵ Una lancha ha encallado y necesita ser recuperada. ¡No dejes pasar la oportunidad!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/NpHargJ.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
    case 'METAFETAMINA DIA 1':
        embed = new EmbedBuilder()
            .setTitle(`🧪 ELABORACION DE METANFETAMINA DÍA 1 🧪`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🏭 Se ha iniciado el proceso de elaboración de metanfetamina. ¡Asegúrate de que todo salga bien!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/TFtgsfa.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
    case 'METAFETAMINA DIA 2':
        embed = new EmbedBuilder()
            .setTitle(`🧪 ELABORACION DE METANFETAMINA DÍA 2 🧪`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🔬 El proceso de purificación de la metanfetamina está en marcha. ¡No la arruines!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/OFDgC6v.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
    case 'METAFETAMINA DIA 3':
        embed = new EmbedBuilder()
            .setTitle(`🧪 ELABORACION DE METANFETAMINA DÍA 3 🧪`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🚨 El producto final está casi listo. ¡Hora de empaquetar y pronto se podrá distribuir!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/agBM4x3.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
    case 'DIA RECOMPENSA':
        embed = new EmbedBuilder()
            .setTitle(`🎁 DÍA DE RECOMPENSA 🎁`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🎉 Hoy es un día especial. ¡Reclama la Metanfetamina para poder distribuirla!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/0yrrHut.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
    case 'REPARTO AEREO':
        embed = new EmbedBuilder()
            .setTitle(`✈️ REPARTO AÉREO ✈️`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 📦 Un cargamento está siendo distribuido por vía aérea. ¡Asegura tu parte antes de que otros lo hagan!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/4XBgoke.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
    case 'BUSQUEDA DE CONTENEDORES':
        embed = new EmbedBuilder()
            .setTitle(`📦 BÚSQUEDA DE CONTENEDORES 📦`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🏗️ Un contenedor valioso ha sido perdido en la zona portuaria. ¡Encuéntralo antes que los demás!`)
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/f2xplUC.png")
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
        break;
}

    const message = await channel.send({ embeds: [embed] });
    await message.react("✅");

    // Guardar la referencia del mensaje de evento y de la mención
    activeEvents.set(message.id, { mentionMessage, event, reacted: false });

    if (event.recordatorio) {
        // Iniciar recordatorios
        const interval = setInterval(async () => {
            const newEmbed = new EmbedBuilder(embed)
                .setTitle(`⏰ Recordatorio: ${event.nombre} ⏰`)
                .setDescription(`*🟠 Recordatorio: El evento sigue activo: ${event.nombre}.*\n\n ¡No olvides unirte antes de que termine!`)
                .setColor(0xff6600);

            // Eliminar el embed original antes de enviar el nuevo
            await message.delete();
            const updatedMessage = await channel.send({ embeds: [newEmbed] });
            await updatedMessage.react("✅");
            activeEvents.set(updatedMessage.id, { mentionMessage, event, reacted: false });
        }, 3600000);  // Recordatorio cada hora
        activeReminders.set(message.id, interval);
    }

    // Eliminar el mensaje después de la duración del evento (en milisegundos)
    const eventDurationInMs = event.duracion * 60 * 60 * 1000;  // Duración en milisegundos
    setTimeout(async () => {
        const eventData = activeEvents.get(message.id);
        if (eventData && !eventData.reacted) {
            // Eliminar el mensaje de evento y la mención si no hubo reacciones
            await message.delete();
            await eventData.mentionMessage.delete();

            // Limpiar el recordatorio si existe
            const interval = activeReminders.get(message.id);
            if (interval) {
                clearInterval(interval);
                activeReminders.delete(message.id);
            }

            // Eliminar el evento activo
            activeEvents.delete(message.id);
        }
    }, eventDurationInMs);
}

// Reacciona con ✅ para eliminar el mensaje
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.emoji.name === '✅' && !user.bot) {
        const messageId = reaction.message.id;
        const eventData = activeEvents.get(messageId);

        if (eventData) {
            // Marcar como reaccionado
            eventData.reacted = true;

            // Eliminar el mensaje de evento
            await reaction.message.delete();
            // Eliminar el mensaje de mención
            await eventData.mentionMessage.delete();
            // Limpiar el recordatorio si existe
            const interval = activeReminders.get(messageId);
            if (interval) {
                clearInterval(interval);
                activeReminders.delete(messageId);
            }
            // Eliminar el evento activo
            activeEvents.delete(messageId);
        }
    }
});

// Comando para testear el evento y recordatorio
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'testevent') {
            const event = EVENTS[0];  // Puedes modificarlo para probar diferentes eventos
            await sendEvent(event);
            await interaction.reply("Evento de prueba enviado.");
        }
    }
});

// Iniciar bot
client.login(process.env.TOKEN);
