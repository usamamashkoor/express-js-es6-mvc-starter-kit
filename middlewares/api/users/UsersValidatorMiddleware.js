import { check } from 'express-validator';
import mongoSanitize  from '../../../helpers/sanitization/mongoSanitize.js';
const UsersValidatorMiddleware = {};
UsersValidatorMiddleware.validate = (method) => {
    switch (method) {
        case 'loginUser': {
            return [
                check('email', 'Invalid email').exists().isEmail().escape().trim().notEmpty().customSanitizer(mongoSanitize),
                check('password').isLength({ min: 8 }).exists().escape().trim().notEmpty().customSanitizer(mongoSanitize),
            ]
        }
        case 'registerUser': {
            return [
                check('first_name', 'First name is required').exists().escape().trim().notEmpty().customSanitizer(mongoSanitize),
                check('last_name', 'last name is required').exists().escape().trim().notEmpty().customSanitizer(mongoSanitize),
                check('email', 'Invalid email').exists().isEmail().escape().trim().notEmpty().customSanitizer(mongoSanitize),
                check('password').isLength({ min: 8 }).exists().escape().trim().notEmpty().customSanitizer(mongoSanitize),
            ]
        }
    }
}
export default UsersValidatorMiddleware;
