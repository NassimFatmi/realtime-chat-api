const router = require("express").Router();
const Conversation = require("../../models/Conversation");
const User = require("../../models/User");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");

// @route    POST api/conversations
// @desc     create new user conversations
// @access   Private
router.post("/", auth, async (req, res) => {
	if (!req.body.reciverId)
		return res
			.status(400)
			.json({ errors: [{ msg: "reciver id is required" }] });

	try {
		// verify the existence of the reciver
		const reciverExist = await User.findById(req.body.reciverId).exec();

		if (!reciverExist)
			return res.status(400).json({ error: [{ msg: err.message }] });

		// check the existance of the conversation
		const existConversation = await Conversation.findOne({
			members: { $all: [req.body.reciverId, req.user.id] },
		});
		if (existConversation)
			return res.status(400).json({
				errors: [{ msg: "conversation already exists" }],
			});
		const newConversation = new Conversation({
			members: [req.body.reciverId, req.user.id],
		});
		const savedConversation = await newConversation.save();
		return res.json(savedConversation);
	} catch (err) {
		return res.status(500).send("Server error...");
	}
});

// @route    GET api/conversation
// @desc     get user conversations
// @access   Private
router.get("/", auth, async (req, res) => {
	try {
		const conversations = await Conversation.find({
			members: { $in: [req.user.id] },
		});
		return res.json(conversations);
	} catch (err) {
		return res.status(500).send("Server error...");
	}
});

// @route    POST api/conversation/search
// @desc     search for new conversations
// @access   Private
router.post(
	"/search",
	[check("name", "name is required to do the search").not().isEmpty()],
	auth,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name } = req.body;
		try {
			const searchResult = await User.find({
				name: new RegExp("^" + name + ".*", "i"),
			})
				.select("id name")
				.limit(4)
				.exec();
			return res.json(searchResult);
		} catch (err) {
			return res.status(500).send("Server error...");
		}
	}
);

module.exports = router;
