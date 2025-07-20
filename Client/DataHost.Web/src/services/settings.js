const API_BASE_URL = '/api';

// Ottieni tutte le impostazioni
export const getSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Errore nel recupero delle impostazioni');
    }

    return await response.json();
  } catch (error) {
    console.error('Errore getSettings:', error);
    throw error;
  }
};

// Ottieni il path degli upload
export const getUploadsPath = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/uploads-path`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Errore nel recupero del path degli upload');
    }

    return await response.json();
  } catch (error) {
    console.error('Errore getUploadsPath:', error);
    throw error;
  }
};

// Imposta il path degli upload
export const setUploadsPath = async (uploadsPath) => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/uploads-path`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uploadsPath }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Errore nell\'aggiornamento del path');
    }

    return await response.json();
  } catch (error) {
    console.error('Errore setUploadsPath:', error);
    throw error;
  }
};
