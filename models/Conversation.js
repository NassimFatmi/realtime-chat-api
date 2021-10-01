const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
	members: {
		type: Array,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = Conversation = mongoose.model(
	"conversation",
	conversationSchema
);
