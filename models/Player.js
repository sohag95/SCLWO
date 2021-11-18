const bcrypt = require("bcryptjs")
const RegistrationNumberGenerator=require('../models/RegistrationNumberGenerator')
const PerformanceTable = require("./PerformanceTable")
const playersCollection = require("../db").db().collection("players")
const administrationCollection = require("../db").db().collection("administration")
const performanceTableCollection = require("../db").db().collection("performanceTable")

   

let Player = function (data,from) {
  this.data = data
  this.errors = []
  this.regNumber=undefined
  this.from=from
  
}

Player.prototype.cleanUp = async function () {
  try {
    if(this.from!="edit"){
      let registrationNumber = new RegistrationNumberGenerator("pl")
      this.regNumber = await registrationNumber.getRegNumber()
      if (typeof this.data.currentClub != "string") {
        this.data.currentClub = ""
      }
      if (typeof this.data.leaguePlaying != "string") {
        this.data.leaguePlaying = ""
      }
      if (typeof this.data.gender != "string") {
        this.data.gender = ""
      }
      if (typeof this.data.password != "string") {
        this.data.password = ""
      }
      if (typeof this.data.dob != "string") {
        this.data.dob = ""
      }
      if (typeof this.data.userName != "string") {
        this.data.userName = ""
      }
    }

    
    if (typeof this.data.email != "string") {
      this.data.email = ""
    }
    
    if (typeof this.data.address != "string") {
      this.data.address = ""
    }
    if (typeof this.data.battingStyle != "string") {
      this.data.battingStyle = ""
    }
    if (typeof this.data.bowlingStyle != "string") {
      this.data.bowlingStyle = ""
    }
    if (typeof this.data.phone != "string") {
      this.data.phone = ""
    }
    let date=new Date()
    // get rid of any bogus properties
    if(this.from=="register"){
      this.data = {
        regNumber: this.regNumber,
        userName: this.data.userName.trim().toLowerCase(),
        currentClub:this.data.currentClub.trim().toUpperCase(),
        leaguePlaying:this.data.leaguePlaying.trim().toLowerCase(),
        leagueYear:String(date.getFullYear()),
        gender: this.data.gender.trim().toLowerCase(),
        dob: this.data.dob.trim().toLowerCase(),
        battingStyle: this.data.battingStyle.trim().toLowerCase(),
        bowlingStyle: this.data.bowlingStyle.trim().toLowerCase(),
        address: this.data.address.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        phone: this.data.phone.trim().toLowerCase(),
        aboutPlayer:null,
        password: this.data.password,
      }
    }
    if(this.from=="edit"){
      this.data={
        battingStyle: this.data.battingStyle.trim().toLowerCase(),
        bowlingStyle: this.data.bowlingStyle.trim().toLowerCase(),
        address: this.data.address.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        phone: this.data.phone.trim().toLowerCase(),
      }
    }
  } catch {
    res.render("404")
  }
}

Player.prototype.validate = function () {
        if(this.from!="edit"){
          if (this.data.userName == "") {
            this.errors.push("You must provide player's name.")
          }
          if (this.data.password == "") {
            this.errors.push("You must provide a password.")
          }
          if (this.data.currentClub == "") {
            this.errors.push("You must select player's current club name.")
          }
          if (this.data.leaguePlaying == "") {
            this.errors.push("You must select player's tournament name.")
          }
  
          if (this.data.gender == "") {
            this.errors.push("You must select player's gender.")
          }
          if (this.data.password.length > 0 && this.data.password.length < 12) {
            this.errors.push("Password must be at least 12 characters.")
          }
          if (this.data.password.length > 50) {
            this.errors.push("Password cannot exceed 50 characters.")
          }
          if (this.data.dob.length > 10) {
            this.errors.push("DOB cannot exceed 10 characters.")
          }
         
          if (this.data.dob == "") {
            this.errors.push("You must provide your date of birth.")
          }
        }
     
      
      
      if (this.data.email == "") {
        this.data.email = "Not given"
      }
      if (this.data.address == "") {
        this.errors.push("You must provide your address.")
      }
      if (this.data.battingStyle == "") {
        this.errors.push("You must provide your batting style")
      }
      if (this.data.bowlingStyle == "") {
        this.errors.push("You must provide your bowling style.")
      }
      if (this.data.phone == "") {
        this.errors.push("You must provide a phone number.")
      }
      if (this.data.address.length > 80) {
        this.errors.push("address cannot exceed 80 characters.")
      }
      if (this.data.phone.length != 10) {
        this.errors.push("Your phone number should contain 10 digits.")
      }
    
}

Player.prototype.playerLogin = function () {
  return new Promise((resolve, reject) => {
    if (typeof this.data.regNumber != "string") {
      this.data.regNumber = ""
    }
    if (typeof this.data.password != "string") {
      this.data.password = ""
    }
    playersCollection
      .findOne({ regNumber: this.data.regNumber.toLowerCase() })
      .then(attemptedUser => {
        if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
          this.data = attemptedUser
          resolve("Congrats!")
        } else {
          reject("Invalid registration number / password.")
        }
      })
      .catch(function () {
        reject("Please try again later.")
      })
  })
}

