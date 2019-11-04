const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const employeeModel=require('../models/employees');
const vendorModel=require('../models/vendors');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
const BeneficialSchema = new Schema({
    date: {
         type : String,
         default: new Date
    },
    type: {
        type: String,
        required: true
    },
    file_content:{
        type:String,
        required:true
    },
    person:{
        type:String,
        required:true
    }
    ,count:{
        type:String,
        required:true
    },amount:{
        type:String,
        required:true
    }
});
let beneficiary =mongoose.model('Beneficial',BeneficialSchema);

beneficiary.getAllUser = async()=>{
    try {
        let users = await beneficiary.find();
        if(users && users.length>0){
            return users
        }else{
            return "NO user Exists"
        }
    } catch (error) {
        return error.message
    }
}

beneficiary.save_benficial=async(body)=>{
    try {
        
        body.amount = cryptr.encrypt(body.amount);
        body.date =new Date();
        let save_benficiary =await beneficiary.create(body);
        if(save_benficiary && save_benficiary.type){
            return save_benficiary
        }else{
            return "Data Couldn't save"
        }
    } catch (error) {
        return error.message
    }
}

beneficiary.deleteBenefit=async(id)=>{
    try {
        let deletedBenefit =await beneficiary.deleteOne({_id:id});
        if(!deletedBenefit){
            return "No BEnefit deleted"
        }else{
            return deletedBenefit;
        }
    } catch (error) {
        console.log("inside model",error.message)
        return error.message
    }
}
beneficiary.getUserByName=async(name)=>{
        try {
            let getUser =await beneficiary.findOne({name:name});
            if(!getUser){
                return "No User"
            }else{
                return getUser;
            }
        } catch (error) {
            console.log("inside model",error.message)
            return error.message
        }
}

beneficiary.get_beneficial_by_date=async(body)=>{
    try {
        d1=body.selected_year+"-"+body.selected_month+"-"+body.selected_day+" 00:00:00.812" 
        d2=body.selected_year+"-"+body.selected_month+"-"+body.selected_day+" 23:00:00.812189" 
        d1=new Date(d1);
        d2=new Date(d2);
        let get_beneficial_by_date  =await beneficiary.find({"date":{$gte:d1,$lte:d2}});
        if(get_beneficial_by_date){
            for(let i=0;i<get_beneficial_by_date.length;i++){
                get_beneficial_by_date[i].amount =cryptr.decrypt(get_beneficial_by_date[i].amount);
                 }
            return get_beneficial_by_date
        }else{
            return "No data";
        }
    } catch (error) {
        return error.message
    }
}
beneficiary.getLastRecord=async()=>{
    try {
        let getLastRecord =await  beneficiary.findOne().limit(1).sort({$natural:-1})
        if(getLastRecord){
            return getLastRecord;
        }else{
            return "No record";
        }
    } catch (error) {
        return error.message;
    }
}
beneficiary.get_myreport=async(id)=>{
    try {
        let getLastRecord =await beneficiary.findOne({_id:id});
        if(getLastRecord){
            return getLastRecord;
        }else{
            return "No record";
        }
    } catch (error) {
        return error.message;
    }
}
beneficiary.check_beneficial_name =async(body)=>{
    try {
        
        if(body.type=='Employee'){
                let ifemployee = await employeeModel.findOne({name:body.name});
                if(!ifemployee){
                    return false;
                }else{
                    return true;
                }
            }else if(body.type=='Vendor'){
                let ifvendor = await vendorModel.findOne({name:body.name});
                if(!ifvendor){
                    return false;
                }else{
                    return true;
                }
            }    
    } catch (error) {
        return error.message;
    }
}
module.exports =beneficiary;