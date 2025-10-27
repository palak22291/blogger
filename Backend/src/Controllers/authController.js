const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../../prisma/client.js");

exports.register = async (req, res) => {
  try {

    const { firstName, lastName, email, password } = req.body;
    console.log("📥 Register request body:", req.body); // Log the input

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });

    res.json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User not found. Please register first." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }


    const { generateToken } = require("../Utils/jwt");

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, firstName: user.firstName, email: user.email },
    });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
