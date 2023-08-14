import passport from 'passport'
import userService from '../services/user-service.js'

const register = async (req,res,next) => {
    try {
        const user = await userService.register(req.body)
        res.status(201).json({
          statusCode: 201,
          status: "OK",
          message: "signup success, account has been created",
          data: user,
        });
    } catch (error) {
        next(error)
    }
}

const login = (req,res,next) => {
    try {
        userService.login(req.body)
        passport.authenticate('local', (err, user) => {
            if(err) {
                return res.status(401).json({
                    statusCode: 401,
                    status: "NOT OK",
                    message: err,
                }).end()
            }
            req.login(user, (err) => {
                if(err) {
                    console.log(err)
                    return res.status(500).json({
                        statusCode: 401,
                        status: "NOT OK",
                        message: "an error occured, please try again in a few minutes"
                    })
                }
                return res.json({
                    statusCode: 200,
                    status: "OK",
                    message: "login success"
                })
            })
        })(req,res,next)
    } catch (error) {
        next(error)
    }
}


export default {
    register,
    login
}