const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
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
    ],
});

require("dotenv").config();
const mySecret = process.env.TOKEN;

const channelID = "1334412534127788043";

let lastMessages = {};

client.once("ready", () => {
    console.log("✅ Bot en línea y programado.");


const moment = require('moment-timezone');

// Definir los eventos
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
        inicio: 5,
        duracion: 16,
        tipo: "ELABORACIÓN DE METANFETAMINA (DÍA 1)",
        dias: "1",
    }, // Lunes, de 05:00 a 21:00
    {
        inicio: 5,
        duracion: 16,
        tipo: "ELABORACIÓN DE METANFETAMINA (DÍA 2)",
        dias: "3",
    }, // Miércoles, de 05:00 a 21:00
    {
        inicio: 5,
        duracion: 16,
        tipo: "ELABORACIÓN DE METANFETAMINA (DÍA 3)",
        dias: "5",
    }, // Viernes, de 05:00 a 21:00
    { inicio: 5, duracion: 16, tipo: "DÍA DE RECOMPENSA", dias: "0" }, // Domingo, de 05:00 a 21:00
    { inicio: 7, duracion: 3, tipo: "REPARTO AÉREO", dias: "5" }, // Viernes, 07:00 a 10:00
    { inicio: 15, duracion: 3, tipo: "REPARTO AÉREO", dias: "5" }, // Viernes, 15:00 a 18:00
    { inicio: 20, duracion: 1, tipo: "REPARTO AÉREO", dias: "5" }, // Viernes, 20:00 a 21:00
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

// Función para enviar mensajes (simulación, reemplázalo con tu código real)
async function enviarMensaje(channel, tipoEvento, esRecordatorio) {
    const embed = {
        title: `Recordatorio: ${tipoEvento}`,
        description: esRecordatorio ? "Es hora de un evento." : "Este es el evento.",
        color: esRecordatorio ? "#FF0000" : "#00FF00",
        timestamp: new Date(),
    };
    
    await channel.send({ embed });
}

// Función que verifica los eventos usando la hora de Argentina
async function verificarEventos() {
    const now = moment().tz('America/Argentina/Buenos_Aires'); // Hora de Argentina
    const diaSemana = now.day(); // Día de la semana (0 es domingo, 1 es lunes, etc.)
    const horaActual = now.hour(); // Hora actual en formato de 24 horas

    for (const evento of eventos) {
        // Verifica si el día actual está en el rango de los días del evento
        if (evento.dias.split(",").includes(diaSemana.toString())) {
            const horaInicio = evento.inicio; // Hora de inicio del evento
            const horaFin = evento.inicio + evento.duracion; // Hora de fin del evento

            // Si la hora actual está dentro del rango del evento
            if (horaActual >= horaInicio && horaActual < horaFin) {
                // Obtener canal (simulado)
                const channel = await obtenerCanal(); // Reemplaza esta función con la lógica para obtener el canal

                // Enviar recordatorio
                const esRecordatorio = true; // Siempre será un recordatorio
                await enviarMensaje(channel, evento.tipo, esRecordatorio);
            }
        }
    }
}

// Llamamos a esta función periódicamente para verificar los eventos (cada minuto, por ejemplo)
setInterval(verificarEventos, 60000); // 60000 ms = 1 minuto

// Simulación de la función para obtener el canal
async function obtenerCanal() {
    // Esta función debe devolver el canal adecuado donde enviar los mensajes
    // Aquí está solo como ejemplo
    return { send: async (message) => console.log(message) };
}
// Llamamos a esta función periódicamente para verificar los eventos (cada minuto, por ejemplo)
setInterval(verificarEventos, 60000); // 60000 ms = 1 minuto

// Simulación de la función para obtener el canal
async function obtenerCanal() {
    // Esta función debe devolver el canal adecuado donde enviar los mensajes
    // Aquí está solo como ejemplo
    return { send: async (message) => console.log(message) };
}


client.on("messageCreate", async (message) => {
    if (message.content.toLowerCase() === "!tester robo a vehiculo") {
        console.log('🛠️ Probando evento "ROBO A VEHÍCULO"...');
        await iniciarRecordatorios(3, "ROBO A VEHÍCULO");
    }
    if (message.content.toLowerCase() === "!tester mision de trafico ilegal") {
        console.log('🛠️ Probando evento "MISIÓN DE TRÁFICO ILEGAL"...');
        await iniciarRecordatorios(3, "MISIÓN DE TRÁFICO ILEGAL");
    }
    if (message.content.toLowerCase() === "!tester robo a negocio") {
        console.log('🛠️ Probando evento "ROBO A NEGOCIO"...');
        await iniciarRecordatorios(12, "ROBO A NEGOCIO");
    }
    if (message.content.toLowerCase() === "!tester lancha encallada") {
        console.log('🛠️ Probando evento "LANCHA ENCALLADA"...');
        await iniciarRecordatorios(2, "LANCHA ENCALLADA");
    }
    if (
        message.content.toLowerCase() === "!tester elaboracion de metanfetamina"
    ) {
        console.log(
            '🛠️ Probando evento "ELABORACIÓN DE METANFETAMINA (DÍA 1)"...',
        );
        await iniciarRecordatorios(16, "ELABORACIÓN DE METANFETAMINA (DÍA 1)");
    }
    if (
        message.content.toLowerCase() ===
        "!tester elaboracion de metanfetamina dia 2"
    ) {
        console.log(
            '🛠️ Probando evento "ELABORACIÓN DE METANFETAMINA (DÍA 2)"...',
        );
        await iniciarRecordatorios(16, "ELABORACIÓN DE METANFETAMINA (DÍA 2)");
    }
    if (
        message.content.toLowerCase() ===
        "!tester elaboracion de metanfetamina dia 3"
    ) {
        console.log(
            '🛠️ Probando evento "ELABORACIÓN DE METANFETAMINA (DÍA 3)"...',
        );
        await iniciarRecordatorios(16, "ELABORACIÓN DE METANFETAMINA (DÍA 3)");
    }
    if (message.content.toLowerCase() === "!tester dia de recompensa") {
        console.log('🛠️ Probando evento "DÍA DE RECOMPENSA"...');
        await iniciarRecordatorios(16, "DÍA DE RECOMPENSA");
    }
    if (message.content.toLowerCase() === "!tester reparto aereo") {
        console.log('🛠️ Probando evento "REPARTO AÉREO"...');
        await iniciarRecordatorios(3, "REPARTO AÉREO");
    }
    if (message.content.toLowerCase() === "!tester busqueda de contenedores") {
        console.log('🛠️ Probando evento "BUSQUEDA DE CONTENEDORES"...');
        await iniciarRecordatorios(3, "BUSQUEDA DE CONTENEDORES");
    }
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
    }, 3600000);
}

