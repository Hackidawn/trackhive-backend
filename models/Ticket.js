const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    title: String,
    description: String,
    priority: { type: String, enum: ["Low", "Medium", "High"] },
    status: { type: String, enum: ["To Do", "In Progress", "Done"], default: "To Do" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);
