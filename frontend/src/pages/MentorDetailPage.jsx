import React from 'react'
import {useParams} from "react-router-dom"


const MentorDetailPage = () => {
  const {id} = useParams()
  return (
    <div>MentorDetailPage for  {id}</div>
  )
}

export default MentorDetailPage