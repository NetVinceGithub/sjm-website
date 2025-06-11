import express from "express";
import Clients from "../models/Clients.js";

const router = express.Router();

// Function to sync clients from Google Sheets
const syncClientsFromGoogleSheets = async () => {
  try {
    const response = await fetch(process.env.GOOGLE_SHEET_URL_CLIENT);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.values || data.values.length <= 1) {
      return { success: false, message: "No data found in Google Sheets" };
    }
    
    // Skip header row (index 0) and process data rows
    const clientsData = data.values.slice(1);
    const syncedClients = [];
    
    for (const row of clientsData) {
      const [name, tinNumber, contactNumber, emailAddress, businessAddress, joinedDate, project] = row;
      
      // Skip empty rows
      if (!name || name.trim() === '') continue;
      
      // Check if client already exists
      const existingClient = await Clients.findOne({
        where: { name: name.trim() }
      });
      
      const clientData = {
        name: name.trim(),
        tinNumber: tinNumber?.trim() || null,
        contactNumber: contactNumber?.trim() || null,
        emailAddress: emailAddress?.trim() || null,
        businessAddress: businessAddress?.trim() || null,
        joinedDate: joinedDate?.trim() || null,
        project: project?.trim() || null,
        status: 'Active',
        deployedEmployees: 1 // Default value, you can modify this logic
      };
      
      if (existingClient) {
        // Update existing client
        await existingClient.update(clientData);
        syncedClients.push({ ...existingClient.dataValues, action: 'updated' });
      } else {
        // Create new client
        const newClient = await Clients.create(clientData);
        syncedClients.push({ ...newClient.dataValues, action: 'created' });
      }
    }
    
    return {
      success: true,
      message: `Successfully synced ${syncedClients.length} clients`,
      data: syncedClients
    };
    
  } catch (error) {
    console.error('Error syncing clients from Google Sheets:', error);
    return {
      success: false,
      message: 'Failed to sync clients from Google Sheets',
      error: error.message
    };
  }
};

// GET all clients
router.get("/", async (req, res) => {
  try {
    const clients = await Clients.findAll({
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
});

// GET single client by ID
router.get("/:id", async (req, res) => {
  try {
    const client = await Clients.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client',
      error: error.message
    });
  }
});

// POST request to sync clients from Google Sheets
router.post("/sync", async (req, res) => {
  try {
    const result = await syncClientsFromGoogleSheets();
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during sync',
      error: error.message
    });
  }
});

// POST request to create new client manually
router.post("/", async (req, res) => {
  try {
    const {
      name,
      tinNumber,
      contactNumber,
      emailAddress,
      businessAddress,
      joinedDate,
      status,
      deployedEmployees
    } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Client name is required'
      });
    }
    
    // Check if client already exists
    const existingClient = await Clients.findOne({
      where: { name: name.trim() }
    });
    
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this name already exists'
      });
    }
    
    const newClient = await Clients.create({
      name: name.trim(),
      tinNumber: tinNumber?.trim() || null,
      contactNumber: contactNumber?.trim() || null,
      emailAddress: emailAddress?.trim() || null,
      businessAddress: businessAddress?.trim() || null,
      joinedDate: joinedDate?.trim() || null,
      status: status || 'Active',
      deployedEmployees: deployedEmployees || 0
    });
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: newClient
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create client',
      error: error.message
    });
  }
});

// PUT request to update client
router.put("/:id", async (req, res) => {
  try {
    const client = await Clients.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    const updatedClient = await client.update(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: error.message
    });
  }
});

// DELETE request to delete client
router.delete("/:id", async (req, res) => {
  try {
    const client = await Clients.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    await client.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: error.message
    });
  }
});

export default router;