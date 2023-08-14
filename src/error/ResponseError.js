export class ResponseError extends Error {
    constructor(statusCode, message, detail, data) {
        super(message)
        this.statusCode = statusCode
        this.status = 'NOT OK'
        this.detail = detail || null
        this.data = data || null
    }
}