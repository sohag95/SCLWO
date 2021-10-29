const express=require('express')
const router=express.Router()
const userController=require('./controllers/userController')
const adminController=require('./controllers/adminController')
const playerController=require('./controllers/playerController')
const matchControllerController=require('./controllers/matchControllerController')
const liveScoreRoomController=require('./controllers/liveScoreRoomController')

// user related routes
router.get('/test',userController.test)
router.get('/',userController.guestHome)
//user related routes of scoreboard
router.get("/singleRoomShortDetails/:matchId",  userController.singleRoomShortDetails)
router.get("/firstInningsDetails/:matchId",  userController.firstInningsDetails)
router.get("/secondInningsDetails/:matchId",  userController.secondInningsDetails)
router.get("/batsman/:matchId/:index/:innings/inningsDetails",  userController.batsmanInningsDetails)


//Admin related routes
router.post("/admin-login", adminController.adminLogin)
router.get("/admin-home",adminController.adminMustBeLoggedIn,adminController.adminHome)
router.post("/slidePictureUpload", adminController.adminMustBeLoggedIn, adminController.uploadSlidePicture)
router.post("/player-register", adminController.adminMustBeLoggedIn, playerController.playerRegister)


//Player's related routes
router.post("/player-login", playerController.playerLogin)
router.get("/player-home", playerController.playerMustBeLoggedIn, playerController.playerHome)
router.get("/player/profile/:regNumber/edit", playerController.playerMustBeLoggedIn, playerController.ifPlayerExists, playerController.getPlayerEditPage)
router.post("/player-club-name-update", playerController.playerMustBeLoggedIn, playerController.updatePlayerClubName)
router.post("/update-player-profile-data", playerController.playerMustBeLoggedIn, playerController.updateProfileData)
router.post("/add-practice-match-performance", playerController.playerMustBeLoggedIn, playerController.addPracticeMatchData)
router.post("/delete/practiceMatch/:index/details", playerController.playerMustBeLoggedIn, playerController.deletePracticeMatchData)
router.get("/practice-match-addition-form", playerController.playerMustBeLoggedIn, playerController.practiceMatchAdditionFormPage)


//Match controller routes
router.post("/matchController-login", matchControllerController.matchControllerLogin)
router.get("/matchController-home",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.matchControllerHome)
router.post("/live-match-room-create", matchControllerController.matchControllerMustBeLoggedIn,matchControllerController.liveMatchRoomCreate)
router.get("/all-available-match-rooms",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.availableMatchRooms)
router.post("/match-room/:_id/delete",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifMatchRoomExists,matchControllerController.liveMatchRoomDelete)

router.post("/add-new-tournament", matchControllerController.matchControllerMustBeLoggedIn,matchControllerController.addNewTournament)
router.get("/tournament/:_id/add-group",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifTournamentExists,matchControllerController.addGroupPage)
router.post("/tournament/:_id/add-group",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifTournamentExists,matchControllerController.addGroupOnTournament)
router.post("/tournament/:_id/allGroupsAdded",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifTournamentExists,matchControllerController.allGroupsAdded)
router.get("/tournament/qualified/:_id/second-round-teams",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifTournamentExists,matchControllerController.getSecondRoundTeamsPage)
router.post("/tournament/qualified/:_id/second-round-teams",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifTournamentExists,matchControllerController.addSecondRoundTeams)
router.post("/tournament/:_id/delete",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifTournamentExists,matchControllerController.deleteTournament)
router.post("/tournament/:_id/completed",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifTournamentExists,matchControllerController.tournamentCompleted)

router.post("/match/:_id/add-scoreCard-link",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifMatchRoomExists,matchControllerController.addScoreCardLink)
router.post("/tournament/:_id/add-fixture-link",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifTournamentExists,matchControllerController.addFixtureLink)
router.post("/tournament/:_id/add-second-round-fixture-link",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifTournamentExists,matchControllerController.addSecondRoundFixtureLink)
router.post("/match/:_id/successfullyDone",matchControllerController.matchControllerMustBeLoggedIn, matchControllerController.ifMatchRoomExists,matchControllerController.markSuccessfullyDone)
router.get("/players-scores/:matchId/updation/link/page",matchControllerController.matchControllerMustBeLoggedIn,matchControllerController.ifSuccessMatchExists,matchControllerController.getPlayersScoreUpdationPage)
router.post("/match/:matchId/update-player-score",matchControllerController.matchControllerMustBeLoggedIn,matchControllerController.ifSuccessMatchExists,matchControllerController.playerScoreUpdate)
router.post("/all-players-data/:matchId/added/marked",matchControllerController.matchControllerMustBeLoggedIn,matchControllerController.ifSuccessMatchExists,matchControllerController.markAsAllPlayerDataAdded)
router.post("/search-match-room",matchControllerController.matchControllerMustBeLoggedIn,matchControllerController.searchMatchId,matchControllerController.getPlayersScoreUpdationPage)


//Live scorer related routes
router.post("/live-scorer-logIn", liveScoreRoomController.liveScorerLogin)
router.get("/live-scorer-room", liveScoreRoomController.liveScorerMustBeLoggedIn, liveScoreRoomController.liveScorerRoom)
router.post("/create-team-list", liveScoreRoomController.liveScorerMustBeLoggedIn, liveScoreRoomController.createTeamList)
router.post("/matchStarted", liveScoreRoomController.liveScorerMustBeLoggedIn, liveScoreRoomController.matchStarted)
router.post("/tossDetails", liveScoreRoomController.liveScorerMustBeLoggedIn, liveScoreRoomController.tossDetails)
router.post("/updateLiveScore", liveScoreRoomController.liveScorerMustBeLoggedIn, liveScoreRoomController.updateScore)
router.post("/matchCommentry", liveScoreRoomController.liveScorerMustBeLoggedIn, liveScoreRoomController.matchCommentry)
router.post("/addBatsman",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.addBatsman)
router.post("/newBowler",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.addNewBowler)
router.post("/addPaneltyRuns",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.addPaneltyRuns)

router.post("/selectBowler",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.selectBowler)
router.post("/runOut",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.runOut)
router.post("/generalOut",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.generalOut)
router.post("/gotRetiredHurt",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.gotRetiredHurt)
router.post("/addRetiredHurtBatterToBat",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.addRetiredHurtBatterToBat)

router.post("/changeStrike",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.changeStrike)
router.post("/startSecondInnings", liveScoreRoomController.liveScorerMustBeLoggedIn, liveScoreRoomController.startSecondInnings)
router.post("/manOfTheMatch", liveScoreRoomController.liveScorerMustBeLoggedIn, liveScoreRoomController.setManOfTheMatch)
router.post("/addEmergencyMessage",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.addEmergencyMessage)
router.post("/removeEmergencyMessage",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.removeEmergencyMessage)
router.post("/matchCancled",liveScoreRoomController.liveScorerMustBeLoggedIn,liveScoreRoomController.matchCancled)




//Logging out router
router.post("/logout", userController.logout)

module.exports=router