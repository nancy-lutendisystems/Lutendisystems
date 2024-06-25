// netlify/functions/create-id-verification.js

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const API_KEY = process.env.COMPLYCUBE_API_KEY;
  const apiUrl = 'https://api.complycube.com/v1/verifications';

  const requestBody = {
    type: 'id-verification',
    // Add additional required fields as per ComplyCube API documentation
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
