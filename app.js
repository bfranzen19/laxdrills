const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/laxdrills', { useMongoClient:true }, function(mongooseErr) {
  if(mongooseErr) { console.log('mongoose error: ' + mongooseErr); }
  else { console.log('mongoose ACTIVAAAATE!'); }
})
mongoose.Promise = global.Promise;

const DrillSchema = new mongoose.Schema({
    id: {
        type:     String,
        required: true,
        unique:   true,
    },
    type {
        type:     String,
        required: true
    }
});

let DrillModel = mongoose.model('drill', DrillSchema);
