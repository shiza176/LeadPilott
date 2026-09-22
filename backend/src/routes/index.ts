import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import historyRouter from "./history";
import savedRouter from "./saved";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/ai", aiRouter);
router.use("/history", historyRouter);
router.use("/saved", savedRouter);

export default router;