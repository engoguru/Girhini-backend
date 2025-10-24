import Contact from "../models/contactModel.js";

// ✅ CREATE Contact
export const createContact = async (req, res) => {
    console.log(req.body,"errvhi")
  try {
    const { name, email, contact, category, message } = req.body;

    // Validate required fields
    if (!name || !email || !contact || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields (name, email, contact, message) must be provided",
      });
    }

    const contactData = await Contact.create({
      name,
      email,
      contact,
      category,
      message,
    });

    res.status(201).json({
      success: true,
      data: contactData,
      message: "Contact saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};




// ✅ READ All Contacts
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ READ Single Contact
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact)
      return res.status(404).json({ success: false, message: "Contact not found" });

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE Contact (supports status update)
export const updateContact = async (req, res) => {
  try {
    const { name, email, contact, category, message, status } = req.body;
    const contactData = await Contact.findById(req.params.id);

    if (!contactData)
      return res.status(404).json({ success: false, message: "Contact not found" });

    // Update only provided fields
    if (name) contactData.name = name;
    if (email) contactData.email = email;
    if (contact) contactData.contact = contact;
    if (category) contactData.category = category;
    if (message) contactData.message = message;
    if (status) contactData.status = status;

    await contactData.save();
    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: contactData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE Contact
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact)
      return res.status(404).json({ success: false, message: "Contact not found" });

    res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
