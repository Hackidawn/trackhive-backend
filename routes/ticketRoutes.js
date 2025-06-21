const express = require("express");
const {
  createTicket,
  getTicketsByProject,
  updateTicket,
  deleteTicket
} = require("../controllers/ticketController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, createTicket);
router.get("/project/:projectId", auth, getTicketsByProject);
router.patch("/:id", auth, updateTicket);
router.delete("/:id", auth, deleteTicket);

module.exports = router;
