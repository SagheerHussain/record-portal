const User = require("../models/User");

const getAllUsers = (req, res) => {
    res.json({ message: "Get all users" });
};

const createUser = (req, res) => {
    res.json({ message: "User created successfully" });
};

// @desc   Delete a user (Admin only)
// @route  DELETE /api/users/:id
// @access Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await user.deleteOne();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { getAllUsers, createUser, deleteUser };
