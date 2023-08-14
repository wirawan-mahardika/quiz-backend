import express from 'express'
import userController from '../controller/user-controller'

const publicRoute = express.Router()

publicRoute.post('/api/users/register', userController.register)
publicRoute.post('/api/users/login', userController.login)

export default publicRoute