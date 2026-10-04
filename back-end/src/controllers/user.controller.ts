import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

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

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const user = await prisma.product_user.create({
      data: req.body,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}
