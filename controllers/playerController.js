const Player = require("../models/Player")
const PracticeMatch = require("../models/PracticeMatch")
const playersCollection = require("../db").db().collection("players")
const performanceTableCollection = require("../db").db().collection("performanceTable")
const tournamentCollection = require("../db").db().collection("Tournaments")

exports.playerMustBeLoggedIn = function (req, res, next) {
  if (req.session.user.accountType == "player") {
    next()
  } else {
    req.flash("errors", "You must be logged in as a player to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}

exports.playerLogin = function (req, res) {
  let player = new Player(req.body)
  player
    .playerLogin()
    .then(function (result) {
      req.session.user = { regNumber: player.data.regNumber, userName: player.data.userName,accountType: "player" }
      req.session.save(function () {
        res.redirect("/player-home")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.playerRegister = function (req, res) {
  let player = new Player(req.body,"register")

  player
    .playerRegister()
    .then(regNumber => {
      let msg = "Account Created !!! Player's name : " + req.body.userName + "  ||  Registration number : " + regNumber + "  ||  Password : " + req.body.password + " "
      //The created message(msg) should go to player's mobile as SMS.The whole functionality will be written here.
      req.flash("success", msg)
      req.session.save(function () {
        console.log("hello i am here")
        res.redirect("/admin-home")
      })
    })
    .catch(regErrors => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
}

exports.playerHome =async function (req, res) {
  try{
    let profileUser=await playersCollection.findOne({regNumber:req.regNumber})
    let statistics=await performanceTableCollection.findOne({regNumber:req.regNumber})
    profileUser.password=undefined
    res.render("player-home",{
      profileUser:profileUser,
      statistics:statistics
    })
  }catch{
    res.render('404')
  }
}



exports.ifPlayerExists = function (req, res, next) {
  Player.findPlayerByregNumber(req.params.regNumber)
    .then(function (userDocument) {
      req.profileUser = userDocument
      
      next()
    })
    .catch(function () {
      res.render("404")
    })
}

exports.getPlayerEditPage =async function (req, res) {
  try{
    let date=new Date()
    let tournaments=await tournamentCollection.find({tournamentYear:String(date.getFullYear())}).sort({ createdDate: -1 }).toArray()
    let userData = req.profileUser
    let visitorReg = userData.regNumber
    console.log(userData)
    if (visitorReg == req.session.user.regNumber) {
      res.render("player-profile-edit-page", {
        userData: userData,
        tournaments:tournaments
      })
    } else {
      req.flash("errors", "You don't have permition to perform that action.")
      req.session.save(function () {
        res.redirect("/")
      })
    }
  }catch{
    res.render("404")
  }
  
}

exports.updatePlayerClubName = function (req, res) {
  console.log("Data:",req.body)
  Player.updatePlayerClubName(req.body,req.session.user.regNumber)
    .then(()=> {
      req.flash("success", "You have successfully updated your club name.")
      req.session.save(function () {
        res.redirect(`/player/profile/${req.session.user.regNumber}/edit`)
      })
    })
    .catch(function (errors) {
      errors.forEach(error => req.flash("errors", error))
        req.session.save(function () {
        res.redirect(`/player/profile/${req.session.user.regNumber}/edit`)
      })
    })
}


exports.updateProfileData = function (req, res) {
  let player = new Player(req.body,"edit")
  player
    .updateProfileData(req.session.user.regNumber)
    .then(() => {
       req.flash("success", "Profile data successfully updated!!")
      req.session.save(function () {
        res.redirect(`/player/profile/${req.session.user.regNumber}/edit`)
      })
    })
    .catch(errors => {
      errors.forEach(error => req.flash("errors", error))
      req.session.save(function () {
        res.redirect(`/player/profile/${req.session.user.regNumber}/edit`)
      })
    })
}

exports.practiceMatchAdditionFormPage = function (req, res) {
  res.render("practice-match-adding-form")
}

exports.addPracticeMatchData = function (req, res) {
  console.log(req.body)
  let matchData={
    ownTeam:req.body.myTeamName,
    opponentTeam:req.body.opponentTeamName,
    venue:req.body.venue,
    date:req.body.date,
    shortDetails:req.body.shortDetails
  }
  let battingData=JSON.parse(req.body.battingData)
  let bowlingData=JSON.parse(req.body.bowlingData)
  let data={
    matchData:matchData,
    battingData:battingData,
    bowlingData:bowlingData
  }
  console.log(data,req.regNumber)
  let practiceMatches = new PracticeMatch(data,req.regNumber)
  practiceMatches
    .addPracticeMatchData()
    .then(() => {
       req.flash("success", "Practice match details successfully added.")
      req.session.save(function () {
        res.redirect("/player-home")
      })
    })
    .catch(errors => {
      errors.forEach(error => req.flash("errors", error))
      req.session.save(function () {
        res.redirect("/player-home")
      })
    })
}


exports.deletePracticeMatchData = function (req, res) {
  let matchIndex=Number(req.params.index)
  let practiceMatches = new PracticeMatch(null,req.regNumber)
  practiceMatches
    .deletePracticeMatchData(matchIndex)
    .then(() => {
       req.flash("success", "Practice match details successfully deleted.")
      req.session.save(function () {
        res.redirect("/player-home")
      })
    })
    .catch(errors => {
      errors.forEach(error => req.flash("errors", error))
      req.session.save(function () {
        res.redirect("/player-home")
      })
    })
}