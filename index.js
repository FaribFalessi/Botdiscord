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
        // ... el resto de eventos
    ];

    eventos.forEach((evento) => {
        cron.schedule(
            `0 ${evento.inicio} * * ${evento.dias}`,
            () => {
                iniciarRecordatorios(evento.duracion, evento.tipo);
            },
            {
                timezone: "America/Argentina/Buenos_Aires",
            },
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
    // Intentamos eliminar el mensaje anterior solo si es un recordatorio
    if (!lastMessages[tipo] || !esRecordatorio) {
        try {
            if (lastMessages[tipo]) {
                const mensajeAnterior = await channel.messages.fetch(lastMessages[tipo]);
                if (mensajeAnterior) {
                    await mensajeAnterior.delete();
                    console.log("🗑️ Mensaje anterior eliminado.");
                }
            }
        } catch (error) {
            console.error("⚠️ No se pudo eliminar el mensaje anterior:", error);
        }
    }

    let embed;
    // Aquí, cada tipo de evento genera un embed diferente.
    if (tipo === "ROBO A VEHÍCULO") {
        embed = new EmbedBuilder()
            .setTitle("🚨 ROBO A VEHÍCULO 🚨")
            .setDescription(
                "*🟢 ACTIVIDAD ACTIVA*\n\n 🚗 Un robo a vehículo está en marcha. ¡Corre a hacerla antes de que sea tarde!"
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
                "*🔴 CONTRABANDO EN CURSO*\n\n 📦 Se está llevando a cabo una misión de tráfico ilegal. ¡Asegúrate de aprovechar la oportunidad!"
            )
            .setColor(0xff0000)
            .setThumbnail("https://i.imgur.com/ehjnbBA.png")
            .setFooter({
                text: "🔻 Atentamente Al Qaeda 🔻",
                iconURL:
                    "https://cdn-icons-png.flaticon.com/512/7175/7175311.png",
            });
    }
    // Agregar más tipos de eventos según sea necesario

    // Enviar el mensaje
    try {
        lastMessages[tipo] = await channel.send({
            content: esRecordatorio
                ? "🔔 *Recordatorio*: ¡El evento sigue activo! No olvides guardar la toma fotográfica. 📷"
                : "📢 *Aviso para <@&1334408903034667029>*!",
            embeds: [embed],
        });
        console.log("✅ Mensaje enviado.");
    } catch (error) {
        console.error("⚠️ No se pudo enviar el mensaje:", error);
    }
}

console.log("Token:", mySecret ? "Cargado correctamente" : "No cargado");
client.login(mySecret);
