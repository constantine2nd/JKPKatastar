import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  let token;
  console.log("Protect");

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("Decoded TOKEN", decoded);

      if (!decoded) {
        console.log(err);
        console.log("ERROR");
        res.status(401).send({ message: "You are not loggged. Authorization token cannot be verified." });
      } else {
        console.log("DALJE");
        //  console.log('userName: ', decoded?.userName)
        req.userName = decoded?.userName;
        next();
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log("Authorization token Expired");
        res.status(401).send({ message: "You are not loggged. Token Expired." });
      }
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    console.log("There is no authorization token.");
    res.status(401).send({ message: "You are not loggged. There is no authorization token." });
  }
};

export { protect };
