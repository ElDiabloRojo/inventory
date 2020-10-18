import * as express from "express";
import pgPromise from "pg-promise";

export const register = (app: express.Application) => {
  const oidc = app.locals.oidc;
  const port = parseInt(process.env.PGPORT || "5432", 10);
  const config = {
    database: process.env.PGDATABASE || "postgres",
    host: process.env.PGHOST || "localhost",
    port,
    user: process.env.PGUSER || "postgres",
  };

  const pgp = pgPromise();
  const db = pgp(config);

  app.get(
    `/api/inventory/all`,
    oidc.ensureAuthenticated(),
    async (req: any, res) => {
      try {
        const userId = req.userContext.userinfo.sub;
        const inventory = await db.any(
          `
                SELECT
                    id
                    , brand
                    , model
                    , year
                    , color
                FROM    inventory
                WHERE   user_id = $[userId]
                ORDER BY year, brand, model`,
          { userId }
        );
        return res.json(inventory);
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.error(err);
        res.json({ error: err.message || err });
      }
    }
  );

  app.get(
    `/api/inventory/total`,
    oidc.ensureAuthenticated(),
    async (req: any, res) => {
      try {
        const userId = req.userContext.userinfo.sub;
        const total = await db.one(
          `
            SELECT  count(*) AS total
            FROM    inventory
            WHERE   user_id = $[userId]`,
          { userId },
          (data: { total: number }) => {
            return {
              total: +data.total,
            };
          }
        );
        return res.json(total);
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.error(err);
        res.json({ error: err.message || err });
      }
    }
  );

  app.get(
    `/api/inventory/find/:search`,
    oidc.ensureAuthenticated(),
    async (req: any, res) => {
      try {
        const userId = req.userContext.userinfo.sub;
        const inventory = await db.any(
          `
                SELECT
                    id
                    , brand
                    , model
                    , year
                    , color
                FROM    inventory
                WHERE   user_id = $[userId]
                AND   ( brand ILIKE $[search] OR model ILIKE $[search] )`,
          { userId, search: `%${req.params.search}%` }
        );
        return res.json(inventory);
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.error(err);
        res.json({ error: err.message || err });
      }
    }
  );

  app.post(
    `/api/inventory/add`,
    oidc.ensureAuthenticated(),
    async (req: any, res) => {
      try {
        const userId = req.userContext.userinfo.sub;
        const id = await db.one(
          `
                INSERT INTO inventory( user_id, brand, model, year, color )
                VALUES( $[userId], $[brand], $[model], $[year], $[color] )
                RETURNING id;`,
          { userId, ...req.body }
        );
        return res.json({ id });
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.error(err);
        res.json({ error: err.message || err });
      }
    }
  );

  app.post(
    `/api/inventory/update`,
    oidc.ensureAuthenticated(),
    async (req: any, res) => {
      try {
        const userId = req.userContext.userinfo.sub;
        const id = await db.one(
          `
                UPDATE inventory
                SET brand = $[brand]
                    , model = $[model]
                    , year = $[year]
                    , color = $[color]
                WHERE
                    id = $[id]
                    AND user_id = $[userId]
                RETURNING
                    id;`,
          { userId, ...req.body }
        );
        return res.json({ id });
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.error(err);
        res.json({ error: err.message || err });
      }
    }
  );

  app.delete(
    `/api/inventory/remove/:id`,
    oidc.ensureAuthenticated(),
    async (req: any, res) => {
      try {
        const userId = req.userContext.userinfo.sub;
        const id = await db.result(
          `
                DELETE
                FROM    inventory
                WHERE   user_id = $[userId]
                AND     id = $[id]`,
          { userId, id: req.params.id },
          (r) => r.rowCount
        );
        return res.json({ id });
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.error(err);
        res.json({ error: err.message || err });
      }
    }
  );
};
