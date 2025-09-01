import jwt, { JwtPayload } from "jsonwebtoken";
const generateJWTToken = ({ id, email }: JwtPayload): string => {
  const payload = { id, email };
  const SECRET_KEY = process.env.JWT_SECRET_KEY;
  if (!SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables");
  }

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "12h" });

  return token;
};

export default generateJWTToken;
