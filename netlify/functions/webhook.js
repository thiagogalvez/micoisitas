const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/netlify/functions/webhook', async (req, res) => {
  const { email, event_name, currency, value, business_name, contact } = req.body;

  // Gera o hash SHA-256 do email
  const emailHash = email ? crypto.createHash('sha256').update(email).digest('hex') : '';

  // Gera o timestamp atual (em segundos desde o Epoch)
  const event_time = Math.floor(Date.now() / 1000);

  // Monta o payload para o evento
  const payload = {
    data: [
      {
        event_name: event_name || "Iniciou",
        event_time: event_time,
        action_source: 'website',
        event_source_url: 'https://app.hidrabeauty.uk/maquininha-ton', // Página de onde vem o evento
        user_data: {
          em: emailHash,
          fn: business_name || '',  // Nome do negócio
          ph: contact || ''         // Contato (telefone, por exemplo)
        },
        custom_data: {
          currency: currency || 'BRL',  // Moeda (BRL por padrão)
          value: value || 0             // Valor do evento
        }
      }
    ]
  };

  try {
    // Envia para a API de Conversão da Meta
    const response = await axios.post(`https://graph.facebook.com/v13.0/1064184408385925/events`, payload, {
      headers: {
        Authorization: `Bearer IEAALb96W0Gk4BOwX8j3tLMkZAQcry5SVH1ECA8F4EK9s5FpIeGWDVffq6KtScFGWcGiwKmE5LcMc1v7yTMNeegxzTeYTTgWNhlXx2ZBLvQibBDoApMo5xYZAaRSX8MjceSW3SWqP4RhZBwOsZAlenkJS60UpAjNJfsRRjQOx2Ul7NqFVUhBkyMgi8ZCgJqeDOzCVgZDZD`
      }
    });

    res.status(200).json({ message: 'Evento enviado com sucesso', data: response.data });
  } catch (error) {
    console.error('Erro ao enviar evento:', error);
    res.status(500).json({ message: 'Erro ao enviar evento', error: error.message });
  }
});

// Inicia o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
