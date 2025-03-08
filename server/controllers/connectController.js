
import Connect from "../models/Connect.js"; // Ensure the correct import

export const addMessages = async (req, res) => {
  try {
    console.log('Request received:', req.body); // Add logging here
    const { firstname, surname, type, services, email, phone, message } = req.body;

    const newConnect = await Connect.create({
      firstname,
      surname,
      type,
      services,
      email,
      phone,
      message
    });

    console.log('New connect entry:', newConnect); // Log the new entry
    res.status(201).json({ message: 'Form submitted successfully!', data: newConnect });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
};

export const getMessages = async(req, res) => {
  try {
    const messages = await Connect.findAll();
    console.log(messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({message: error.message});
  }
};
