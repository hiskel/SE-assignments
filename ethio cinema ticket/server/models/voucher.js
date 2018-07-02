var mongoose = require('mongoose')
var Schema = mongoose.Schema;


var voucher_schema = new Schema({
    number: {type: Number, unique: true, required: true},
    value: {type: Number, required: true}, 
    used: {type: Boolean, default: false}
});

voucher_schema.methods.isUsed = function() {
    return this.used;
}

voucher_schema.methods.invalidate = function() {
    this.used = true;
}

module.exports = mongoose.model('Voucher', voucher_schema);