
const addIdData = async (req, res) => {
  try {
    const { name, position } = req.body;
    if (!name || !position) {
      return res.status(400).json({ success: false, error: "Name and position are required." });
    }

    const signature = req.file ? req.file.buffer : null;

    const newData = new id_data({ name, position, signature });
    await newData.save();
    res.status(201).json({ success: true, message: "ID data added successfully!" });
  } catch (error) {
    console.error("Error adding ID data:", error);
    res.status(500).json({ success: false, error: "Server error." });
  }
};

const updateIdData = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position } = req.body;

    const updatedData = { name, position, updatedAt: Date.now() };
    if (req.file) {
      updatedData.signature = req.file.buffer;
    }

    const result = await id_data.findByIdAndUpdate(id, updatedData, { new: true });
    if (!result) {
      return res.status(404).json({ success: false, error: "ID not found." });
    }

    res.status(200).json({ success: true, message: "ID data updated successfully!" });
  } catch (error) {
    console.error("Error updating ID data:", error);
    res.status(500).json({ success: false, error: "Server error." });
  }
};

export { addIdData, updateIdData };