async function enviarMensaje(channel, tipo, esRecordatorio = false) {
    if (!lastMessages[tipo] || !esRecordatorio) {
        try {
            if (lastMessages[tipo]) {
                await lastMessages[tipo].delete();
                console.log("🗑️ Mensaje anterior eliminado.");
            }
        } catch (error) {
            console.error("⚠️ No se pudo eliminar el mensaje anterior:", error);
        }
    }

    let embed;

    // Condiciones para el tipo de evento
    if (tipo === "ROBO A VEHÍCULO") {
        embed = new EmbedBuilder()
            .setTitle("🚨 ROBO A VEHÍCULO 🚨")
            .setDescription(
                "**🟢 ACTIVIDAD ACTIVA**\n\n 🚗 Un robo a vehículo está en marcha. ¡Corre a hacerla antes de que sea tarde!",
            )
            .addFields({
                name: "🛠️ Requisitos",
                value: "**- Destornillador**",
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
                "**🔴 CONTRABANDO EN CURSO**\n\n 📦 Se está llevando a cabo una misión de tráfico ilegal. ¡Asegúrate de aprovechar la oportunidad!",
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
                "**🟡 ROBO A NEGOCIO EN CURSO**\n\n 🏢 ¡Un robo está en marcha! Prepárate para participar y asegurarte de conseguir lo que necesites.",
            )
            .addFields({
                name: "🛠️ Requisitos",
                value: "**- Tablet**\n**- Martillo**\n**- Plano Arquitectonico**\n",
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
                "**🟢 LANCHA ENCALLADA EN CURSO**\n\n 🛥️ ¡Una lancha está encallada! Corre a robar todo antes de que sea tarde.",
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
                "**🟠 ACTIVIDAD ILÍCITA EN CURSO**\n\n 💉 ¡La elaboración de metanfetamina está en marcha! Recuerda guardar la toma fotográfica del proceso. 📷",
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
                "**🟠 ACTIVIDAD ILÍCITA EN CURSO**\n\n 💉 ¡La elaboración de metanfetamina continúa! Recuerda guardar la toma fotográfica. 📷",
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
                "**🟠 ACTIVIDAD ILÍCITA EN CURSO**\n\n 💉 ¡Último día de la elaboración de metanfetamina! No olvides la toma fotográfica. 📷",
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
                "**🟢 DÍA DE RECOMPENSA ACTIVADO**\n\n 🏆 ¡Hoy es el día de recompensa! Asegúrate de reclamar lo que te corresponde.",
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
                "**🔴 REPARTO AÉREO EN CURSO**\n\n 🚁 ¡El reparto aéreo está en marcha! No pierdas la oportunidad de participar.",
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
                "**🟡 BÚSQUEDA DE CONTENEDORES EN CURSO**\n\n 🚢 ¡Busca los contenedores esparcidos por la ciudad!",
            )
            .addFields({
                name: "🛠️ Requisitos",
                value: "**- Taladro**",
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
    lastMessages[tipo] = await channel.send({
        content: esRecordatorio
            ? "🔔 **Recordatorio**: ¡El evento sigue activo! No olvides guardar la toma fotográfica. 📷"
            : "📢 **Aviso para <@&1334408903034667029>**!",
        embeds: [embed],
    });
    console.log("✅ Mensaje enviado.");
}

console.log("Token:", mySecret ? "Cargado correctamente" : "No cargado");
client.login(mySecret);
