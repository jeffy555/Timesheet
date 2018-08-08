const mongoose = require('mongoose');

//User Schema

const TaskSchema = mongoose.Schema({
  Task:{
    type:String,
    required:true
  },
  Team:{
    type:String,
    required:true
  },
  Project:{
    type:String,
    required:true
  },
  Duration:{
    type:Number,
    required:true
  },
});

const task = module.exports = mongoose.model('task', TaskSchema);
