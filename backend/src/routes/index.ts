import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import historyRouter from "./history";
import savedRouter from "./saved";
import settingsRouter from "./settings";
import statsRouter from "./stats";
import authRouter from "./auth";
import requireAuth from "../middleware/requireAuth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/ai", requireAuth, aiRouter);
router.use("/history", requireAuth, historyRouter);
router.use("/saved", requireAuth, savedRouter);
router.use("/settings", requireAuth, settingsRouter);
router.use("/stats", requireAuth, statsRouter);
router.use("/auth", authRouter);

export default router;