class HomeController {
    static async home(req, res) {
        res.render("home", {
            "name":"Usama"
        });
    }



}
export default HomeController;