import mongoose,{Schema} from "mongoose";
const contentSchema = new Schema({

    content :{
        type:String,
        required:true,
    } 

},{timestamps:true})
export const Content = mongoose.model("Content",contentSchema) 