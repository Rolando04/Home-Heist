import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const SALT_ROUNDS = 12;

export async function getUserById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const user = await prisma.product_user.findUnique({
      where: {
        user_id: req.params.id,
      },
      include: {
        loan_search: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Never expose the password hash through the API.
    const { passwordhash: _passwordhash, ...safeUser } = user;

    res.json(safeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { user_id, email, password } = req.body;

    if (!user_id || !email || !password) {
      return res.status(400).json({
        error: "user_id, email, and password are required",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
      });
    }

    const passwordhash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.product_user.create({
      data: {
        user_id,
        email,
        passwordhash,
      },
    });

    // Never send the hash back to the client.
    const { passwordhash: _passwordhash, ...safeUser } = user;

    res.status(201).json(safeUser);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await prisma.product_user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !user.passwordhash) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordhash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const { passwordhash: _passwordhash, ...safeUser } = user;

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to log in",
    });
  }
}