Player.prototype.playerRegister = function () {
  return new Promise(async (resolve, reject) => {
    try {
      // Step #1: Validate user data
      await this.cleanUp()
      this.validate()
      if (!this.errors.length) {
        let performanceTable = new PerformanceTable(this.data.regNumber)
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password, salt)
        await playersCollection.insertOne(this.data)
        await performanceTable.createTable()
        await administrationCollection.findOneAndUpdate({regNumber:'21sclwoNeededData9999'},
        { $inc: { "serialNumber": 1 } }
        );
        console.log("done properly.")
        resolve(this.data.regNumber)
      } else {
        reject(this.errors)
      }
    } catch {
      reject(["There is some problem.Try again later!"])
    }
  })
}
Player.prototype.updateProfileData = function (regNumber) {
  return new Promise(async (resolve, reject) => {
    try {
      // Step #1: Validate user data
      await this.cleanUp()
      this.validate()
      console.log("All Data:",this.data)
      if (!this.errors.length) {
        await playersCollection.findOneAndUpdate({regNumber:regNumber},
        { 
          $set: { 
          "address":this.data.address,
          "battingStyle":this.data.battingStyle,
          "bowlingStyle":this.data.bowlingStyle,
          "phone":this.data.phone,
          "email":this.data.email 
          }
        });
        console.log("done properly.")
        resolve()
      } else {
        reject(this.errors)
      }
    } catch {
      reject(["There is some problem.Try again later!"])
    }
  })
}
Player.getPlayersByTournamentAndClubName = function(clubName,tournamentName){
  return new Promise(async (resolve, reject) => {
    try {
      let allPlayersData=await playersCollection.find({$and:[{currentClub:clubName},{leaguePlaying:tournamentName}]}).toArray()
      let allPlayers=allPlayersData.map((player)=>{
        data={
          regNumber:player.regNumber,
          userName:player.userName
        }
        return data
        })
        resolve(allPlayers)
    }catch{
      console.log("I am here buddy!!")
      reject()
    }
  })
}


Player.findPlayerByregNumber = function (regNumber) {
  return new Promise(function (resolve, reject) {
    if (typeof regNumber != "string") {
      reject()
      return
    }
    playersCollection
      .findOne({ regNumber: regNumber })
      .then(function (userDocument) {
        if (userDocument) {
          userDocument = {
            regNumber: userDocument.regNumber,
            userName: userDocument.userName,
            dob: userDocument.dob,
            battingStyle: userDocument.battingStyle,
            bowlingStyle: userDocument.bowlingStyle,
            currentClub:userDocument.currentClub,
            leaguePlaying:userDocument.leaguePlaying,
            leagueYear:userDocument.leagueYear,
            address: userDocument.address,
            phone: userDocument.phone,
            email:userDocument.email,
            aboutPlayer:userDocument.aboutPlayer
          }
          resolve(userDocument)
        } else {
          reject()
        }
      })
      .catch(function () {
        reject()
      })
  })
}

Player.updatePlayerClubName = function (data,regNumber) {
  return new Promise(async (resolve, reject) =>{
    try{
      let errors=[]
      if (typeof data.leaguePlaying != "string") {
       data.leaguePlaying=""
      }
      if (typeof data.currentClub != "string") {
       data.currentClub=''
      }
      if(data.leaguePlaying==""){
        errors.push("You must select your tournament name.")
      }
      if(data.currentClub==""){
        errors.push("You must select your club name.")
      }
      let date=new Date()
      if(!errors.length){
       await playersCollection.findOneAndUpdate({regNumber:regNumber},{
          $set:{
            "leagueYear":String(date.getFullYear()),
            "currentClub":data.currentClub,
            "leaguePlaying":data.leaguePlaying
          }
        })
        resolve()
      }else{
        reject(errors)
      }   
    }catch{
      reject(["sorry, thee is some problem.Try again later!"])
    }
    
  })
}

Player.updateAboutData=function(aboutData,regNumber){
  return new Promise(async (resolve, reject) =>{
    try{
      let errors=[]
      if (typeof aboutData != "string") {
       aboutData=""
      }
      if (aboutData.length >=300 ) {
        errors.push("Youhave to write about yourself within 300 characters.")
      }
      if(aboutData==""){
        errors.push("You should write something about yourself.")
      }
      
      if(!errors.length){
       await playersCollection.findOneAndUpdate({regNumber:regNumber},{
          $set:{
            "aboutPlayer":aboutData,
          }
        })
        resolve()
      }else{
        reject(errors)
      }
    }catch{
      reject(["sorry, thee is some problem.Try again later!"])
    }
    
  })
}


Player.getPlayersNameAndPerformanceData = function(uniqueOperations) {
  return new Promise(async function(resolve, reject) {
    try{
    let aggOperations = uniqueOperations.concat([
      {$lookup: {from: "players", localField: "regNumber", foreignField: "regNumber", as: "playerDocument"}},
      {$project: {
        matchDetails: 1,
        regNumber: "$regNumber",
        player: {$arrayElemAt: ["$playerDocument", 0]}
      }}
    ])

    let performances = await performanceTableCollection.aggregate(aggOperations).toArray()

    let playersData=performances.map((performance)=>{
        let playerData={
          regNumber:performance.regNumber,
          userName:performance.player.userName,
          matchDetails:performance.matchDetails
        }
        return playerData
    })
    
    resolve(playersData)
  }catch{
    reject()
  }
  })
}


Player.getTeamPlayersPerformances=function(tournamentName,tournamentYear,teamName){
  return new Promise(async (resolve, reject) =>{
    try{
      let players=await playersCollection.find({currentClub:teamName,leaguePlaying:tournamentName,leagueYear:tournamentYear}).toArray()
      let playersRegNumbers=players.map((player)=>{
        return player.regNumber
      })
      let performanceData=await Player.getPlayersNameAndPerformanceData([
        {$match: {regNumber: {$in: playersRegNumbers}}}
      ])
      resolve(performanceData)
    }catch{
      resolve([])
    }
    
  })
}


module.exports=Player