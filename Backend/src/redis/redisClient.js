import pkg from "redis";

const { createClient } = pkg;
const redisClient = createClient({
    username: 'default',
    password: '1bBfuSoW3U7cpBbzGXhw6PeC5wjJ9Txj',
    socket: {
        host: 'redis-15847.c245.us-east-1-3.ec2.cloud.redislabs.com',
        port: 15847
    }
});


redisClient.on("error",(error)=>{
  console.log("redis client error : ",error)
})

redisClient.on("connect",()=>{
  console.log("connecting to redis...")
})

redisClient.on("ready",()=>{
  console.log("redis connected successfully")
})

redisClient.connect()

export default redisClient