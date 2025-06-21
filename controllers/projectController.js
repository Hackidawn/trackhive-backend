const Project = require("../models/Project");
const User = require("../models/User");

const isProjectOwner = (project, userId) => {
  return project.teamMembers.some(
    (tm) => tm.user.toString() === userId.toString() && tm.role === "Owner"
  );
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "teamMembers.user": req.user._id,
    }).populate("teamMembers.user", "name email");
    res.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    res.status(500).json({ message: "Failed to fetch projects", error: err.message });
  }
  console.log(`[FETCH] Fetching projects for user: ${req.user._id}`);

};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      lead: req.user._id,
      teamMembers: [{ user: req.user._id, role: "Owner" }],
    });

    console.log(`[CREATE] User ${req.user._id} creating project "${req.body.title}"`);
    console.log(`[CREATE] Initial teamMembers:`, project.teamMembers);

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("[CREATE] Error:", err.message);
    res.status(400).json({ message: "Failed to create project", error: err.message });
  }
};


// Get single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("teamMembers.user", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isMember = project.teamMembers.some(
      (tm) => tm.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Access denied: not a team member" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Error fetching project", error: err.message });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    console.log(`[DELETE] Attempt by: ${req.user._id} for project: ${req.params.id}`);

    if (!project) {
      console.log(`[DELETE] Project not found`);
      return res.status(404).json({ message: "Project not found" });
    }

    const isOwner = project.teamMembers.some(
      (tm) => tm.user.toString() === req.user._id.toString() && tm.role === "Owner"
    );

    if (!isOwner) {
      console.log(`[DELETE] User not owner`);
      return res.status(403).json({ message: "Only the owner can delete the project" });
    }

    await project.deleteOne();  // ✅ safer than .remove()
    console.log(`[DELETE] Project deleted`);
    res.json({ message: "Project deleted" });

  } catch (err) {
    console.error("[DELETE] Error:", err.message);
    res.status(400).json({ message: "Delete failed", error: err.message });
  }
};


// Invite a user to the project by email or username
exports.inviteMemberToProject = async (req, res) => {
  const { projectId } = req.params;
  const { identifier } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: "Only owner can invite members" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { name: identifier }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadyMember = project.teamMembers.some(
      (tm) => tm.user.toString() === user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "User already in project" });
    }

    project.teamMembers.push({ user: user._id, role: "Collaborator" });
    await project.save();

    console.log(`[INVITE] New teamMembers list:`, project.teamMembers); // ← Moved here safely

    res.status(200).json({ message: "User invited successfully", project });
  } catch (err) {
    console.error("[INVITE] Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Remove member from project
exports.removeMemberFromProject = async (req, res) => {
  const { projectId, memberId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Allow user to remove themselves
    if (req.user._id.toString() === memberId) {
      const target = project.teamMembers.find((tm) => tm.user.toString() === memberId);
      if (target?.role === "Owner") {
        return res.status(400).json({ message: "Owner cannot remove themselves" });
      }

      project.teamMembers = project.teamMembers.filter(
        (tm) => tm.user.toString() !== memberId
      );
      await project.save();
      return res.status(200).json({ message: "You left the project", project });
      console.log(`[REMOVE] Updated teamMembers:`, project.teamMembers);

    }

    // Only owner can remove others
    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: "Only the owner can remove members" });
    }

    const target = project.teamMembers.find((tm) => tm.user.toString() === memberId);
    if (target?.role === "Owner") {
      return res.status(400).json({ message: "Cannot remove project owner" });
    }

    project.teamMembers = project.teamMembers.filter(
      (tm) => tm.user.toString() !== memberId
    );
    await project.save();

    res.status(200).json({ message: "User removed", project });
  } catch (err) {
    res.status(500).json({ message: "Error removing user", error: err.message });
  }
};
