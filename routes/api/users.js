const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middlewares/auth");

// @route    POST api/users
// @desc     Testroute
// @access   Public
router.post(
	"/",
	[
		check("name", "Name is required")
			.not()
			.isEmpty()
			.isLength({ min: 6, max: 25 }),
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

		const { name, email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: "User already exists" }] });
			}

			const avatar = gravatar.url(email, {
				s: "200",
				r: "pg",
				d: "mm",
			});

			const salt = await bcryptjs.genSalt(10);
			const hash = await bcryptjs.hash(password, salt);

			user = new User({ name, email, password: hash, avatar });

			const savedUser = await user.save();

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
					const { name, email, password, avatar, _id, date } = savedUser;
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

// @route    POST api/users/id
// @desc     get user info
// @access   Private
router.get("/:id", auth, async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-password").exec();
		return res.json(user);
		res;
	} catch (err) {
		return res.status(400).json({ errors: [{ msg: "Cant find the user" }] });
	}
});
module.exports = router;
