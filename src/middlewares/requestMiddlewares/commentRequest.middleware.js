const commentRequestMiddleware = function (req, res, next) {
    // id 값을 parseInt 를 통해 number 로 나오게끔 함.
  // 이 과정을 수행 해야 아이디로 조회 하는 과정 하나 하나에 parseInt를 붙이지 않게 끔. 
  req.params.id = parseInt(req.params.id);
  req.params.review_id = parseInt(req.params.review_id);

  if (!req.params.review_id) {
    return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }

  next();
};

export default commentRequestMiddleware;
