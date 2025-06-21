const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

// 📁 Public project listing
router.get("/", authMiddleware, projectController.getAllProjects);

// 📁 Single project details
router.get("/:id", authMiddleware, projectController.getProjectById);

// 🔐 Create, update, delete require auth
router.post("/", authMiddleware, projectController.createProject);
router.put("/:id", authMiddleware, projectController.updateProject);
router.delete("/:id", authMiddleware, projectController.deleteProject);

// 🧑‍🤝‍🧑 Team Management
router.post("/:projectId/invite", authMiddleware, projectController.inviteMemberToProject);
router.delete("/:projectId/remove/:memberId", authMiddleware, projectController.removeMemberFromProject);

module.exports = router;
