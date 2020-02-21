let mongoose = require('mongoose');
let ArticalSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
      },
      img_pro:{
        type: String,
        required: false
      },
      author:{
        type: String,
        required: true
      },
      type:{
        type: String,
        required: true
      },
      short_text : {
        type: String,
        required: false
      },  
      body:{
        type: String,
        required: false
      },  
      date:{
        type: String,
        required: true
      },
      status:{
        type: String,
        required: true
      },
      recomment:{
        type: String,
        required: true
      }
    });

let artical=module.exports=mongoose.model('artical',ArticalSchema);