import express from "express";
import productRouter from "./product.router";

const router = express.Router();

export default (): express.Router => {
    productRouter(router);
    return router;
};
