import * as express from "express";
import * as api from "./api";

export const register = (app: express.Application) => {
  const oidc = app.locals.oidc;

  // define a route handler for the default home page
  app.get("/", (req: any, res) => {
    const user = req.userContext ? req.userContext.userInfo : null;
    res.render("index", { isAuthenticated: req.isAuthenticated(), user });
  });

  // define a secure route handler for the login page that redirects to /inventory
  app.get("/login", oidc.ensureAuthenticated(), (req, res) => {
    res.redirect("/inventory");
  });

  // define a route to handle logout
  app.get("/logout", (req: any, res) => {
    req.logout();
    res.redirect("/");
  });

  // define a secure route handler for the inventory page
  app.get("/inventory", oidc.ensureAuthenticated(), (req: any, res) => {
    const user = req.userContext ? req.userContext.userInfo : null;
    res.render("inventory", { isAuthenticated: req.isAuthenticated(), user });
  });

  api.register(app);
};
