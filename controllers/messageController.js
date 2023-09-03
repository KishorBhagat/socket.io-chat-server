const Chat = require("../modles/chatModel");
const Message = require("../modles/messageModel");
const User = require("../modles/userModel");

const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;
    if(!content || !chatId){
        return res.status(400).json({error: { message: "Invalid data passed into request"}});
    }
    try {
        let message = await Message.create({
            sender: req.user._id,
            content,
            chat: chatId
        });

        message = await message.populate("sender", "name profileImg");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name profileImg email'
        })

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        });
        
        return res.status(200).json(message);
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
}

const getAllMessages = async (req, res) => {
    const {chatId} = req.params;
    try {
        const messages = await Message.find({chat: chatId})
        .populate("sender", "name profileImg email")
        .populate("chat");

        return res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
}

module.exports = {sendMessage, getAllMessages}
