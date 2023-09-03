const Chat = require("../modles/chatModel");
const User = require("../modles/userModel");

const accessChat = async (req, res) => {
    try {
        const {userId } = req.body;
        if(!userId) {
            return res.status(400).json({error: {message: "UserId param not sent with request"}});
        }
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                {users: {$elemMatch: {$eq: req.user._id}}},
                {users: {$elemMatch: {$eq: userId}}},
            ]
        })
          .populate("users", "-password")
          .populate("latestMessage");

        
        isChat = await User.populate(isChat, {
            path: 'latestMessage.sender',
            select: 'name profileImg email',
        });

        if(isChat.length > 0) {
            return res.json(isChat[0]);
        }
        else {
            let chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            }

            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({_id: createdChat._id}).populate(
                "users",
                "-password"
            );

            return res.status(200).json(fullChat)
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({error});
    }
}

const getAllChats = async (req, res) => {
    try {
        let allChats = await Chat.find({users: { $elemMatch: { $eq: req.user._id}}})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({updatedAt: -1});

        allChats = await User.populate(allChats, {
            path: 'latestMessage.sender',
            select: 'name profileImg email',
        });
        return res.status(200).json(allChats);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error});
    }
}

const createGroupChat = async (req, res) => {

    if(!req.body.users || !req.body.name) {
        return res.status(400).json({error: {message: "Please provide all the field"}});
    }
    let users = JSON.parse(req.body.users);
    if(users.length < 2) {
        return res.status(400).json({error: {message: "Atleast 2 members required to create a group."}});
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({                  // model.create() functions also saves the data so no need of save() function
            chatName: req.body.name,
            users,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const fullGroupChat = await Chat.findOne({_id: groupChat._id})
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
            

        return res.status(200).json(fullGroupChat);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error});
    }
}

const renameGroup = async (req, res) => {
    const { chatId, chatName} = req.body;
    try {
        const updateChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName,
            },
            { new: true}
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        if(!updateChat) {
            res.status(400).json({error: {message: "Chat not found"}});
        }
        return res.status(200).json(updateChat);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error});
    }
    
}

const deleteGroup = async (req, res) => {
    const {chatId} = req.body;
    try {
        const group = await findById(chatId);
        await group.delete();
        return res.status(200).json({message: "group deleted"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error});
    }
}

const addUserToGroup = async (req, res) => {
    const {chatId, userId} = req.body;
    try {
        const addedUser = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: { users: userId }
            },
            {new: true}
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        if(!addedUser) {
            res.status(400).json({error: {message: "Chat not found"}});
        }
        return res.status(200).json(addedUser);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error});
    } 
}

const removeUserFromGroup = async (req, res) => {
    const {chatId, userId} = req.body;
    try {
        const deleteUser = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: { users: userId }
            },
            {new: true}
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        if(!deleteUser) {
            res.status(400).json({error: {message: "Chat not found"}});
        }
        return res.status(200).json(deleteUser);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error});
    } 
}

module.exports = { accessChat, getAllChats, createGroupChat, renameGroup, deleteGroup, addUserToGroup, removeUserFromGroup}

// TODO: CHECK YOU ARE NOT MODIFYING OTHERS CHATS