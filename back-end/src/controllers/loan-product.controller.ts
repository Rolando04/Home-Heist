import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getLoanProducts(req: Request, res: Response) {
  try {
    const search = req.query.search as string | undefined

    const products = await prisma.loan_product.findMany({
  ...(search
    ? {
        where: {
          OR: [
            {
              product_name: {
                contains: search,
              },
            },
            {
              institution: {
                is: {
                  institution_name: {
                    contains: search,
                  },
                },
              },
            },
          ],
        },
      }
    : {}),

  include: {
    institution: true,
  },
});

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch loan products" });
  }
}

export async function getLoanProductById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const product = await prisma.loan_product.findUnique({
      where: {
        product_id: req.params.id,
      },
      include: {
        institution: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Loan product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch loan product" });
  }
}

export async function createLoanProduct(req: Request, res: Response) {
  try {
    const product = await prisma.loan_product.create({
      data: req.body,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create loan product" });
  }
}
