const completedMatchesCollection = require("../db").db().collection("CompletedMatches")

let SuccessMatchRoom=function(data){
  this.data=data
}

SuccessMatchRoom.findSingleRoomById = function(matchId) {
  return new Promise(async function(resolve, reject) {
    let match = await completedMatchesCollection.findOne({matchId:matchId})
    if (match) {
      resolve(match)
    } else {
      reject()
    }
  })
}
module.exports= SuccessMatchRoom