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

    const moment = require("moment-timezone");

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
        },
        {
            inicio: 5,
            duracion: 16,
            tipo: "ELABORACIÓN DE METANFETAMINA (DÍA 2)",
            dias: "3",
        },
        {
            inicio: 5,
            duracion: 16,
            tipo: "ELABORACIÓN DE METANFETAMINA (DÍA 3)",
            dias: "5",
        },
        { inicio: 5, duracion: 16, tipo: "DÍA DE RECOMPENSA", dias: "0" },
        { inicio: 7, duracion: 3, tipo: "REPARTO AÉREO", dias: "5" },
        { inicio: 15, duracion: 3, tipo: "REPARTO AÉREO", dias: "5" },
        { inicio: 20, duracion: 1, tipo: "REPARTO AÉREO", dias: "5" },
        {
            inicio: 0,
            duracion: 2,
            tipo: "BUSQUEDA DE CONTENEDORES",
            dias: "3,4,6,0",
        },
        {
            inicio: 16,
            duracion: 2,
            tipo: "BUSQUEDA DE CONTENEDORES",
            dias: "3,4,6,0",
        },
        {
            inicio: 18,
            duracion: 2,
            tipo: "BUSQUEDA DE CONTENEDORES",
            dias: "3,4,6,0",
        },
        {
            inicio: 20,
            duracion: 1,
            tipo: "BUSQUEDA DE CONTENEDORES",
            dias: "3,4,6,0",
        },
    ];

    // Función para enviar mensajes (simulación, reemplázalo con tu código real)
    async function enviarMensaje(channel, tipoEvento, esRecordatorio) {
        const embed = new EmbedBuilder()
            .setTitle(`Recordatorio: ${tipoEvento}`)
            .setDescription(esRecordatorio ? "Es hora de un evento." : "Este es el evento.")
            .setColor(esRecordatorio ? "#FF0000" : "#00FF00")
            .setTimestamp(new Date());

        await channel.send({ embeds: [embed] });
    }

    // Función que verifica los eventos usando la hora de Argentina
    async function verificarEventos() {
        const now = moment().tz("America/Argentina/Buenos_Aires"); // Hora de Argentina
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
});

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
});

async function iniciarRecordatorios(hora, tipoEvento) {
    let count = 0;
    let interval = setInterval(async () => {
        if (count === 4) {
            clearInterval(interval);
            return;
        }

        console.log(`🕰️ Recordatorio de: ${tipoEvento}`);
        // Simular el envío de un mensaje
        await enviarMensaje(channelID, tipoEvento, true);
        count++;
    }, hora * 3600000); // Convertir hora a milisegundos
};

client.login(mySecret);
