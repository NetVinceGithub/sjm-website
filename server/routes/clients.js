import express from "express";
import Clients from "../models/Clients.js";
import axios from "axios";

const router = express.Router();

// Util: safe joinedDate parsing
const parseJoinedDate = (dateValue, clientName) => {
  if (typeof dateValue === "string" && dateValue.trim() !== "") {
    const parsed = new Date(dateValue.trim());
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  console.warn(`⚠ Skipping invalid joinedDate for client "${clientName}":`, dateValue);
  return null;
};

// Function to fetch and save clients from Google Sheets
const fetchAndSaveClients = async () => {
  try {
    const response = await axios.get(process.env.GOOGLE_SHEET_URL_CLIENT);
    const rows = response.data.values;

    if (!rows || rows.length < 2) {
      console.log("⚠ No client data found");
      return;
    }

    const headers = rows[0].map(header =>
      header.toLowerCase().replace(/\s+/g, "").replace(/[^\w]/g, "")
    );

    const validClients = rows.slice(1).map(row => {
      const clientObj = {};
      headers.forEach((header, index) => {
        clientObj[header] = row[index]?.trim() || "";
      });
      return clientObj;
    });

    for (const client of validClients) {
    try {
        const joinedDateRaw = client.joineddate;
        const parsedJoinedDate =
        Array.isArray(joinedDateRaw) || typeof joinedDateRaw === "object"
            ? null
            : isNaN(new Date(joinedDateRaw))
            ? null
            : new Date(joinedDateRaw);

        const clientName = client.name.trim();

        // 🔍 Check if client exists
        const existingClient = await Clients.findOne({
        where: { name: clientName }
        });

        if (existingClient) {
        // 🛠 Update existing client
        await existingClient.update({
            tinNumber: client.tinnumber || null,
            contactNumber: client.contactnumber || null,
            emailAddress: client.emailaddress || null,
            businessAddress: client.businessaddress || null,
            joinedDate: parsedJoinedDate ? parsedJoinedDate.toISOString().split('T')[0] : null,
            status: client.status || "Active",
            deployedEmployees: parseInt(client.deployedemployees || "0"),
        });

        console.log(`🔄 Updated client: ${clientName}`);
        } else {
        // ➕ Create new client
        const savedClient = await Clients.create({
            name: clientName,
            tinNumber: client.tinnumber || null,
            contactNumber: client.contactnumber || null,
            emailAddress: client.emailaddress || null,
            businessAddress: client.businessaddress || null,
            joinedDate: parsedJoinedDate ? parsedJoinedDate.toISOString().split('T')[0] : null,
            project: client.project || null,
            status: client.status || "Active",
            deployedEmployees: parseInt(client.deployedemployees || "0"),
        });

        console.log(`✅ Created new client: ${savedClient.name}`);
        }
    } catch (err) {
        console.error(`❌ Error processing client: ${client.name}`, err.message);
    }
    }




    console.log("🎉 Clients import complete");
  } catch (err) {
    console.error("❌ Error fetching clients from Google Sheets:", err.message);
  }
};

// POST /api/clients/sync
export const importClientsFromGoogleSheet = async (req, res) => {
  try {
    await fetchAndSaveClients();
    res.status(201).json({ success: true, message: "Clients imported successfully" });
  } catch (error) {
    console.error("❌ Error in client import:", error);
    res.status(500).json({ success: false, message: "Error syncing clients" });
  }
};

router.post("/sync", importClientsFromGoogleSheet);

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

    const existingClient = await Clients.findOne({ where: { name: name.trim() } });

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
      joinedDate: parseJoinedDate(joinedDate, name),
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
