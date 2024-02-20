const router = require('express').Router();
const apiController = require('../controllers/apiController');
const {upload} = require('../middlewares/multer');


router.get('/landing-page', apiController.landingPage);
router.get('/item-details/:id', apiController.itemDetails);
router.post('/booking-page', upload, apiController.bookingPage);
module.exports = router;