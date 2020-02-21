let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    username:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
  });

let user=module.exports=mongoose.model('user',userSchema);