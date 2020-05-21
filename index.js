const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
MongoClient.connect('mongodb://dbUser:dbPassword1@ds249623.mlab.com:49623/getir-case-study', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("getir-case-study");
    function postdata(req,res) {
        let body = req.body
        let query = {
            createdAt: {
                $gte: new Date(body.startDate),
                $lte: new Date(body.endDate)
            },
            totalCount: {
                $gte: body.minCount,
                $lte: body.maxCount
            }
        }
        dbo.collection("records").aggregate([
            {
                 "$addFields": { 
                     "totalCount": { "$sum": "$counts"}
                     }
            },
            {
                "$match": query
            },
            { $project : {
                _id: 0,
                createdAt : 1 ,
                key : 1,
                totalCount:1
             } 
            }
            ]).toArray().then((result)=>{
                if (!result) {
                    res.json({
                        "code": 1,
                        "msg": "Error",
                        "records": []
                    })
                }
                else
                    res.json({
                        "code": 0,
                        "msg": "Success",
                        "records":result
                    })               
            })
            
        
        
    }    
    app.post('/postdata', postdata)

});
app.listen(process.env.PORT || 5000, () => console.log("server 5000 portunda calismaktadir"))