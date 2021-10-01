const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		conversationId: {
			type: String,
			required: true,
		},
		sender: {
			type: String,
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
	},
	{ timestamps: { createdAt: "created_at" } }
);

module.exports = Conversation = mongoose.model("message", messageSchema);
