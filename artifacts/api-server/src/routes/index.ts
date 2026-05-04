import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import submissionsRouter from "./submissions";
import leaderboardRouter from "./leaderboard";
import walletRouter from "./wallet";
import coursesRouter from "./courses";
import ctfRouter from "./ctf";
import internshipsRouter from "./internships";
import badgesRouter from "./badges";
import alertsRouter from "./alerts";
import policeRouter from "./police";
import companiesRouter from "./companies";
import rakshbotRouter from "./rakshbot";
import profileRouter from "./profile";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(submissionsRouter);
router.use(leaderboardRouter);
router.use(walletRouter);
router.use(coursesRouter);
router.use(ctfRouter);
router.use(internshipsRouter);
router.use(badgesRouter);
router.use(alertsRouter);
router.use(policeRouter);
router.use(companiesRouter);
router.use(rakshbotRouter);
router.use(profileRouter);
router.use(notificationsRouter);

export default router;
