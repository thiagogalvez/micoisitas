const crypto = require('crypto');
const axios = require('axios');

// Função para gerar o hash SHA-256
const generateHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Função para lidar com a requisição
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse o corpo da requisição
    const body = JSON.parse(event.body);
    const { lead_id, event_name, lead_event_source, event_source } = body;

    // Gerar o timestamp atual
    const event_time = Math.floor(Date.now() / 1000);

    // Criar payload para a API do Meta
    const payload = {
      data: [
        {
          event_name: event_name || 'Lead', // Use 'Lead' como valor padrão
          event_time: event_time,
          action_source: 'system_generated', // Ou outro valor adequado
          user_data: {
            lead_id: lead_id ? generateHash(lead_id.toString()) : null,
          },
          custom_data: {
            lead_event_source: lead_event_source || 'Your CRM',
            event_source: event_source || 'crm',
          },
        },
      ],
    };

    // Enviar payload para a API de Conversão do Meta
    const response = await axios.post(`https://graph.facebook.com/v13.0/1064184408385925/events`, payload, {
      headers: {
        Authorization: `Bearer IEAALb96W0Gk4BOwX8j3tLMkZAQcry5SVH1ECA8F4EK9s5FpIeGWDVffq6KtScFGWcGiwKmE5LcMc1v7yTMNeegxzTeYTTgWNhlXx2ZBLvQibBDoApMo5xYZAaRSX8MjceSW3SWqP4RhZBwOsZAlenkJS60UpAjNJfsRRjQOx2Ul7NqFVUhBkyMgi8ZCgJqeDOzCVgZDZD`,
        'Content-Type': 'application/json',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Evento enviado com sucesso', data: response.data }),
    };
  } catch (error) {
    console.error('Erro ao enviar evento:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao enviar evento', error: error.message }),
    };
  }
};
