const completedMatchesCollection = require("../db").db().collection("CompletedMatches")
const ObjectId = require('mongodb').ObjectId

let SuccessMatchRoom=function(data){
  this.data=data
}

SuccessMatchRoom.findSingleRoomById = function(matchId) {
  return new Promise(async function(resolve, reject) {
    try{
      if (typeof(matchId) != "string") {
        reject()
        return
      }
      let match = await completedMatchesCollection.findOne({matchId:matchId})
      if (match) {
        resolve(match)
      } else {
        reject()
      }
    }catch{
      reject()
    }
  })
}

SuccessMatchRoom.markAsPlayersDataAdded = function(_id) {
  return new Promise(async function(resolve, reject) {
    try{
      await completedMatchesCollection.findOneAndUpdate({_id: new ObjectId(_id)},{
        $set:{
          "scoreAdditionCompleted":true
        }
      })
      resolve()
    }catch{
      reject()
    } 
  })
}
module.exports= SuccessMatchRoom