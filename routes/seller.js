const router = require('express').Router();
const Product = require('../models/product');

const multer = require('multer');
const checkJWT = require('../middlewares/check-jwt');
const faker = require('faker');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.route('/products')
  .get(checkJWT, (req, res, next) => {
    Product.find({ owner: req.decoded.user._id })
      .populate('owner')
      .populate('category')
      .exec((err, products) => {
        if (products) {
          res.json({
            success: true,
            message: "Product",
            products: products
          });
        }
      });
  })
  .post([checkJWT, upload.single('product_picture')], (req, res, next) => {
    console.log(req.file);
    let product = new Product();
    product.owner = req.decoded.user._id;
    product.category = req.body.categoryId;
    product.title = req.body.title;
    product.price = req.body.price;
    product.description = req.body.description;
    product.image = 'http://localhost:3030/' + req.file.path;
    product.save();
    res.json({
      success: true,
      message: 'Successfully Added the product',
    });
  });

  /*just fortesting */
  router.get('/faker/test', (req, res, next) => {
    for (i=0; i<20; i++) {
      let product = new Product();
      product.category = "5acb7608d7148219e07fbefe";
      product.owner = "5ac832c969d314060472e22c";
      product.image = faker.image.cats();
      product.title = faker.commerce.productName();
      product.description = faker.lorem.words();
      product.price = faker.commerce.price();
      product.save();
    }

    res.json({
      message: "Successfully added 20 pictures"
    });
  });

module.exports = router;
