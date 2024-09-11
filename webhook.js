const crypto = require('crypto');
const axios = require('axios');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  // Parse the request body
  const { event_name, email, currency, value, business_name, contact } = JSON.parse(event.body);

  // Generate SHA-256 hash of the email
  const emailHash = crypto.createHash('sha256').update(email).digest('hex');

  // Get the current timestamp in seconds
  const event_time = Math.floor(Date.now() / 1000);

  // Define the payload for Meta Conversion API
  const payload = {
    event_name: event_name,
    event_time: event_time,
    action_source: 'website',
    event_source_url: 'https://app.hidrabeauty.uk/maquininha-ton',
    user_data: {
      em: emailHash,
      fn: business_name,  // Business name
      ph: contact         // Contact (e.g., phone)
    },
    custom_data: {
      currency: currency || 'BRL',  // Default to BRL if currency is not provided
      value: value || 0             // Default to 0 if value is not provided
    }
  };

  // Send the data to Meta Conversion API
  try {
    await axios.post('https://graph.facebook.com/v13.0/1064184408385925/events', payload, {
      headers: {
        Authorization: `Bearer SEU_TOKEN`
      }
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Evento enviado com sucesso' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao enviar evento', error: error.message })
    };
  }
};
