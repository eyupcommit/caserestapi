//yuklemis oldugumuz paketleri tanımladık
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express()
//ara katmanda json datanın parse işlemi sağlandı
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
//mongo db ile bağlantı kuruldu.
MongoClient.connect('mongodb+srv://challengeUser:WUMglwNBaydH8Yvu@challenge-xzwqd.mongodb.net/getir-case-study?retryWrites=true', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    //calisacağimiz database tanımlandı
    var dbo = db.db("getir-case-study");
    //api için fonksiyonumuz oluşturduk
    function postdata(req,res) {
        //requestin body sini aldik
        let body = req.body
        //requestteki tarih kontrolu yapildi
        if(isNaN(Date.parse("\""+new Date(body.startDate)+"\""))||isNaN(Date.parse("\""+new Date(body.endDate)+"\"")))
        {
            res.json({
                "code": 2,
                "msg": "Error startDate endDate  tarih olmali",
                "records": []
            })
        }
        //requestteki sayi kontrolu yapildi
        else if(typeof body.minCount!='number' || typeof  body.maxCount!='number'){
            res.json({
                "code": 3,
                "msg": "Error minCount maxCount icin sayi olmali",
                "records": []
            })
        }  
        //requestteki degerlerin buyuk kucuk kontrolu yapildi
        else if (body.startDate>body.endDate || body.minCount>body.maxCount){
            res.json({
                "code": 4,
                "msg": "Error startDate endDate den buyuk veya minCount maxCount degerinden buyuk olamaz",
                "records": []
            })
        }   
        else{
            //createdAt totalCount değerlerimiz için buyuk kucuk aralik query sini olusturduk
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
        //collection dan istenilen response a gore aggregate func olusturduk
        dbo.collection("records").aggregate([
            {
                //totalcountumuz icin yeni bir alan ekleyip countslarin toplami alındı
                 "$addFields": { 
                     "totalCount": { "$sum": "$counts"}
                     }
            },
            {
                // yukarda olusturdugumuz querymizi collectiondaki eslesmeleri sagladik
                "$match": query
            },
            {//formatta uygun response icin alanlarimizi duzenledik
                 $project : {
                _id: 0,
                createdAt : 1 ,
                key : 1,
                totalCount:1
             } 
            }
            //sonucumuzu dondurduk
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
    }      
    app.post('/postdata', postdata)

});
//heroku ile uyumlu olan 5000 portu secildi
app.listen(process.env.PORT || 5000, () => console.log("server 5000 portunda calismaktadir"))