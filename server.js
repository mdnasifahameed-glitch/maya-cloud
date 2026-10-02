const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "online",
        assistant: "Maya",
        callCapability: true
    });
});

app.post("/api/call", (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({
            success: false,
            message: "Phone number is required"
        });
    }

    console.log("Maya received call request:", phoneNumber);

    res.json({
        success: true,
        message: "Call request received",
        phoneNumber
    });
});

app.listen(PORT, () => {
    console.log(`Maya server running at http://localhost:${PORT}`);
});
