class UserApiController{

    static async list_users(req, res){
        try {
            return res.status(200).json({
                error: false,
                msg:'User List'
            })
        } catch (err) {
            console.log('i am in else cond')
            console.log('i am in error of list_users user')
            console.log('err')
            console.log(err)
            return res.json({ error : true,err,msg:'Ops something went wrong please try again later' });
        }
        
    }
    
}
export default UserApiController;