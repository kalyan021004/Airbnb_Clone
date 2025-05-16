const mongoose=require("mongoose");
const initdata=require("./data.js");
const listing =require("../models/listing.js")

main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/hotels');
}
const initDB =async ()=>{
    await listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({
...obj,owner:"6826e755fd6fa5a67bcb5764"
    }))
    await listing.insertMany(initdata.data);
    console.log("dta was initialized");

}
initDB();