const groupService = require("../services/groupService");

async function createGroup(req, res, next) {
  try {
    const group = await groupService.createGroup(req.user.id, req.body);
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
}

async function getMyGroups(req, res, next) {
  try {
    const groups = await groupService.getMyGroups(req.user.id);
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const groupId = parseInt(req.params.groupId);
    const { userIds } = req.body; // array of ids

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "userIds must be a non-empty array" });
    }

    const results = await groupService.addMembers(
      req.user.id,
      groupId,
      userIds
    );

    res.status(201).json({
      message: "Members added successfully",
      addedMembers: results,
    });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const groupId = parseInt(req.params.groupId);
    const userId = parseInt(req.params.userId);
    await groupService.removeMember(req.user.id, groupId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getGroupMembers(req, res, next) {
  try {
    const groupId = parseInt(req.params.groupId);
    const members = await groupService.getGroupMembers(req.user.id, groupId);
    res.json(members);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createGroup,
  getMyGroups,
  addMember,
  removeMember,
  getGroupMembers,
};
