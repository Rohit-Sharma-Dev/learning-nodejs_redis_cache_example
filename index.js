const express=require('express')
const axios=require('axios')
const redis=require('redis');
// const fetch = require('node-fetch')
const { response } = require('express');

// creating express application instance
const app=express();

 
// create and connect redis client to local instance.
const client=redis.createClient(6379);


// give redis errors to the console
client.on('error',(err)=>{
    console.log("Error"+ err )
})

app.get('/photos',(req,res)=>{

    const photosRedisKey='user:photos';

    return client.get(photosRedisKey,(err,photos)=>{
        if (photos){
            return res.json({source:'cache',data:JSON.parse(photos)})
        }else{
            axios.get('https://jsonplaceholder.typicode.com/photos')
            .then(res => res.data)
            .then(photos =>{
                  // Save the  API response in Redis store,  data expire time in 3600 seconds, it means one hour
                  client.setex(photosRedisKey, 3600, JSON.stringify(photos))
 
                  // Send JSON response to client
                  return res.json({ source: 'api', data: photos })
            })
            .catch(error=>{
                console.log(error)
                 // send error to the client 
                 return res.json(error.toString())
            })
        }
    })
})

app.listen(3000,()=>{
    console.log('your post is runnig on 3000 .....')
})




