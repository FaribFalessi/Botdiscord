const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const moment = require('moment-timezone');
require('dotenv').config();

const express = require("express");
const app = express();
const port = 3000;
app.listen(port, () => console.log("Bot encendido"));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });

const mySecret = process.env.TOKEN;
const channelId = '1334412534127788043';
const roleId = '1334408903034667029';

const eventos = [
    { nombre: 'ROBO A VEHÍCULO', dias: [2, 3], horarios: ['22:00', '13:00', '15:00', '17:00'], recordatorio: true },
    { nombre: 'MISIÓN DE TRÁFICO ILEGAL', dias: [1, 4, 6], horarios: ['06:00', '15:00', '23:37'], recordatorio: false },
    { nombre: 'ROBO A NEGOCIO', dias: [1, 3, 5, 0], horarios: ['02:10', '10:00'], recordatorio: true },
];

const eventosActivos = new Map();

client.once('ready', async () => {
    console.log('✅ Bot listo.');
    const canal = await client.channels.fetch(channelId);

    eventos.forEach(evento => {
        if (evento.recordatorio) {
            evento.horarios.forEach(horario => {
                const [hora, minuto] = horario.split(':');

                cron.schedule(`${minuto} ${hora} * * ${evento.dias.join(',')}`, async () => {
                    const mensaje = await canal.send(`⏰ Recordatorio: **${evento.nombre}** ha comenzado. ¡No lo olvides!`);
                    eventosActivos.set(mensaje.id, { evento, mensaje });
                });
            });
        }
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'testearevento') {
        const eventoNombre = interaction.options.getString('evento');
        const evento = eventos.find(e => e.nombre.toLowerCase() === eventoNombre.toLowerCase());

        if (!evento) {
            await interaction.reply({ content: '❌ Evento no encontrado.', ephemeral: true });
            return;
        }

        const canal = await client.channels.fetch(channelId);
        if (!canal) return;

        await canal.send(`📣 El evento **${evento.nombre}** ha comenzado <@&${roleId}>`);

        const embed = new EmbedBuilder()
            .setTitle(`🚨 ${evento.nombre} 🚨`)
            .setDescription(`*🟢 ACTIVIDAD ACTIVA*
            
📢 ¡Participa en el evento antes de que termine!`)
            .setColor(0xff0000)
            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });

        const mensaje = await canal.send({ embeds: [embed] });
        await mensaje.react('✅');
        eventosActivos.set(mensaje.id, { evento, mensaje });
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.emoji.name === '✅' && eventosActivos.has(reaction.message.id)) {
        const { mensaje } = eventosActivos.get(reaction.message.id);
        await mensaje.delete().catch(() => {});
        eventosActivos.delete(reaction.message.id);
    }
});

function convertirHorarioArgentina(horario) {
    return moment.tz(horario, 'HH:mm', 'America/Argentina/Buenos_Aires').format('HH:mm');
}

eventos.forEach(evento => {
    evento.horarios = evento.horarios.map(horario => convertirHorarioArgentina(horario));
});

client.login(mySecret);
