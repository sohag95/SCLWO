const playersCollection = require("../db").db().collection("players")

let User=function(data){
 this.data=data
}

User.prototype.name=function(){
 return this.data
}

User.search = function (searchTerm) {
  return new Promise(async (resolve, reject) => {
    if (typeof searchTerm == "string") {
      let users = await playersCollection.aggregate([{ $match: { $text: { $search: searchTerm } } }, { $sort: { score: { $meta: "textScore" } } }]).toArray()
      usersData = users.map(user => {
        data = {
          regNumber: user.regNumber,
          userName: user.userName
        }
        return data
      })
      console.log(usersData)
      resolve(usersData)
    } else {
      reject()
    }
  })
}

module.exports=User