const axios = require('axios');
const mongoose = require('mongoose');
const Program = require('../models/Program'); // We'll use the same model

async function callDaadApi() {
  console.log('Calling DAAD API...');
  const apiUrl = 'https://api.daad.de/program-search';
  
  try {
    const response = await axios.get(apiUrl, {
      params: {
        country: 'germany',
        level: 'masters',
        limit: 20
      }
    });

    const apiPrograms = response.data.programs.map(program => ({
      schoolName: program.university,
      programName: program.name,
      deadline: new Date(program.application_deadline),
      source: 'DAAD'
    }));
    
    // Save the data to MongoDB
    for (const program of apiPrograms) {
      const newProgram = new Program(program);
      await newProgram.save();
    }

    console.log(`API finished. Saved ${apiPrograms.length} programs.`);

  } catch (error) {
    console.error('Error calling DAAD API:', error);
  }
}

module.exports = callDaadApi;