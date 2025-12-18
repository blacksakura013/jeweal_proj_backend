const Master = require('../models/master/master')
const masterStoneData = require('../mockData/master/masterStoneGroup')
const masterStoneName = require('../mockData/master/masterStoneName')


  // Example function to create a document
  async function createDocument() {
    try {
      await Master.insertMany(masterStoneName.masterMockData)
    

      console.log('Document saved successfully');
    } catch (err) {
      console.error('Error saving document:', err);
    }
  }
  
  // Call the function to create a document
  createDocument();