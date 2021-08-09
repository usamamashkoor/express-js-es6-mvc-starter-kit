import express from "express";
import UsersApiController from '../../controllers/Users/UsersApiController.js';

express.application.prefix = express.Router.prefix = function (path, configure) {
    let router = express.Router();
    this.use(path, router);
    configure(router);
    return router;
};
const router = express.Router();



// No Login required routes
// router.post('/register-user',[],UsersApiController.signup_user);
router.post('/list-user',UsersApiController.list_users);



// module.exports = router;
export default router;
