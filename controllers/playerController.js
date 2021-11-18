const PerformanceTable = require("../models/PerformanceTable")
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
    let userData=await Player.findPlayerByregNumber(req.regNumber)
    let performanceData=await PerformanceTable.getPlayerPerformanceData(req.regNumber,"home")
    console.log(userData)
    console.log(performanceData)
    let checkData={
      isUserLoggedIn:true,
      isVisitorOwner:true
    }
    res.render("player-home",{
      userData:userData,
      performanceData:performanceData,
      checkData:checkData
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
    let tournaments=await tournamentCollection.find({isTournamentCompleted:false}).sort({ createdDate: -1 }).toArray()
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


exports.regNumberManipulationCheck =async function (req, res,next) {
  try{
    let regNumberManipulated=false
    let visitedUserData=await Player.findPlayerByregNumber(req.params.profileUserReg)
    if(req.params.visitorReg!=req.session.user.regNumber){
      regNumberManipulated=true
    }
    if(visitedUserData && !regNumberManipulated){
      let visitedUserPerformance= await PerformanceTable.getPlayerPerformanceData(visitedUserData.regNumber,"compare")
      let visitorUserData=await Player.findPlayerByregNumber(req.regNumber)
      let visitorUserPerformance= await PerformanceTable.getPlayerPerformanceData(req.regNumber,"compare")
      req.compareData={
        visitedUserData:visitedUserData,
        visitedUserPerformance:visitedUserPerformance,
        visitorUserData:visitorUserData,
        visitorUserPerformance:visitorUserPerformance
      }
      console.log(req.compareData)
      next()
    }else{
      req.flash("errors", "Registration number changing detected.")
      req.session.save(function () {
        res.redirect("/player-home")
      })
    }
  }catch{
    req.flash("errors", "Sorry!!There is some problem.Try again later.")
    res.render("404") 
  }
}

exports.getComparePageWithData = function (req, res) {
  console.log(req.compareData)
  //getting common matches
  let commonMatches=PerformanceTable.getCommonMatches(req.compareData.visitorUserPerformance,req.compareData.visitedUserPerformance)
  console.log("Common Matches : ",commonMatches)
  res.render("compare-page",{
    compareData:req.compareData,
    commonMatches:commonMatches
  })
}

exports.getPerformanceAnalysisPage = function (req, res) {
  res.render("performance-analysis")
}

exports.updateAboutData =async function (req, res) {
  Player
  .updateAboutData(req.body.aboutData,req.regNumber)
  .then(() => {
     req.flash("success", "Details about yourself updated successfully.")
    req.session.save(function () {
      res.redirect(`/profile/${req.regNumber}`)
    })
  })
  .catch(errors => {
    errors.forEach(error => req.flash("errors", error))
    req.session.save(function () {
      res.redirect(`/profile/${req.regNumber}`)
    })
  })
}