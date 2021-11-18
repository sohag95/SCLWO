
let CommonFunctions=function(data){
  this.data=data
}

CommonFunctions.getBattingTeamName=function(data){
  let battingTeam={}
  if((data.matchDetails.tossWonBy=="firstTeam" && data.matchDetails.decidedTo=="batting") || (data.matchDetails.tossWonBy=="secondTeam" && data.matchDetails.decidedTo=="bowling")){
    battingTeam.firstBattingTeam=data.matchDetails.firstTeam
    battingTeam.secondBattingTeam=data.matchDetails.secondTeam
  }else if((data.matchDetails.tossWonBy=="firstTeam" && data.matchDetails.decidedTo=="bowling") || (data.matchDetails.tossWonBy=="secondTeam" && data.matchDetails.decidedTo=="batting")){
    battingTeam.firstBattingTeam=data.matchDetails.secondTeam
    battingTeam.secondBattingTeam=data.matchDetails.firstTeam
  }
  return battingTeam
}

CommonFunctions.getPlayersScoreDetailsOfAMatch=function(matchData){
  let firstTeamBattingInnings
  let firstTeamBowlingInnings
  let secondTeamBattingInnings
  let secondTeamBowlingInnings
  let firstTeamPlayersScore=[]
  let secondTeamPlayersScore=[]
  let firstTeamBattingInningsPosition=""
  let firstTeamBowlingInningsPosition=""
  let secondTeamBattingInningsPosition=""
  let secondTeamBowlingInningsPosition=""

  if((matchData.matchDetails.tossWonBy=="firstTeam" && matchData.matchDetails.decidedTo=="batting")||(matchData.matchDetails.tossWonBy=="secondTeam" && matchData.matchDetails.decidedTo=="bowling")){
    firstTeamBattingInnings=matchData.firstInningsBatting
    firstTeamBowlingInnings=matchData.secondInningsBowling
    secondTeamBattingInnings=matchData.secondInningsBatting
    secondTeamBowlingInnings=matchData.firstInningsBowling
    firstTeamBattingInningsPosition="firstInningsBatting"
    firstTeamBowlingInningsPosition="secondInningsBowling"
    secondTeamBattingInningsPosition="secondInningsBatting"
    secondTeamBowlingInningsPosition="firstInningsBowling"
  }else{
    firstTeamBattingInnings=matchData.secondInningsBatting
    firstTeamBowlingInnings=matchData.firstInningsBowling
    secondTeamBattingInnings=matchData.firstInningsBatting
    secondTeamBowlingInnings=matchData.secondInningsBowling
    firstTeamBattingInningsPosition="secondInningsBatting"
    firstTeamBowlingInningsPosition="firstInningsBowling"
    secondTeamBattingInningsPosition="firstInningsBatting"
    secondTeamBowlingInningsPosition="secondInningsBowling"
  }

  matchData.matchDetails.firstTeamTeamList.forEach((player)=>{
    let battingData=null
    let bowlingData=null
    let battingIndex=null
    let bowlingIndex=null
    firstTeamBattingInnings.allBatsman.forEach((batter,index1)=>{
      if(player.userName==batter.name && player.regNumber==batter.regNumber){
        battingData={
            runs:batter.runs,
            balls:batter.balls,
            fours:batter.fours,
            sixes:batter.sixes,
            isOut:batter.isOut
        }
        battingIndex=index1
      }
    })
    firstTeamBowlingInnings.allBowlers.forEach((bowler,index2)=>{
      if(player.userName==bowler.name && player.regNumber==bowler.regNumber){
        bowlingData={
            runs:bowler.runs,
            wickets:bowler.wickets,
            overs:bowler.overs,
            madenOvers:bowler.madenOvers,
            wideBalls:bowler.wideBalls,
            noBalls:bowler.noBalls
        }
        bowlingIndex=index2
      }
    })
    let playerDetails={
      userName:player.userName,
      regNumber:player.regNumber,
      battingIndex:battingIndex,
      bowlingIndex:bowlingIndex,
      matchData:{
        matchId:matchData.matchId,
        tournamentName:matchData.matchDetails.tournamentName,
        tournamentYear:matchData.matchDetails.tournamentYear,
        ownTeam:matchData.matchDetails.firstTeam,
        opponentTeam:matchData.matchDetails.secondTeam,
        winningStatus:matchData.matchDetails.winningStatus
      },
      battingData:battingData,
      bowlingData:bowlingData
    }
    firstTeamPlayersScore.push(playerDetails)
  })
// console.log(firstTeamPlayersScore)
  matchData.matchDetails.secondTeamTeamList.forEach((player)=>{
    let battingData=null
    let bowlingData=null
    let battingIndex=null
    let bowlingIndex=null
    secondTeamBattingInnings.allBatsman.forEach((batter,index3)=>{
      if(player.userName==batter.name && player.regNumber==batter.regNumber){
        battingData={
            runs:batter.runs,
            balls:batter.balls,
            fours:batter.fours,
            sixes:batter.sixes,
            isOut:batter.isOut
        }
        battingIndex=index3
      }
    })
    secondTeamBowlingInnings.allBowlers.forEach((bowler,index4)=>{
      if(player.userName==bowler.name && player.regNumber==bowler.regNumber){
        bowlingData={
            runs:bowler.runs,
            wickets:bowler.wickets,
            overs:bowler.overs,
            madenOvers:bowler.madenOvers,
            wideBalls:bowler.wideBalls,
            noBalls:bowler.noBalls
        }
        bowlingIndex=index4
      }
    })
    let playerDetails={
      userName:player.userName,
      regNumber:player.regNumber,
      battingIndex:battingIndex,
      bowlingIndex:bowlingIndex,
      matchData:{
        matchId:matchData.matchId,
        tournamentName:matchData.matchDetails.tournamentName,
        tournamentYear:matchData.matchDetails.tournamentYear,
        matchDate:matchData.matchDetails.dateOfTheMatch,
        ownTeam:matchData.matchDetails.secondTeam,
        opponentTeam:matchData.matchDetails.firstTeam,
        winningStatus:matchData.matchDetails.winningStatus
      },
      battingData:battingData,
      bowlingData:bowlingData
    }
    secondTeamPlayersScore.push(playerDetails)
  })
  let playersScoreDetails={
    firstTeam:{
      firstTeamBattingInningsPosition:firstTeamBattingInningsPosition,
      firstTeamBowlingInningsPosition:firstTeamBowlingInningsPosition,
      firstTeamPlayersScore:firstTeamPlayersScore
    },
    secondTeam:{
      secondTeamBattingInningsPosition:secondTeamBattingInningsPosition,
      secondTeamBowlingInningsPosition:secondTeamBowlingInningsPosition,
      secondTeamPlayersScore:secondTeamPlayersScore
    }
  }
  
  return playersScoreDetails
}

CommonFunctions.getPlayersPerformanceInTournament=function(tournamentName,tournamentYear,playersPerformances){
  let teamPlayers=[]
  
  playersPerformances.forEach((player)=>{
    let runs=0
    let wickets=0
    let matchesPlayed=0
    player.matchDetails.forEach((match)=>{
      if(match.matchData.tournamentName==tournamentName && match.matchData.tournamentYear){
        if(match.battingData){
          runs=runs+match.battingData.runs
        }
        if(match.bowlingData){
          wickets=wickets+match.bowlingData.wickets
        }
        matchesPlayed=matchesPlayed+1
      }
    })
    let playerData={
      regNumber:player.regNumber,
      userName:player.userName,
      matchesPlayed:matchesPlayed,
      runs:runs,
      wickets:wickets
    }
    teamPlayers.push(playerData)
  })
  return teamPlayers
}
module.exports= CommonFunctions