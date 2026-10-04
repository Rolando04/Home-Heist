import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getInstitutions(_req: Request, res: Response) {
  try {
    const institutions = await prisma.institution.findMany({
      include: {
        loan_product: true,
      },
    });

    res.json(institutions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch institutions" });
  }
}

export async function getInstitutionById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const institution = await prisma.institution.findUnique({
      where: {
        institution_id: req.params.id,
      },
      include: {
        loan_product: true,
      },
    });

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    res.json(institution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch institution" });
  }
}

export async function createInstitution(req: Request, res: Response) {
  try {
    const institution = await prisma.institution.create({
      data: req.body,
    });

    res.status(201).json(institution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create institution" });
  }
}
