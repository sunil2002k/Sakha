import { Router } from "express";
const userRouter = Router()

userRouter.get('/',(req,res)=>{
    res.send({title: 'Fetch all users'})
})
userRouter.get('/:id',(req,res)=>{
    res.send({title: 'Fetch user by id'})
})
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