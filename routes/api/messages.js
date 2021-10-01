const router = require("express").Router();
const Message = require("../../models/Message");
const { check, validationResult } = require("express-validator");
const Conversation = require("../../models/Conversation");
const auth = require("../../middlewares/auth");

// @route    POST api/messages
// @desc     save message
// @access   Private
router.post(
	"/",
	[
		check("text", "the text is required").not().isEmpty(),
		check("conversationId", "the id of the conversation is required")
			.not()
			.isEmpty(),
	],
	auth,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		const { conversationId, text } = req.body;

		try {
			const exist = await Conversation.findById(conversationId).exec();
			if (!exist)
				return res
					.status(400)
					.json({ errors: [{ msg: "Conversation does not exist" }] });

			const newMessage = new Message({
				conversationId,
				sender: req.user.id,
				text,
			});
			const savedMessage = await newMessage.save();
			return res.json(savedMessage);
		} catch (err) {
			return res.status(500).send("Server error");
		}
	}
);

// @route    GET api/messages
// @desc     get messages
// @access   Private
router.get("/:id", auth, async (req, res) => {
	try {
		const messages = await Message.find({
			conversationId: req.params.id,
		});
		return res.json(messages);
	} catch (err) {
		return res.send("server error...");
	}
});

module.exports = router;
