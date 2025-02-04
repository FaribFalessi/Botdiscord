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
    { nombre: 'ROBO A VEHÍCULO', dias: [2, 3], horarios: ['23:00', '12:00', '15:00', '17:00'], duracion: 3, recordatorio: true },
    { nombre: 'MISIÓN DE TRÁFICO ILEGAL', dias: [1, 4, 6], horarios: ['07:00', '15:00', '20:00'], duracion: 3, recordatorio: true },
    { nombre: 'ROBO A NEGOCIO', dias: [1, 3, 5, 0], horarios: ['22:00', '10:00'], duracion: 12, recordatorio: true },
    { nombre: 'EVENTO PERSONALIZABLE', dias: [0, 2, 4], horarios: ['18:00'], duracion: 4, recordatorio: false },
];

const eventosActivos = new Map();

client.once('ready', async () => {
    try {
        const guild = client.guilds.cache.get('1036393864497475674'); // Reemplaza con el ID de tu servidor

        if (!guild) {
            console.log('❌ No se pudo encontrar la guild con ese ID');
            return;
        }

        // Verifica si el comando ya está registrado
        const commands = await guild.commands.fetch();
        if (!commands.some(cmd => cmd.name === 'testearevento')) {
            // Registra el comando solo en este servidor específico
            await guild.commands.create(
                new SlashCommandBuilder()
                    .setName('testearevento')
                    .setDescription('Envía un evento de prueba')
                    .addStringOption(option => 
                        option.setName('evento')
                            .setDescription('Nombre del evento a probar')
                            .setRequired(true)
                    )
            );
            console.log('✅ Comando registrado en el servidor.');
        } else {
            console.log('⚠️ El comando "testearevento" ya está registrado.');
        }
    } catch (error) {
        console.error('❌ Error al intentar registrar el comando:', error);
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
                    .setColor(0xff8c00)
                    .setThumbnail("https://i.imgur.com/3Z5ZfmN.png")
                    .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
                break;
            case 'ROBO A NEGOCIO':
                embed = new EmbedBuilder()
                    .setTitle(`🏪 ROBO A NEGOCIO 🏪`)
                    .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n 🏪 Se está ejecutando un robo a un comercio. ¡Corre antes de que llegue la policía!`)
                    .setColor(0xff4500)
                    .setThumbnail("https://i.imgur.com/qYOI6Rb.png")
                    .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
                break;
            default:
                embed = new EmbedBuilder()
                    .setTitle(`❓ ${evento.nombre} ❓`)
                    .setDescription(`*🟢 ACTIVIDAD ACTIVA*\n\n ❓ Un evento misterioso ha comenzado. ¡Descúbrelo tú mismo!`)
                    .setColor(0x00ff00)
                    .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
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
        await reaction.message.delete().catch(() => {});
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
