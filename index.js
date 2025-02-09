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
    { nombre: 'MISIÓN DE TRÁFICO ILEGAL', dias: [1, 4, 6], horarios: ['06:00', '15:00', '23:21'], duracion: 3, recordatorio: false },
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

        const canal = await client.channels.fetch(channelId);

        eventos.forEach(evento => {
            if (evento.recordatorio) {
                evento.horarios.forEach(horario => {
                    const [hora, minuto] = horario.split(':');

                    cron.schedule(`${minuto} ${hora} * * ${evento.dias.join(',')}`, async () => {
                        const mensaje = await canal.send(`⏰ Recordatorio: **${evento.nombre}** ha comenzado. ¡No lo olvides!`);

                        // Guardar el mensaje en eventosActivos para eliminarlo si es necesario
                        eventosActivos.set(mensaje.id, { evento, mensaje });
                    });
                });
            }
        });

    } catch (error) {
        console.error('❌ Error al iniciar los eventos:', error);
    }
});

let isProcessing = false; // Variable para controlar si el bot está procesando un comando

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'testearevento') {
        const eventoNombre = interaction.options.getString('evento');
        const evento = eventos.find(e => e.nombre.toLowerCase() === eventoNombre.toLowerCase());

        if (!evento) {
            await interaction.reply({ content: '❌ Evento no encontrado.', flags: 64 });
            return;
        }

        const canal = await client.channels.fetch(channelId);
        if (!canal) return;

        await canal.send(`📣 El evento **${evento.nombre}** ha comenzado <@&${roleId}>`);

        let embed;
        switch (evento.nombre) {
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
                    .setDescription(`🟢 ACTIVIDAD ACTIVA*\n\n ⛵ Una lancha ha encallado y necesita ser recuperada. ¡No dejes pasar la oportunidad!`)
                    .setColor(0xff0000)
                    .setThumbnail("https://i.imgur.com/NpHargJ.png")
                    .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
                break;
            case 'METAFETAMINA DIA 1':
                embed = new EmbedBuilder()
                    .setTitle(`🧪 ELABORACION DE METANFETAMINA DÍA 1 🧪`)
                    .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🏭 Se ha iniciado el proceso de elaboración de metanfetamina. ¡Asegúrate de que todo salga bien!\n\n \`\`\`yaml\nRecordatorio: Llevar la Fotografía\`\`\``)
                    .setColor(0xff0000)
                    .setThumbnail("https://i.imgur.com/TFtgsfa.png")
                    .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
                break;
            case 'METAFETAMINA DIA 2':
                embed = new EmbedBuilder()
                    .setTitle(`🧪 ELABORACION DE METANFETAMINA DÍA 2 🧪`)
                    .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🔬 El proceso de purificación de la metanfetamina está en marcha. ¡No la arruines!\n\n \`\`\`yaml\nRecordatorio: Llevar la Fotografía\`\`\``)
                    .setColor(0xff0000)
                    .setThumbnail("https://i.imgur.com/OFDgC6v.png")
                    .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
                break;
            case 'METAFETAMINA DIA 3':
                embed = new EmbedBuilder()
                    .setTitle(`🧪 ELABORACION DE METANFETAMINA DÍA 3 🧪`)
                    .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🚨 El producto final está casi listo. ¡Hora de empaquetar y pronto se podrá distribuir!\n\n \`\`\`yaml\nRecordatorio: Llevar la Fotografía\`\`\``)
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

        // Solo se hace deferReply si la respuesta va a tomar más tiempo.
        if (!interaction.replied) {
            await interaction.deferReply({ flags: 64 }); // Para notificar que el bot está procesando
        }

        const mensaje = await canal.send({ embeds: [embed] });
        await mensaje.react('✅');
        eventosActivos.set(mensaje.id, { evento, mensaje });

        await interaction.followUp({ content: `✅ Evento **${evento.nombre}** enviado correctamente.`, flags: 64 });
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.emoji.name === '✅' && eventosActivos.has(reaction.message.id)) {
        // Obtener el objeto asociado al mensaje de evento activo
        const { evento, mensaje, recordatorioMensaje } = eventosActivos.get(reaction.message.id);

        // Borrar el mensaje del embed de evento
        await mensaje.delete().catch(() => {});

        // Borrar el mensaje de notificación del evento
        const canal = await client.channels.fetch(channelId);
        const notificacionMensaje = await canal.messages.fetch({ limit: 1, before: mensaje.id });
        if (notificacionMensaje.size > 0) {
            await notificacionMensaje.first().delete().catch(() => {});
        }

        // Borrar el mensaje de recordatorio si existe
        if (recordatorioMensaje) {
            await recordatorioMensaje.delete().catch(() => {});
        }

        // Eliminar el evento activo del mapa
        eventosActivos.delete(reaction.message.id);
    }
});

eventos.forEach(evento => {
    if (evento.recordatorio) {
        evento.horarios.forEach(horario => {
            const horarioArgentina = moment.tz(horario, 'HH:mm', 'America/Argentina/Buenos_Aires');
            const hora = horarioArgentina.hour();
            const minuto = horarioArgentina.minute();

            cron.schedule(`${minuto} ${hora} * * ${evento.dias.join(',')}`, async () => {
            console.log(`📅 Enviando recordatorio para ${evento.nombre} a las ${hora}:${minuto}`);
            const mensaje = await canal.send(`⏰ Recordatorio: **${evento.nombre}** ha comenzado. ¡No lo olvides!`);
            eventosActivos.set(mensaje.id, { evento, mensaje });
            });

        });
    }
});


client.login(mySecret);
