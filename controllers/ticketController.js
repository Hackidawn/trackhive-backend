const Ticket = require("../models/Ticket");
const Project = require("../models/Project");

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { assignee, projectId, title, description, priority, status } = req.body;

    if (!title || !description || !priority || !status || !projectId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (assignee) {
      const isMember = project.teamMembers.some(
        (tm) => tm.user.toString() === assignee
      );
      if (!isMember) {
        return res.status(400).json({ error: "Assignee is not a member of this project" });
      }
    }

    const ticket = new Ticket({
      title,
      description,
      priority,
      status,
      assignee: assignee || null,
      projectId,
      createdBy: req.user.id,
    });

    await ticket.save();
    const populatedTicket = await ticket.populate("assignee", "name email");

    res.status(201).json(populatedTicket);
  } catch (err) {
    res.status(400).json({ error: "Ticket creation failed", details: err.message });
  }
};

// Get tickets by project ID
exports.getTicketsByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const isMember = project.teamMembers.some(
      (tm) => tm.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this project" });
    }

    const tickets = await Ticket.find({ projectId: req.params.projectId }).populate("assignee", "name email");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Error fetching tickets", details: err.message });
  }
};

// Update ticket
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignee", "name email");
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err.message });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed", details: err.message });
  }
};
