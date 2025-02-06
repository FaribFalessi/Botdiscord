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
    { nombre: 'ROBO A VEHÍCULO', dias: [2, 3], horarios: ['23:00', '13:00', '15:00', '17:00'], duracion: 2, recordatorio: true },
    { nombre: 'MISIÓN DE TRÁFICO ILEGAL', dias: [1, 4, 6], horarios: ['07:00', '15:00', '20:00'], duracion: 3, recordatorio: false },
    { nombre: 'ROBO A NEGOCIO', dias: [1, 3, 5, 0], horarios: ['22:00', '10:00'], duracion: 11, recordatorio: true },
    { nombre: 'LANCHA ENCALLADA', dias: [1, 2, 5, 0], horarios: ['00:00', '14:00', '18:00'], duracion: 2, recordatorio: true },
    { nombre: 'METAFETAMINA DIA 1', dias: [1], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'METAFETAMINA DIA 2', dias: [3], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'METAFETAMINA DIA 3', dias: [5], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'DIA RECOMPENSA', dias: [0], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'REPARTO AEREO', dias: [2, 5], horarios: ['07:00', '15:00', '20:00'], duracion: 3, recordatorio: true },
    { nombre: 'BUSQUEDA DE CONTENEDORES', dias: [3, 5], horarios: ['00:00', '16:00', '18:00', '20:00'], duracion: 2, recordatorio: true },
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

function convertirHorarioArgentina(horario) {
    return moment.tz(horario, 'HH:mm', 'America/Argentina/Buenos_Aires').format('HH:mm');
}

eventos.forEach(evento => {
    evento.horarios = evento.horarios.map(horario => convertirHorarioArgentina(horario));
});

client.login(mySecret);
































