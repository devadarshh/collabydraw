import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
  name: string;
}

const generateJWTToken = ({ id, email, name }: UserPayload): string => {
  const payload: UserPayload = { id, email, name };

  const SECRET_KEY = process.env.JWT_SECRET_KEY;
  if (!SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables");
  }
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "12h" });
};

export default generateJWTToken;
