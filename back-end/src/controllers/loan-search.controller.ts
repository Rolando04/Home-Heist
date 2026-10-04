import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getLoanSearches(_req: Request, res: Response) {
  try {
    const searches = await prisma.loan_search.findMany({
      include: {
        product_user: true,
      },
    });

    res.json(searches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch loan searches" });
  }
}

export async function getLoanSearchById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const search = await prisma.loan_search.findUnique({
      where: {
        search_id: req.params.id,
      },
      include: {
        product_user: true,
      },
    });

    if (!search) {
      return res.status(404).json({ error: "Loan search not found" });
    }

    res.json(search);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch loan search" });
  }
}

export async function createLoanSearch(req: Request, res: Response) {
  try {
    const search = await prisma.loan_search.create({
      data: req.body,
    });

    res.status(201).json(search);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create loan search" });
  }
}
