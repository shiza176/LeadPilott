import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { and, eq, gt } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(usersTable)
      .values({ name, email, passwordHash })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT_SECRET is not configured" });
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Failed to log in" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      await db
        .update(usersTable)
        .set({ resetToken, resetTokenExpiry })
        .where(eq(usersTable.id, user.id));

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset your LeadPilot password",
        text: `Reset your password using this link: ${resetLink}`,
        html: `<p>Reset your LeadPilot password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      });
    }

    return res.json({ message: "If that email exists, a reset link was sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Failed to send password reset email" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token : "";
    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.resetToken, token), gt(usersTable.resetTokenExpiry, new Date())))
      .limit(1);

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(usersTable)
      .set({ passwordHash, resetToken: null, resetTokenExpiry: null })
      .where(eq(usersTable.id, user.id));

    return res.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;
