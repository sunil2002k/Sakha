import { Router } from "express";

const projectRouter = Router()

projectRouter.get('/',(req,res)=>{
    res.send({title:'get all the projects'})
})

projectRouter.get('/:id',(req,res)=>{
    res.send({title:'get specific projects'})
})

projectRouter.post('/',(req,res)=>{
    res.send({title:'create the projects'})
})

projectRouter.put('/:id',(req,res)=>{
    res.send({title:'update projects'})
})

projectRouter.delete('/:id',(req,res)=>{
    res.send({title:'delete all the projects'})
})

projectRouter.get('/user/:id',(req,res)=>{
    res.send({title:'get all the user projects'})
})

projectRouter.put('/:id/cancel',(req,res)=>{
    res.send({title:'update  the specific projects'})
})

projectRouter.get('/upcoming-renewals',(req,res)=>{
    res.send({title:'get all the projects'})
})


export default projectRouter