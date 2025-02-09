const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const cron = require('node-cron');
const moment = require('moment-timezone');
require('dotenv').config();

const express = require("express");
const app = express();
const port = 3000;
app.listen(port, () => console.log("Bot encendido"));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });

const mySecret = process.env.TOKEN;
const channelId = '1334412534127788043'; // Reemplázalo con el ID del canal donde quieres que se envíen los eventos
const roleId = '1334408903034667029'; // Reemplázalo con el ID del rol a mencionar en los recordatorios

const eventos = [
    { nombre: 'ROBO A VEHÍCULO', dias: [2, 3], horarios: ['22:00', '13:00', '15:00', '17:00'], duracion: 2, recordatorio: true },
    { nombre: 'MISIÓN DE TRÁFICO ILEGAL', dias: [1, 4, 6], horarios: ['06:00', '15:00', '23:43'], duracion: 3, recordatorio: false },
    { nombre: 'ROBO A NEGOCIO', dias: [1, 3, 5, 0], horarios: ['02:10', '10:00'], duracion: 11, recordatorio: true },
    { nombre: 'LANCHA ENCALLADA', dias: [1, 2, 5, 0], horarios: ['00:00', '14:00', '16:00', '18:00'], duracion: 2, recordatorio: true },
    { nombre: 'METAFETAMINA DIA 1', dias: [1], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'METAFETAMINA DIA 2', dias: [3], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'METAFETAMINA DIA 3', dias: [5], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'DIA RECOMPENSA', dias: [0], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'REPARTO AEREO', dias: [2, 5], horarios: ['07:00', '15:00', '20:00'], duracion: 3, recordatorio: true },
    { nombre: 'BUSQUEDA DE CONTENEDORES', dias: [4, 5], horarios: ['00:00', '15:00', '17:00', '19:00'], duracion: 2, recordatorio: true },
];

const eventosActivos = new Map();

client.once('ready', async () => {
    try {
        console.log('✅ Bot listo.');

        const canal = await client.channels.fetch(channelId).catch(err => console.error("❌ No se pudo obtener el canal:", err));
        if (!canal) return console.log("⚠️ Canal no encontrado.");

        eventos.forEach(evento => {
            if (evento.recordatorio) {
                evento.horarios.forEach(horario => {
                    const [hora, minuto] = horario.split(':');
                    console.log(`📅 Programando evento: ${evento.nombre} a las ${hora}:${minuto} en días ${evento.dias.join(',')}`);

                    cron.schedule(`${minuto} ${hora} * * ${evento.dias.join(',')}`, async () => {
                        console.log(`🔔 Enviando recordatorio: ${evento.nombre}`);
                        
                        const embed = new EmbedBuilder()
                            .setTitle(`⏰ Recordatorio de Evento`)
                            .setDescription(`**${evento.nombre}** ha comenzado. ¡No lo olvides!`)
                            .setColor(0xff0000)
                            .setTimestamp();

                        const mensaje = await canal.send({ content: `<@&${roleId}>`, embeds: [embed] });
                        await mensaje.react('✅');

                        eventosActivos.set(mensaje.id, { evento, mensaje });
                    });
                });
            }
        });
    } catch (error) {
        console.error('❌ Error al iniciar los eventos:', error);
    }
});

client.login(mySecret);
