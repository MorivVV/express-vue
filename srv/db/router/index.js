const expr = require("express");
const ajaxApi = require("./controllers/ajaxApi");
const ajaxMysql = require("./controllers/ajaxMysql");
const apiService = require("./controllers/apiService");
const authorization = require("./controllers/authorization");
const fileDelete = require("./controllers/fileDelete");
const fileDownload = require("./controllers/fileDownload");
const fileUpload = require("./controllers/fileUpload");
const userActivate = require("./controllers/userActivate");
const userActivateFromUrl = require("./controllers/userActivateFromUrl");
const userRegister = require("./controllers/userRegister");
const userResetPassword = require("./controllers/userResetPassword");
const router = expr.Router();
//скачивание файлов
router.get("/:id/download",fileDownload);

//удаление файлов
router.post("/:id/delete",fileDelete);

//загрузка файлов
router.post("/upload", fileUpload);

//Отлавливаем запросы AJAX на получение данных
router.post("/ajax", ajaxApi);

//Отлавливаем запросы AJAX на получение данных из mysql
router.post("/ajax/mysql", ajaxMysql);

//Сервисы апи
router.post("/api/:id", apiService);

//Авторизация пользователя
router.post("/autorization", authorization);

//Регистрация пользователя
router.post("/register", userRegister);

//Сброс пароля пользователя
router.post("/resetpass", userResetPassword);

//Активация пользователя
router.get("/activate", userActivateFromUrl);
router.post("/activate", userActivate);


module.exports = router;