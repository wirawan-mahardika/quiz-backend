import passport from 'passport'
import userService from '../services/user-service.js'
import { createJwtToken } from "../utils/jwt.js";

const register = async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({
      statusCode: 201,
      status: "OK",
      message: "signup success, account has been created",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const login = (req, res, next) => {
  try {
    userService.login(req.body);
    passport.authenticate("local", (err, user) => {
      if (err) {
        return res
          .status(401)
          .json({
            statusCode: 401,
            status: "NOT OK",
            message: err,
          })
          .end();
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            statusCode: 401,
            status: "NOT OK",
            message: "an error occured, please try again in a few minutes",
          });
        }
        const token = createJwtToken({ email: user.email }, false);
        return res.json({
          statusCode: 200,
          status: "OK",
          message: "login success",
          data: { token },
        });
      });
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(
        new ResponseError(500, "Failed to logout, something went wrong")
      );
    }
    req.session.destroy();
    res.clearCookie("user-session");
    return res.json({
      statusCode: 200,
      status: "OK",
      message: "Logout success",
    });
  });
};

const refreshToken = (req, res, next) => {
  try {
    const refreshToken = req.session.passport.user.refreshToken;
    const token = userService.refreshToken(refreshToken);
    res.status(201).json({
      statusCode: 201,
      status: "OK",
      message: "success generate new token",
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserTestResult = async (req, res, next) => {
  try {
    const result = await userService.getUserTestResult(req.body);
    res.json({
      statusCode: 200,
      status: "OK",
      message: "Test result accepted",
      detail: {
        testResult: result,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  getUserTestResult,
};