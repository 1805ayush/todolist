//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


mongoose.connect("mongodb+srv://"+process.env.USERID+":"+process.env.PASSWORD+"@cluster0.gsykf.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
const itemsSchema = {
  name: String,
};

const Item = mongoose.model("item", itemsSchema);

const webdev = new Item({
  name: "Web dev course",
});
const guitar = new Item({
  name: "Learn new chords",
});
const keyboard = new Item({
  name: "Play the keyboard",
});

const defaultItems = [];


const listSchema={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema)

app.get("/", function (req, res) {


  Item.find({}, function (err, foundItems) {

    // if (foundItems.length === 0) {
    //   Item.insertMany(defaultItems, function (err) {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log("Successfully added");
    //     }
    //   })
    //   res.redirect("/");
    // }else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    // }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  })

  if(listName ==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      if(err){
        console.log(err);
      }else{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:newList", function (req, res) {
  
  const newListTitle = _.capitalize(req.params.newList);
  List.findOne({name: newListTitle},function(err, foundList){
    if(!err){
      // if(!foundList){
      //   //create new list
      //   const list = new List({
      //     name: newListTitle,
      //     items: defaultItems,
      //   });
      
      //    list.save();
      //   res.redirect("/"+newListTitle);
      // }else{
      //   //show existing list
          res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      // }
    }
  })
 
 
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/delete",function(req,res){
  const checkedItemId =req.body.checkbox;
  const listName =req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("successfully deleted!");
        res.redirect("/");
      }
    });
  }else{
     List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}}, function(err,foundList){
       if(!err){
         res.redirect("/"+listName);
       }
     })
  }
 
})

let port = process.env.PORT;
if(port==null || port ==""){
  port =3000;
}
app.listen(port, function () {
  console.log("Server started successfully");
});

