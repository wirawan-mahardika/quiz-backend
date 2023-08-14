import { ResponseError} from '../error/ResponseError.js'

export function errorMiddleware(err,req,res,next) {
    if(!err) {
        return next()
        
    }
    if(err instanceof ResponseError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            status: err.status,
            message: err.message,
            data: err.data,
            detail: err.detail
        })
    } else {
        return res.status(500).json({
            statusCode: 500,
            status: "NOT OK",
            message: "INTERNAL SERVER ERROR",
        })
    }
}