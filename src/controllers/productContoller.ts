import {Request,Response} from 'express'
import Product from '../database/models/Product'
import { AuthRequest } from '../middleware/authMiddleware'
import User from '../database/models/User'
import Category from '../database/models/Category'


class ProductController{
    async addProduct(req:AuthRequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const {productName,productDescription,productTotalStockQty,productPrice,categoryId} = req.body 
        let fileName
        if(req.file){
            fileName  = req.file?.filename
        }else{
            fileName = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVhZHBob25lfGVufDB8fDB8fHww"
        }
        if(!productName || !productDescription || !productTotalStockQty || !productPrice || !categoryId){
            res.status(400).json({
                message : "Please provide productName,,productDescription,productTotalStockQty,productPrice,categoryId"
            })
            return
        }
        await Product.create({
            productName,
            productDescription,
            productPrice,
            productTotalStockQty,
            productImageUrl : fileName,
            userId : userId,
            categoryId : categoryId
        })
        res.status(200).json({
            message : "Product added successfully"
        })
    }
    async getAllProducts(req:Request,res:Response):Promise<void>{
        const data = await Product.findAll(
            {
                include : [
                    {
                        model : User,
                        attributes : ['id','email','username']
                    },
                    {
                        model : Category,
                        attributes : ['id','categoryName']
                    }
                ]
            }
        )
        res.status(200).json({
            message : "Products fetched successfully",
            data 
        })
    }
    async getSingleProduct(req:Request,res:Response):Promise<void>{
     const id = req.params.id 
     const data = await Product.findAll({
        where : {
            id : id
        },
        include : [
            {
                model : User,
                attributes : ['id','email','username']
            },
            {
                model : Category,
                attributes : ['id','categoryName']
            }
        ]
     })
     if(data.length == 0 ){
        res.status(404).json({
            message : "No product with that id"
        })
     }else{
        res.status(200).json({
            message : "Product fetched successfully",
            data
        })
    }
    }

    async deleteProduct(req:Request,res:Response):Promise<void>{
        const {id} = req.params
        const data = await Product.findAll({
            where : {
                id : id
            }
         })
         if(data.length > 0  ) {
           await Product.destroy({
                where : {
                    id : id
                }
            }) 
            res.status(200).json({
                message : "Product deleted successfully"
            })
         }else{
            res.status(404).json({
                message : "No product with that id"
            })
         }
       
    }
    
    async updateProduct(req: AuthRequest, res: Response): Promise<void> {
        const { id } = req.params
        const { productName, productDescription, productTotalStockQty, productPrice, categoryId } = req.body
        let fileName
        const userId = req.user?.id
    console.log(req.body)
        if (!productName || !productDescription || !productTotalStockQty || !productPrice || !categoryId) {
            res.status(400).json({
                message: "Please provide productName, productDescription, productTotalStockQty, productPrice, categoryId"
            })
            return
        }
    
        const product = await Product.findByPk(id)
    
        if (!product) {
            res.status(404).json({
                message: "Product not found"
            })
            return
        }
    
        if (req.file) {
            fileName = req.file.filename
        } else {
            fileName = product.productImageUrl // Retain the existing image if no new image is uploaded
        }
    
        await product.update({
            productName,
            productDescription,
            productTotalStockQty,
            productPrice,
            productImageUrl: fileName,
            userId,
            categoryId
        })
    
        res.status(200).json({
            message: "Product updated successfully"
        })
    }
    
    
    
    
}

export default new ProductController()