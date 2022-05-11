const Database = require("@replit/database")
const express = require('express')
const path = require('path')
const cors = require('cors')

const db = new Database()

const PORT =  3000
const app = express()
app.use(express.json())
app.use(cors())

app.post('/mem/set', async (req, res) => {
  console.log(req.headers["x-forwarded-for"])
  
  try{
  let d = req.body

  let x = await db.get(d.name.replace(/ /g, '_'))
  if(x !== null)
    for (let [key, value] of Object.entries(x)){
      if(value.time > d.data[key].time){
        x[key].time = d.data[key].time
        x[key].steps = d.data[key].steps
      }
    }
  else x = d.data
    if(x === null)throw new Error()
  
  db.set(d.name.replace(/ /g, '_'), x).then(() => res.status(200).send(true)).catch((err) => res.status(400).send("Error"))
  }catch(err){
    return res.status(400).send("Error")
  }
})
app.get('/mem/get', (req, res) => {
  console.log(req.headers["x-forwarded-for"])
  db.get(req.headers.name.replace(/ /g, '_')).then((info) => res.status(200).send(info || "Error")).catch((err) => res.status(400).send("Error"))
})

app.get('/mem/getAll', async (req, res) => {
  console.log(req.headers["x-forwarded-for"])
  let keys = await db.list()
  let s = {}
  for(let key of keys){
    let val = await db.get(key)
    if(val !== null) s[key] = val
  }

  res.status(200).send(s)
})

app.get('*', (req, res) => {
  res.status(404).send('404 error')
})

app.listen(PORT, () => {
  console.log(`Server has been started on port ${PORT}...`)
})

async function clear(){
    let e = await db.list()
    await e.forEach(async t => await db.delete(t))
}

