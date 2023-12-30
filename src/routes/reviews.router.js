import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import reviewRequestMiddleware from "../middlewares/requestMiddlewares/reviewRequest.middleware.js";

const router = express.Router();

/** 리뷰 생성 API **/

router.post("/", async (req, res) => {
  try {
    // 제목, 책이름, 컨텐츠, 작성자이름, 별점, 비밀번호를 받아와
    const { title, book_name, content, user_name, star, password } = req.body;
    // 별점이 0에서 부터 10점 까지 기에 제한함.
    if (star > 10 || star < 0) {
      return res
        .status(400)
        .json({ errorMessage: "별점은 1점부터 10점까지 넣을 수 있습니다." });
    }
    // 비밀번호를 개발자 본인도 모르게 하기 위해 bcrypt 를 통해 해쉬 화 한다.
    const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));
    const hash_password = bcrypt.hashSync(password, salt);
    // 크리에이트 리뷰 를 통해 값을 담음
    const createReview = await prisma.review.create({
      data: {
        title,
        book_name,
        content,
        user_name,
        star,
        password: hash_password,
      },
    });
    // 값을 리스폰스 해주는 부분.
    return res
      .status(201)
      .json({ message: "작성완료 되었습니다.", data: createReview });
  } catch (err) {
    return res.status(400).json({ errorMessage: err.message });
  }
});

/** 리뷰 조회 API **/
router.get("/", async (req, res) => {
  try {
    // 프리즈마 메소드 를 통해 findMany 로 값을 불러와 
    // 사용자 에게 보여주는 부분.
    const reviews = await prisma.review.findMany({
      select: {
        // 값을 트루로 한 컬럼 값만 가져온다.
        title: true,
        book_name: true,
        user_name: true,
        star: true,
        created_at: true,
      },// 생성 날짜 내림차순 으로 정렬을 위해 orderBy 사용.
      orderBy: [{ created_at: "desc" }],
    });

    // 사용자 에게 리스폰스.
    return res.status(200).json({ data: reviews });
  } catch (err) {
    return res.status(400).json({ errorMessage: err.message });
  }
});

/** 리뷰 상세 API **/
// 리뷰 미들웨어는 미들 웨어에서 설명함.
router.get("/:id", reviewRequestMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // 프리즈마 메소드 ?? findUnique (단일 데이터베이스 레코드를 검색 하게 해줌.) EX) Id, attribute
    const review = await prisma.review.findUnique({
      where: { id },
    });
    // 리뷰가 존재 하지 않을 경우.
    if (!review) {
      return res.status(404).json({ errorMessage: "찾는 리뷰가 없습니다." });
    }
    // 찾은 값 클라이언트 에게 리스폰스
    return res.status(200).json({ data: review });
  } catch (err) {
    return res.status(400).json({ errorMessage: err.message });
  }
});

/** 리뷰 수정 API **/
// 수정 부분에서는 수정할 Id, 그리고 비밀번호를 검사해 일치 하는 경우에만 
// 수정이 가능 하도록 구현.
router.put("/:id", reviewRequestMiddleware, async (req, res) => {
  try {
    // 수정이기에 아이디 값, 수정할 값들을 받아옴.
    const { id } = req.params;
    const { title, book_name, content, user_name, star, password } = req.body;

    if (star > 10 || star < 0) {
      return res
        .status(400)
        .json({ errorMessage: "별점은 1점부터 10점까지 넣을 수 있습니다." });
    }

    const review = await prisma.review.findUnique({
      where: { id },
    });

    // // 선택한 리뷰가 존재하지 않을 경우, “존재하지 않는 리뷰입니다." 메시지 반환하기
    if (!review) {
      return res
        .status(400)
        .json({ errorMessage: "존재하지 않는 리뷰입니다." });
    }
    // 체크해쉬 -> 받은 password 와 review에 있는 password와 비교 하여 
    const checkHash = bcrypt.compareSync(password, review.password);
    // 틀리다면 출력.
    if (!checkHash) {
      return res.status(400).json({ errorMessage: "비밀번호가 틀렸습니다." });
    }
    // 위에서 값들을 불러오고 받은 값은 updateReview에 담겨. 프리즈마 메소드 update 를 통해 
    const updateReview = await prisma.review.update({
      where: { id },
      data: { title, book_name, content, user_name, star },
    }); // 값을 받고 리스폰스 한것
    return res
      .status(200)
      .json({ message: "수정에 성공했습니다", data: updateReview });
  } catch (err) {
    return res.status(400).json({ errorMessage: err.message });
  }
});

/** 리뷰 삭제 API **/
// 값만 삭제 하기에 아이디, 비밀번호만 불러옴.
router.delete("/:id", reviewRequestMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    const checkHash = bcrypt.compareSync(password, review.password);

    if (!checkHash) {
      return res.status(400).json({ errorMessage: "비밀번호가 틀렸습니다." });
    }
    if (!review) throw { errorMessage: "데이터가 존재 하지 않습니다." };

    await prisma.review.delete({
      where: { id },
    }); // 
    return res.status(200).json({ Message: "리뷰가 삭제 되었습니다." });
  } catch (err) {
    return res.status(400).json({ errorMessage: err.message });
  }
});

// 이 부분은 router로 내보낸다.
export default router;
