const router = require("express").Router();
const User = require("../../models/User");
const auth = require("../../middlewares/auth");
const bcryptjs = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// @route    GET api/auth
// @desc     Get user data
// @access   Public
router.get("/", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		return res.json(user);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send("Server error..");
	}
});

// @route    POST api/auth
// @desc     Login the user
// @access   Public
router.post(
	"/",
	[
		check("email", "Please include a valid email adress").isEmail(),
		check("password", "Please enter a password with 6+ chars").isLength({
			min: 6,
		}),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: "User doesn't exist" }] });
			}

			const validPassword = await bcryptjs.compare(password, user.password);

			if (!validPassword)
				return res
					.status(400)
					.json({ errors: [{ msg: "Unvalid user credentials" }] });

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				process.env.JWTSECRET,
				{
					expiresIn: 36000,
				},
				(err, token) => {
					if (err) throw err;
					const { name, email, password, avatar, _id, date } = user;
					return res.json({
						token,
						user: { name, email, password, avatar, _id, date },
					});
				}
			);
		} catch (err) {
			console.log(err);
			return res.status(500).send("Server error");
		}
	}
);

module.exports = router;
