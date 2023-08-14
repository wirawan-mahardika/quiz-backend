import zxcvbn from "zxcvbn";
import { ResponseError } from "../error/ResponseError.js";

export function passwordStrengthTest(password) {
    const result = zxcvbn(password)
    if(result.score < 3) {
        throw new ResponseError(400, 'weak password', {
            warning: result.feedback.warning,
            suggestions: result.feedback.suggestions
        })
    }
}