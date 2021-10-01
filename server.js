const express = require("express");
const connectDB = require("./config/db");
const app = express();
const cors = require("cors");
const socketIo = require("./socket");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
	cors({
		origin: process.env.CLIENT,
	})
);

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/conversations", require("./routes/api/conversations"));
app.use("/api/messages", require("./routes/api/messages"));

app.get("/", (req, res) => {
	res.send("server running");
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
socketIo(server);
server.listen(PORT, (_) =>
	console.log(`Server up and running on port ${PORT}`)
);
