import { Router } from "express";
import { getUser, getUserById } from "../controllers/user.controller.js";
const userRouter = Router();

userRouter.get('/getUser', getUser);

userRouter.get('/:id', getUserById);
userRouter.post('/',(req,res)=>{
    res.send({title: 'create new user'})
})
userRouter.put('/:id',(req,res)=>{
    res.send({title: 'update user by id'})
})
userRouter.delete('/:id',(req,res)=>{
    res.send({title: 'delete user by id'})
})

export default userRouter;