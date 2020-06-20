import * as express from "express";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import * as dotenv from "dotenv";
import {
  usersRoutes,
  phasesRoutes,
  projectsRoutes,
  tasksRoutes,
} from "./routes";
import { resolve } from "path";

dotenv.config();
class Server {
  // set app to be of type express.Application
  readonly app: express.Application;
  constructor() {
    this.app = express();
    this.setup();
  }

  // application config
  public async setup(): Promise<void> {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log("db connection successful");
      // express middleware
      this.app.use(bodyParser.urlencoded({ extended: true }));
      this.app.use(bodyParser.json());
      this.app.use(helmet());
      this.app.use(cors());

      // all set
      // now setup routes
      this.routes();
    } catch (error) {
      console.log("Error connecting to the db", error);
    }
  }

  // application routes
  public routes(): void {
    this.app.use("/users", usersRoutes);
    this.app.use("/phases", phasesRoutes);
    this.app.use("/projects", projectsRoutes);
    this.app.use("/tasks", tasksRoutes);

    // is in production
    if (process.env.NODE_ENV === "production") {
      this.app.use(express.static("./client/build"));

      this.app.get(
        "*",
        resolve(__dirname, "client", "build", "index.html") as any
      );
    }
  }
}

// export
const server = new Server();
export default server.app;
