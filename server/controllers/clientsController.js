import Clients from '../models/Clients.js';
import { Op } from 'sequelize';


export const nextClientCode = async (req, res) => {
  try {
    console.log("📋 Fetching next client code...");

    const latestClient = await Clients.findOne({
      where: {
        clientCode: {
          [Op.like]: "MCL%", // Matches MCL00001, MCL00002, etc.
        },
      },
      order: [["clientCode", "DESC"]], // Use camelCase, not client_code
      attributes: ["clientCode"], // Use camelCase field name
    });

    let nextClientCode;

    if (latestClient && latestClient.clientCode) {
      const currentNumber = parseInt(latestClient.clientCode.substring(3), 10);

      if (isNaN(currentNumber)) {
        console.warn("⚠️ Invalid format, resetting to MCL00001");
        nextClientCode = "MCL00001";
      } else {
        const nextNumber = currentNumber + 1;
        nextClientCode = "MCL" + String(nextNumber).padStart(5, "0");
      }

      console.log(`✅ Latest: ${latestClient.clientCode}, Next: ${nextClientCode}`);
    } else {
      nextClientCode = "MCL00001";
      console.log("ℹ️ No existing clients, starting fresh:", nextClientCode);
    }

    return res.status(200).json({
      success: true,
      message: "Next client code generated successfully",
      data: { clientCode: nextClientCode },
    });
  } catch (error) {
    console.error("❌ Error generating client code:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate next client code",
      data: { clientCode: "MCL00001" }, // Fallback
    });
  }
};


// Helper function to generate next client code
const generateClientCode = async () => {
  const lastClient = await Clients.findOne({
    order: [["id", "DESC"]],
  });

  if (!lastClient || !lastClient.clientCode) {
    return "MCL00001"; // first code
  }

  // Extract the number part (e.g., from MCL00009 -> 9)
  const lastNumber = parseInt(lastClient.clientCode.replace("MCL", ""), 10);
  // Increment and pad with zeros
  const nextNumber = (lastNumber + 1).toString().padStart(5, "0");
  return `MCL${nextNumber}`;
};

// Add new client
export const addClient = async (req, res) => {
  try {
    const {
      client_name,
      address,
      tin,
      contact_person,
      phone,
      email,
      join_date,
      expiry_date,
      billing_frequency,
      remarks,
    } = req.body;

    // 🔹 Find the last inserted client code
    const lastClient = await Clients.findOne({
      order: [["id", "DESC"]],
    });

    let newCode = "MCL00001"; // default if no clients yet
    if (lastClient && lastClient.clientCode) {
      const lastNumber = parseInt(lastClient.clientCode.replace("MCL", ""), 10);
      const nextNumber = lastNumber + 1;
      newCode = "MCL" + nextNumber.toString().padStart(5, "0");
    }

    const newClient = await Clients.create({
      clientCode: newCode, // ✅ corrected field name
      name: client_name,
      tinNumber: tin,
      contactNumber: phone,
      contactPerson: contact_person,
      emailAddress: email,
      businessAddress: address,
      joinedDate: join_date,
      expiryDate: expiry_date,
      billingFrequency: billing_frequency,
      project: remarks,
    });

    res.status(201).json({
      success: true,
      message: "Client added successfully",
      data: newClient,
    });
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({
      success: false,
      message: "Error adding client",
      error: error.message,
    });
  }
};

// Get All Clients (Masterlist)
export const getClients = async (req, res) => {
  try {
    const clients = await Clients.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get specific client by ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Clients.findByPk(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    // Transform the data to match the frontend structure
    const clientData = {
      client_code: client.clientCode,
      client_name: client.name,
      address: client.businessAddress,
      tin: client.tinNumber,
      contact_person: client.contactPerson,
      phone: client.contactNumber,
      email: client.emailAddress,
      join_date: client.joinedDate,
      expiry_date: client.expiryDate,
      billing_frequency: client.billingFrequency,
      remarks: client.project,
    };

    res.json({
      success: true,
      data: clientData
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Update specific client by ID
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_name,
      address,
      tin,
      contact_person,
      phone,
      email,
      join_date,
      expiry_date,
      billing_frequency,
      remarks,
    } = req.body;

    // Check if client exists
    const client = await Clients.findByPk(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    // Update the client
    await client.update({
      name: client_name,
      tinNumber: tin,
      contactNumber: phone,
      contactPerson: contact_person,
      emailAddress: email,
      businessAddress: address,
      joinedDate: join_date,
      expiryDate: expiry_date,
      billingFrequency: billing_frequency,
      project: remarks,
    });

    res.json({
      success: true,
      message: "Client updated successfully",
      data: client
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({
      success: false,
      message: "Error updating client",
      error: error.message,
    });
  }
};