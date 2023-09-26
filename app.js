const express = require("express")
const axios = require("axios")
const path = require("path")
const multer = require("multer")
const app = express()
const csv = require('csv-parser')
const fs = require('fs')
const results = [];

const options = {
    headers: {
      "content-type": "application/json",
      authorization: "Bearer 8b2c264c171d1a61d116a6dcdfd14aa85450cb8313253a7b25786d222f59f9f8",
    },
  };

// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")

    
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
  
        // Uploads is the Upload_folder_name
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + ".csv")
    }
  })
         
var upload = multer({ 
    storage: storage,
limits: { /*fileSize: maxSize */},
    fileFilter: function (req, file, cb){
    
        // Set the filetypes, it is optional
        var filetypes = /csv/;
        var mimetype = filetypes.test(file.mimetype);
  
        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
      } 
  
}).single("document");       
  
app.get('/', (req, res) => {
    res.render('home');
});
app.get('/thankyou', (req, res) => {
    res.render('thankyou');
});


app.post("/uploadProfilePicture",function (req, res, next) {
    upload(req,res,function(err) {
        if(err) { res.send(err)}
        else {res.redirect("thankyou");
        fs.createReadStream('uploads/document.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log(results);
            console.log(results.length);
            
                results.forEach(element => {
                    let data_kantata=JSON.stringify({
                        "story": {
                        "workspace_id": element.workspace_id,
                        "title": element.title,
                        "story_type": element.story_type,
                        "description": element.description,
                        "start_date": element.start_date,
                        "due_date": element.due_date,
                        "state": element.state
                        }
                    });
                    console.log(data_kantata);
                    setTimeout( function() {
                        const { data: createSession } =  axios.post("https://api.mavenlink.com/api/v1/stories?include=string&optional_fields=can_edit",data_kantata,options);
                      }, 100);
                
                });
        
        }); }
    })
})

app.listen(3000,function(error) {
    if(error) throw error
        console.log("Server created Successfully on PORT 3000")
})

