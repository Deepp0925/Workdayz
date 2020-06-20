import { Router, Request, Response } from "express";
import { Users } from "../models";
import { ServerError } from "../error";
import { packResponse } from "../utils/response";
import * as _ from "underscore";
import { validateEmail } from "../utils/validate";
import { wordCount } from "../utils/string";
import { JWT } from "../utils/jwt";
class UsersRouter {
  readonly router = Router();

  constructor() {
    this.router.post("/login", this.login);
    this.router.post("/register", this.register);
    this.router.post("/forgotPassword", this.forgotPassword);
    this.router.post("/update", JWT.authenticateWithBody, this.update);
    this.router.get("/search/:search", this.search);
  }

  private async search(req: Request, res: Response) {
    try {
      // get search query
      const query = _.escape(req.params.search);
      const data = await Users.search(query);
      res.json(packResponse(false, data));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async login(req: Request, res: Response) {
    try {
      // get search query
      const email: string = req.body.email?.trim();
      const password: string = req.body.password?.trim();

      console.log(email, password);

      const data = await Users.login(email, password);
      res.json(packResponse(false, data));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async register(req: Request, res: Response) {
    try {
      const description: string = req.body.description?.trim();
      const skills: string = req.body.skills?.trim();
      const fullName: string = req.body.fullName?.trim();
      const email: string = req.body.email?.trim();
      const password: string = req.body.password?.trim();
      const jobTitle: string = req.body.jobTitle?.trim();

      if (
        !description.length ||
        !skills.length ||
        !fullName.length ||
        !email.length ||
        !password.length ||
        !jobTitle.length
      ) {
        throw new ServerError("Please fill out all fields", 400);
      }

      // invalid email format
      if (!validateEmail(email))
        throw new ServerError("Please provide a valid email", 400);

      if (password.length < 8)
        throw new ServerError("Please a password of at least 8 characters");

      if (wordCount(description) > 150)
        throw new ServerError("Description cannot have more than 150 words");

      const data = await Users.new({
        description,
        skills,
        fullName,
        email,
        password,
        jobTitle,
      });
      res.json(packResponse(false, data));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async forgotPassword(req: Request, res: Response) {
    try {
      const email = req.body.email?.trim();
      // validating email
      if (!validateEmail(email))
        throw new ServerError("Please provide a valid email", 400);

      await Users.resetPassword(email);
      // sending success message back to the user
      res.json(packResponse(false, "Sent new password to the email"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async update(req: Request, res: Response) {
    try {
      const description: string = req.body.description?.trim();
      const skills: string = req.body.skills?.trim();
      const fullName: string = req.body.fullName?.trim();
      const jobTitle: string = req.body.jobTitle?.trim();
      const img: string = req.body.img?.trim();

      // cannot update email/ password
      if (description && wordCount(description) > 150) {
        throw new ServerError("Description cannot have more than 150 words");
      }

      const updates = {} as any;

      if (description) updates.description = description;
      if (skills) updates.skills = skills;
      if (fullName) updates.fullName = fullName;
      if (jobTitle) updates.jobTitle = jobTitle;
      if (img) updates.img = img;

      await Users.update(req.body.userId, updates);

      // sending success message back to the user
      res.json(packResponse(false, "Updated Successfully"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }
}
export const usersRoutes = new UsersRouter().router;
