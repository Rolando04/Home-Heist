import pg from "pg";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://homeheist:homeheist@localhost:5433/homeheist",
});

export interface BorrowerProfile {
  income: number;
  creditScore: number;
  zip: string;
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  loanType?: string;
  termMonths?: number;
}

export interface InstitutionRow {
  institution_id: string;
  institution_name: string;
  institution_type: string | null;
  institution_link: string | null;
}

export interface LoanProductRow {
  product_id: string;
  institution_id: string;
  product_name: string;
  loan_type: string | null;
  term_months: number | null;
  interest_rate: number | null;
  apr: number | null;
  min_credit_score: number | null;
  max_credit_score: number | null;
  product_link: string | null;
}

// Column-width guards: model-extracted strings can overrun varchar(n).
const t = (s: string | null, n: number): string | null =>
  s == null ? null : s.slice(0, n);

export async function upsertInstitution(
  i: Omit<InstitutionRow, "institution_id"> & { institution_id?: string },
): Promise<string> {
  // Reuse an existing row with the same name — collectors extract slightly
  // different name variants and we don't want one row per spelling.
  if (!i.institution_id) {
    const { rows } = await pool.query(
      `select institution_id from institution where institution_name ilike $1 limit 1`,
      [i.institution_name.trim()],
    );
    if (rows[0]) return rows[0].institution_id;
  }
  const id = i.institution_id ?? crypto.randomUUID();
  await pool.query(
    `insert into institution (institution_id, institution_name, institution_type, institution_link)
     values ($1, $2, $3, $4)
     on conflict (institution_id) do update
       set institution_name = excluded.institution_name,
           institution_type = excluded.institution_type,
           institution_link = excluded.institution_link`,
    [id, t(i.institution_name, 128), t(i.institution_type, 255), t(i.institution_link, 255)],
  );
  return id;
}

export async function upsertLoanProduct(
  l: Omit<LoanProductRow, "product_id"> & { product_id?: string },
): Promise<string> {
  if (!l.product_id) {
    const { rows } = await pool.query(
      `select product_id from loan_product
         where institution_id = $1 and product_name ilike $2 limit 1`,
      [l.institution_id, l.product_name.trim()],
    );
    if (rows[0]) return rows[0].product_id;
  }
  const id = l.product_id ?? crypto.randomUUID();
  await pool.query(
    `insert into loan_product
       (product_id, institution_id, product_name, loan_type, term_months,
        interest_rate, apr, min_credit_score, max_credit_score, product_link)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     on conflict (product_id) do update
       set product_name = excluded.product_name,
           loan_type = excluded.loan_type,
           term_months = excluded.term_months,
           interest_rate = excluded.interest_rate,
           apr = excluded.apr,
           min_credit_score = excluded.min_credit_score,
           max_credit_score = excluded.max_credit_score,
           product_link = excluded.product_link`,
    [
      id,
      l.institution_id,
      t(l.product_name, 128),
      t(l.loan_type, 128),
      l.term_months,
      l.interest_rate,
      l.apr,
      l.min_credit_score,
      l.max_credit_score,
      t(l.product_link, 255),
    ],
  );
  return id;
}

export interface LoanSearchFilters {
  creditScore?: number;
  loanType?: string;
  termMonths?: number;
  maxApr?: number;
}

export async function searchLoans(
  f: LoanSearchFilters,
): Promise<(LoanProductRow & Pick<InstitutionRow, "institution_name" | "institution_type">)[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (f.creditScore != null) {
    params.push(f.creditScore);
    clauses.push(
      `(min_credit_score is null or min_credit_score <= $${params.length})
       and (max_credit_score is null or max_credit_score >= $${params.length})`,
    );
  }
  if (f.loanType) {
    params.push(`%${f.loanType}%`);
    clauses.push(`loan_type ilike $${params.length}`);
  }
  if (f.termMonths != null) {
    params.push(f.termMonths);
    clauses.push(`term_months = $${params.length}`);
  }
  if (f.maxApr != null) {
    params.push(f.maxApr);
    clauses.push(`(apr is null or apr <= $${params.length})`);
  }
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const { rows } = await pool.query(
    `select lp.*, i.institution_name, i.institution_type
       from loan_product lp
       left join institution i on i.institution_id = lp.institution_id
       ${where}
       order by apr asc nulls last`,
    params,
  );
  return rows;
}

export async function listInstitutions(
  type?: string,
): Promise<InstitutionRow[]> {
  const { rows } = type
    ? await pool.query(
        `select * from institution where institution_type ilike $1 order by institution_name`,
        [`%${type}%`],
      )
    : await pool.query(`select * from institution order by institution_name`);
  return rows;
}

export async function logSearch(
  userId: string | null,
  p: BorrowerProfile,
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();
  await pool.query(
    `insert into loan_search
       (search_id, user_id, user_income, credit_score, property_zip,
        property_price, down_payment, loan_amount, creation_time, creation_date)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      id,
      userId,
      p.income,
      p.creditScore,
      p.zip,
      p.propertyPrice,
      p.downPayment,
      p.loanAmount,
      now.toTimeString().slice(0, 8),
      now.toISOString().slice(0, 10),
    ],
  );
  return id;
}