/*const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const cron = require("node-cron");

const express = require("express");
const app = express();
const port = 3000;
app.listen(port, () => console.log("Bot encendido"));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.MessageReactions,
    ],
});

require("dotenv").config();
const mySecret = process.env.;

const channelID = "1334412534127788043"; // ID del canal donde se enviarán los mensajes

let lastMessages = {}; // Guarda los mensajes enviados por evento

client.once("ready", () => {
    console.log("✅ Bot en línea y programado.");

    const eventos = [
        { inicio: 23, duracion: 3, tipo: "ROBO A VEHÍCULO", dias: "2,3" },
        { inicio: 12, duracion: 3, tipo: "ROBO A VEHÍCULO", dias: "2,3" },
        { inicio: 15, duracion: 2, tipo: "ROBO A VEHÍCULO", dias: "2,3" },
        { inicio: 17, duracion: 2, tipo: "ROBO A VEHÍCULO", dias: "2,3" },
        {
            inicio: 7,
            duracion: 3,
            tipo: "MISIÓN DE TRÁFICO ILEGAL",
            dias: "1,4,6",
        },
        {
            inicio: 15,
            duracion: 3,
            tipo: "MISIÓN DE TRÁFICO ILEGAL",
            dias: "1,4,6",
        },
        {
            inicio: 20,
            duracion: 1,
            tipo: "MISIÓN DE TRÁFICO ILEGAL",
            dias: "1,4,6",
        },
        {
            inicio: 22,
            duracion: 12,
            tipo: "ROBO A NEGOCIO",
            dias: "0,1,3,5",
        },
        {
            inicio: 10,
            duracion: 11,
            tipo: "ROBO A NEGOCIO",
            dias: "0,1,3,5",
        },
        {
            inicio: 0,
            duracion: 2,
            tipo: "LANCHA ENCALLADA",
            dias: "0,1,2,5",
        },
        {
            inicio: 14,
            duracion: 2,
            tipo: "LANCHA ENCALLADA",
            dias: "0,1,2,5",
        },
        {
            inicio: 16,
            duracion: 2,
            tipo: "LANCHA ENCALLADA",
            dias: "0,1,2,5",
        },
        {
            inicio: 18,
            duracion: 2,
            tipo: "LANCHA ENCALLADA",
            dias: "0,1,2,5",
        },
        {
            inicio: 7,
            duracion: 3,
            tipo: "REPARTO AÉREO",
            dias: "5",
        }, // Viernes, 07:00 a 10:00
        {
            inicio: 15,
            duracion: 3,
            tipo: "REPARTO AÉREO",
            dias: "5",
        }, // Viernes, 15:00 a 18:00
        {
            inicio: 20,
            duracion: 1,
            tipo: "REPARTO AÉREO",
            dias: "5",
        }, // Viernes, 20:00 a 21:00
        {
            inicio: 0,
            duracion: 2,
            tipo: "BUSQUEDA DE CONTENEDORES",
            dias: "3,4,6,0",
        }, // Miércoles, jueves, sábado, domingo, de 00:00 a 02:00
        {
            inicio: 16,
            duracion: 2,
            tipo: "BUSQUEDA DE CONTENEDORES",
            dias: "3,4,6,0",
        }, // Miércoles, jueves, sábado, domingo, de 16:00 a 18:00
        {
            inicio: 18,
            duracion: 2,
            tipo: "BUSQUEDA DE CONTENEDORES",
            dias: "3,4,6,0",
        }, // Miércoles, jueves, sábado, domingo, de 18:00 a 20:00
        {
            inicio: 20,
            duracion: 1,
            tipo: "BUSQUEDA DE CONTENEDORES",
            dias: "3,4,6,0",
        }, // Miércoles, jueves, sábado, domingo, de 20:00 a 21:00
    ];

    // Aquí solo se programan los eventos que deseas, haciendo la validación
    eventos.filter(evento => 
        ["ROBO A VEHÍCULO", "ROBO A NEGOCIO", "LANCHA ENCALLADA", "REPARTO AÉREO", "BUSQUEDA DE CONTENEDORES"]
        .includes(evento.tipo)
    ).forEach((evento) => {
        cron.schedule(
            `0 ${evento.inicio} * * ${evento.dias}`,
            () => {
                iniciarRecordatorios(evento.duracion, evento.tipo);
            },
            {
                timezone: "America/Argentina/Buenos_Aires",
            }
        );
    });

    console.log("⏳ Eventos programados.");
});


client.on("messageCreate", async (message) => {
    if (message.content.toLowerCase() === "!tester robo a vehiculo") {
        console.log('🛠️ Probando evento "ROBO A VEHÍCULO"...');
        await iniciarRecordatorios(3, "ROBO A VEHÍCULO");
    }
    // Aquí otros comandos para probar eventos...
});

async function iniciarRecordatorios(duracionHoras, tipo) {
    const channel = await client.channels.fetch(channelID);
    if (!channel) {
        console.error("❌ Canal no encontrado.");
        return;
    }

    console.log(`🚀 Evento iniciado: ${tipo}. Enviando primer aviso...`);
    await enviarMensaje(channel, tipo);

    let horasTranscurridas = 0;
    const intervalo = setInterval(async () => {
        horasTranscurridas++;
        if (horasTranscurridas < duracionHoras) {
            console.log("🔔 Enviando recordatorio...");
            await enviarMensaje(channel, tipo, true);
        } else {
            clearInterval(intervalo);
            console.log(`✅ Fin del evento: ${tipo}.`);
        }
    }, 3600000); // Cada hora
}

async function enviarMensaje(channel, tipo, esRecordatorio = false) {
    try {
        // Si es un recordatorio y hay un mensaje anterior, intenta eliminarlo
        if (esRecordatorio && lastMessages[tipo]) {
            const mensajeAnterior = await channel.messages.fetch(lastMessages[tipo]);
            if (mensajeAnterior) {
                await mensajeAnterior.delete();
                console.log("🗑️ Mensaje anterior eliminado.");
            }
        }
    } catch (error) {
        console.error("⚠️ No se pudo eliminar el mensaje anterior:", error);
    }
  
    let embed;
    // Aquí, cada tipo de evento genera un embed diferente.
    if (tipo === "ROBO A VEHÍCULO") {
        embed = new EmbedBuilder()
            .setTitle("🚨 ROBO A VEHÍCULO 🚨")
            .setDescription(
                "*🟢 ACTIVIDAD ACTIVA*\n\n 🚗 Un robo a vehículo está en marcha. ¡Corre a hacerla antes de que sea tarde!",
            )
            .addFields({
                name: "🛠️ Requisitos",
                value: "*- Destornillador*",
                inline: true,
            })
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/5gsm8Rv.png")
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    } else if (tipo === "MISIÓN DE TRÁFICO ILEGAL") {
        embed = new EmbedBuilder()
            .setTitle("🚛 MISIÓN DE TRÁFICO ILEGAL 🚛")
            .setDescription(
                "*🔴 CONTRABANDO EN CURSO*\n\n 📦 Se está llevando a cabo una misión de tráfico ilegal. ¡Asegúrate de aprovechar la oportunidad!",
            )
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/ehjnbBA.png")
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    } else if (tipo === "ROBO A NEGOCIO") {
        embed = new EmbedBuilder()
            .setTitle("🚨 ROBO A NEGOCIO 🚨")
            .setDescription(
                "*🟡 ROBO A NEGOCIO EN CURSO*\n\n 🏢 ¡Un robo está en marcha! Prepárate para participar y asegurarte de conseguir lo que necesites.",
            )
            .addFields({
                name: "🛠️ Requisitos",
                value: "*- Tablet\n- Martillo\n- Plano Arquitectonico*\n",
                inline: true,
            })
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/jQ70zoJ.png") // Imagen proporcionada
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    } else if (tipo === "LANCHA ENCALLADA") {
        embed = new EmbedBuilder()
            .setTitle("🚤 LANCHA ENCALLADA 🚤")
            .setDescription(
                "*🟢 LANCHA ENCALLADA EN CURSO*\n\n 🛥️ ¡Una lancha está encallada! Corre a robar todo antes de que sea tarde.",
            )
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/OB7N1pJ.png") // Imagen proporcionada
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    } else if (tipo === "ELABORACIÓN DE METANFETAMINA (DÍA 1)") {
        embed = new EmbedBuilder()
            .setTitle("⚠️ ELABORACIÓN DE METANFETAMINA (DÍA 1) ⚠️")
            .setDescription(
                "*🟠 ACTIVIDAD ILÍCITA EN CURSO*\n\n 💉 ¡La elaboración de metanfetamina está en marcha! Recuerda guardar la toma fotográfica del proceso. 📷",
            )
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/DJ2Dtdi.png") // Imagen proporcionada
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    } else if (tipo === "ELABORACIÓN DE METANFETAMINA (DÍA 2)") {
        embed = new EmbedBuilder()
            .setTitle("⚠️ ELABORACIÓN DE METANFETAMINA (DÍA 2) ⚠️")
            .setDescription(
                "*🟠 ACTIVIDAD ILÍCITA EN CURSO*\n\n 💉 ¡La elaboración de metanfetamina continúa! Recuerda guardar la toma fotográfica. 📷",
            )
            .setColor(0xff0000)
            .setThumbnail("https://imgur.com/0d4irD5.png") // Imagen proporcionada
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    } else if (tipo === "ELABORACIÓN DE METANFETAMINA (DÍA 3)") {
        embed = new EmbedBuilder()
            .setTitle("⚠️ ELABORACIÓN DE METANFETAMINA (DÍA 3) ⚠️")
            .setDescription(
                "*🟠 ACTIVIDAD ILÍCITA EN CURSO*\n\n 💉 ¡Último día de la elaboración de metanfetamina! No olvides la toma fotográfica. 📷",
            )
            .setColor(0xff0000)
            .setThumbnail("https://imgur.com/Jtp0YSf.png") // Imagen proporcionada
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    } else if (tipo === "DÍA DE RECOMPENSA") {
        embed = new EmbedBuilder()
            .setTitle("🎉 DÍA DE RECOMPENSA 🎉")
            .setDescription(
                "*🟢 DÍA DE RECOMPENSA ACTIVADO*\n\n 🏆 ¡Hoy es el día de recompensa! Asegúrate de reclamar lo que te corresponde.",
            )
            .setColor(0xff0000)
            .setThumbnail("https://imgur.com/bgIU2ks.png") // Imagen proporcionada
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    } else if (tipo === "REPARTO AÉREO") {
        embed = new EmbedBuilder()
            .setTitle("🛸 REPARTO AÉREO 🛸")
            .setDescription(
                "*🔴 REPARTO AÉREO EN CURSO*\n\n 🚁 ¡El reparto aéreo está en marcha! No pierdas la oportunidad de participar.",
            )
            .setColor(0xff0000)
            .setThumbnail("https://imgur.com/l4Rb10G.png") // Imagen proporcionada
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    } else if (tipo === "BUSQUEDA DE CONTENEDORES") {
        embed = new EmbedBuilder()
            .setTitle("📦 BÚSQUEDA DE CONTENEDORES 📦")
            .setDescription(
                "*🟡 BÚSQUEDA DE CONTENEDORES EN CURSO*\n\n 🚢 ¡Busca los contenedores esparcidos por la ciudad!",
            )
            .addFields({
                name: "🛠️ Requisitos",
                value: "*- Taladro*",
                inline: true,
            })
            .setColor(0xff0000)
            .setThumbnail("https://imgur.com/hNlDRCG.png") // Imagen proporcionada
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    }

    // Enviar el mensaje
    try {
        lastMessages[tipo] = await channel.send({
            content: esRecordatorio
                ? "🔔 Recordatorio: ¡El evento sigue activo!"
                : "📢 Aviso para <@&1334408903034667029>!",
            embeds: [embed],
        });
        const mensaje = await channel.send({
            content: "🔔 Reacciona con ✅ cuando se haya completado la misión.",
        });
        await mensaje.react("✅");

        console.log("✅ Mensaje enviado.");

        // Definir el filtro
        const filter = (reaction, user) => {
            return reaction.emoji.name === '✅' && !user.bot; // Evita que el bot reaccione
        };

        // Crear el collector
        const collector = mensaje.createReactionCollector({ filter, max: 1, time: 60000 });

        // Cuando se recoge una reacción
        collector.on('collect', async (reaction, user) => {
            console.log(`${user.tag} marcó la misión como completada.`);
            await mensaje.delete(); // Borra el embed de reacción
            const msg = await channel.messages.fetch(lastMessages[tipo]);
            await msg.delete(); // Borra el mensaje principal
        });

        // Cuando se termina el collector (ya sea por tiempo o por reacción)
        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                console.log('⏱️ Tiempo agotado para reaccionar.');
            }
        });

    } catch (error) {
        console.error("⚠️ No se pudo enviar el mensaje:", error);
    }
}

console.log(":", mySecret ? "Cargado correctamente" : "No cargado");
client.login(mySecret);*/
