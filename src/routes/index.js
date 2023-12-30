import express from "express";
import commentsRouter from "./comments.router.js";
import reviewsRouter from "./reviews.router.js";

const router = express.Router();
// 결국 리뷰가 있기에 댓글이 생성이됨.
// 그래서 기본은 /reviews 로 설정함.
// 예시로 /reviews/:reviews/comments 로 댓글을 조회 할 수 있게 설정함.
router.use("/reviews", [reviewsRouter, commentsRouter]);

export default router;
