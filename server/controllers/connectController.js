import Connect from "../models/Connect.js"; // Ensure the correct import

export const addMessages = async (req, res) => {
  try {
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

    res.status(201).json({ message: 'Form submitted successfully!', data: newConnect });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
};
