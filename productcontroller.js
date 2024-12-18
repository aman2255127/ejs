const db = require('../../models');
const helper = require('../../helper/helper');
const { Validator } = require('node-input-validator');

db.products.belongsTo(db.category, {
    foreignKey: "cat_id",
    as: "categoriess",
});
module.exports = {
    createproducts: async (req, res) => {
        try {
            const v = new Validator(req.body, {
                cat_id: "required",
                product_name: "required",
                price: "required",
                // image: "required",
            });
            let errorsResponse = await helper.checkValidation(v);
            if (errorsResponse) {
                return helper.error(res, errorsResponse);
            }
            if (req.files && req.files.image) {
                let images = await helper.fileUpload(req.files.image);
                req.body.image = images;
            }
            const newproducts = await db.products.create({
                cat_id: req.body.cat_id,
                product_name: req.body.product_name,
                price: req.body.price,
                image: req.body.image,

            });
            // req.flash("success", "Add products successfully");
            // res.redirect("/categorylist");
            return res.status(201).json({ message: "products created successfully", data: newproducts });
        } catch (error) {
            console.error("Error creating products:", error);
            return helper.error(res, "Internal server error");
        }
    },
    productslist: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            const service = await db.products.findAll({
                include: [{ model: db.category, as: 'categoriess' }],
            });
            res.render("products/productslist", {
                title: "Products",
                service,
                session: req.session.admin,
            });
        } catch (error) {
            console.error("Error view:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    productstatus: async (req, res) => {
        try {
            const { id, status } = req.body;
            const result = await db.products.update(
                { status: status },
                { where: { id } }
            );
            if (result[0] === 1) {
                res.json({ success: true, message: 'Status updated successfully' });
            } else {
                res.status(400).json({ success: false, message: 'Status change failed' });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    productsview: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            let view = await db.products.findOne({
                where: {
                    id: req.params.id,
                },
                include: [{ model: db.category, as: 'categoriess' }]
            });

            res.render("products/productsview.ejs", {
                session: req.session.admin,
                view,
                title: 'Product Detail',
            });
        } catch (error) {
            console.error("Error fetching view", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    addproducts: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            res.render('products/addproduct', {
                session: req.session.admin,
                title: "Add Category",
            });
        } catch (error) {
            console.error("Error view", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

}