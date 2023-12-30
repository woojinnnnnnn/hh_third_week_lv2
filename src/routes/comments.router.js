import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import commentRequestMiddleware from "../middlewares/requestMiddlewares/commentRequest.middleware.js";

const router = express.Router();

/** 댓글 생성 API **/
router.post(
    // URL 이 왜 이렇게 되는지는 index.js 에 기재.
"/:review_id/comments",
  commentRequestMiddleware,
  async (req, res) => {
    try {
        // 콘텐츠 작성자 이름, 비밀번호 를 받아옴,
      const { content, user_name, password } = req.body;
        // 파람스를 통해 Id 값을 받아옴
      const { review_id } = req.params;
        // 컨텐츠가 비었다면. -> 에러 출력.
      if (!content) {
        return res.status(400).json({ errorMessage: "댓글을 입력하세요." });
      }
        // findUnique 를 통해 리뷰의 Id 값을 받아옴.
      const review = await prisma.review.findUnique({
        where: { id: review_id },
      });
        // 존재 하지 않는 다면 오류 출력
      if (!review) {
        return res
          .status(400)
          .json({ errorMessage: "존재하지 않는 리뷰입니다." });
      }
        // 비밀번호 해쉬화.
      const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));
      const hash_password = bcrypt.hashSync(password, salt);
        // 크리에이트 코멘트 에 유저가 입력한 값을 담고.
      const createComment = await prisma.comment.create({
        data: {
          content,
          user_name,
          review_id,
          password: hash_password,
        },
      });
        // 여기서 유저에게 리스폰스.
      return res
        .status(201)
        .json({ message: "작성완료 되었습니다.", data: createComment });
    } catch (err) {
      return res.status(400).json({ errorMessage: err.message });
    }
  }
);

/** 댓글 조회 API **/
router.get(
  "/:review_id/comments",
  commentRequestMiddleware,
  async (req, res) => {
    try {
        // 리뷰가 있어야 작성이 되기에 먼저 리뷰 아이디를 받아옴.
      const { review_id } = req.params;

      const review = await prisma.review.findUnique({
        where: { id: review_id },
      });

      if (!review) {
        return res
          .status(400)
          .json({ errorMessage: "존재하지 않는 리뷰입니다." });
      }
        // findMany 를 통해 글을 불러옴.
        // review_id 입력 하고 그 리뷰 아이디에 달린 코멘트 들을 불러들임.
      const comments = await prisma.comment.findMany({
        where: { review_id },
        orderBy: [{ created_at: "desc" }],
      });
      // 정렬을 위해
      return res.status(200).json({ data: comments });
    } catch (err) {
      return res.status(400).json({ errorMessage: err.message });
    }
  }
);

/** 댓글 상세 API **/
router.get(
  "/:review_id/comments/:id",
  commentRequestMiddleware,
  async (req, res) => {
    try {
        // 댓글을 불러오기 위해 이번엔 댓글 id 값 또한 받아옴.
      const { review_id, id } = req.params;

      const review = await prisma.review.findUnique({
        where: { id: review_id },
      });

      if (!review) {
        return res
          .status(400)
          .json({ errorMessage: "존재하지 않는 리뷰입니다." });
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id,
        },
      });

      return res.status(201).json({ data: comment });
    } catch (err) {
      return res.status(400).json({ errorMessage: err.message });
    }
  }
);

/** 댓글 수정 API **/
router.put(
  "/:review_id/comments/:id",
  commentRequestMiddleware,
  async (req, res) => {
    try {
        // 콘텐츠와 비밀번호 값을 받아옴.
      const { content, password } = req.body;
      const { review_id, id } = req.params;

      if (!content) {
        return res
          .status(400)
          .json({ errorMessage: "댓글 내용을 입력하세요!" });
      }

      const review = await prisma.review.findUnique({
        where: { id: review_id },
      });

      if (!review) {
        return res
          .status(400)
          .json({ errorMessage: "존재하지 않는 리뷰입니다." });
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id,
        }, 
      }); // 코멘트 값이 없을 경우.
      if (!comment) {
        return res.status(404).json({ errorMessage: "없는 댓글입니다." });
      }

      // 비밀번호 체크 추가.
      const checkHash = bcrypt.compareSync(password, comment.password);
      if (!checkHash) {
        return res.status(400).json({ errorMessage: "비밀번호가 틀렸습니다." });
      }

      const updateComment = await prisma.comment.update({
        where: {
          id,
        }, // 받아올 데이터
        data: { content },
      });
      return res
        .status(201)
        .json({ Message: "수정이 완료 되었습니다.", data: updateComment });
    } catch (err) {
      return res.status(400).json({ errorMessage: err.message });
    }
  }
);

/** 댓글 삭제 API **/
router.delete(
  "/:review_id/comments/:id",
  commentRequestMiddleware,
  async (req, res) => {
    try {
      const { review_id, id } = req.params;
      const { password } = req.body;

      const review = await prisma.review.findUnique({
        where: { id: review_id },
      });

      if (!review) {
        return res
          .status(400)
          .json({ errorMessage: "존재하지 않는 리뷰입니다." });
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id,
        },
      });

      if (!comment) {
        return res.status(404).json({ errorMessage: "없는 댓글입니다." });
      }

      // 비밀번호 체크 추가.
      const checkHash = bcrypt.compareSync(password, comment.password);
      if (!checkHash) {
        return res.status(400).json({ errorMessage: "비밀번호가 틀렸습니다." });
      }

      const deleteComment = await prisma.comment.delete({
        where: {
          id,
        },
      });
      return res
        .status(201)
        .json({ Message: "댓글이 삭제 되었습니다.", data: deleteComment });
    } catch (err) {
      return res.status(400).json({ errorMessage: err.message });
    }
  }
);

export default router;
