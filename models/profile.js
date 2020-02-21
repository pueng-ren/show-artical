let mongoose = require('mongoose');
let ProfileSchema = mongoose.Schema({
    name:{
        type: String,
    },
      user_id:{
        type: String,
        required: true     
     }
    });

let profile=module.exports=mongoose.model('profile',ProfileSchema);