const { Group, GroupMember, User } = require("../models");
const { requireFields } = require("../utils/validation");

async function createGroup(currentUserId, body) {
  requireFields(body, ["name"]);
  const group = await Group.create({
    name: body.name,
    createdBy: currentUserId,
  });

  await GroupMember.create({
    groupId: group.id,
    userId: currentUserId,
    role: "admin",
  });

  return group;
}

async function getMyGroups(userId) {
  const memberships = await GroupMember.findAll({
    where: { userId },
    include: [{ model: Group }],
  });

  return memberships.map((m) => m.Group);
}

async function addMembers(currentUserId, groupId, userIds) {
  const gm = await GroupMember.findOne({ where: { groupId, userId: currentUserId } });

  if (!gm || gm.role !== "admin") {
    const err = new Error("Only admins can add members");
    err.status = 403;
    throw err;
  }

  const added = [];

  for (let uid of userIds) {
    const exists = await GroupMember.findOne({ where: { groupId, userId: uid } });

    if (!exists) {
      const member = await GroupMember.create({
        groupId,
        userId: uid,
        role: "member",
      });
      added.push(member);
    }
  }

  return added;
}

async function removeMember(currentUserId, groupId, userIdToRemove) {
  const gm = await GroupMember.findOne({ where: { groupId, userId: currentUserId } });
  if (!gm || gm.role !== "admin") {
    const err = new Error("Only admins can remove members");
    err.status = 403;
    throw err;
  }

  if (userIdToRemove === currentUserId) {
    const err = new Error("Admin cannot remove themselves");
    err.status = 400;
    throw err;
  }

  const deleted = await GroupMember.destroy({
    where: { groupId, userId: userIdToRemove },
  });

  if (!deleted) {
    const err = new Error("Member not found in group");
    err.status = 404;
    throw err;
  }
}

async function getGroupMembers(currentUserId, groupId) {
  const membership = await GroupMember.findOne({ where: { groupId, userId: currentUserId } });
  if (!membership) {
    const err = new Error("You are not a member of this group");
    err.status = 403;
    throw err;
  }

  const members = await GroupMember.findAll({
    where: { groupId },
    include: [{ model: User, attributes: ["id", "name", "email"] }],
  });

  return members.map((m) => ({
    id: m.User.id,
    name: m.User.name,
    email: m.User.email,
    role: m.role,
  }));
}

module.exports = {
  createGroup,
  getMyGroups,
  addMembers,
  removeMember,
  getGroupMembers,
};
