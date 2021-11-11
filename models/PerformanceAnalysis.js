const performanceTableCollection = require("../db").db().collection("performanceTable")


let PerformanceAnalysis=function(){
  this.data=[{
    matchData:{
      tournamentYear:2020
    },
    battingData:{
      runs:17,
      balls:20,
      trackingBalls:"2,1,0,0,4,0,0,0,2,0,0,0,2,0,0,0,0,0,0,6",
      outType:"caught-out"
    },
    bowlingData:{
      runs:20,
      overs:3,
      trackingBalls:"2,1,0,0,4,0,0wd,0,2,0,0lb,0,2,0,0,0no,0,0,",
      noBalls:3,
      wideBalls:2
    }
  },{
    matchData:{
      tournamentYear:2020
    },
    battingData:{
      runs:17,
      balls:20,
      trackingBalls:"2,1,0,0,4,0,0,0,2,0,0,0,2,0,0,0,0,0,0,6",
      outType:"caught"
    },
    bowlingData:{
      runs:20,
      overs:3,
      trackingBalls:"2,1,0,0,4,0,0wd,0,2,0,0lb,0,2,0,0,0no,0,0,",
      noBalls:3,
      wideBalls:2
    }
  },{
    matchData:{
      tournamentYear:2021
    },
    battingData:{
      runs:17,
      balls:20,
      trackingBalls:"2,1,0,0,4,0,0,0,2,0,0,0,2,0,0,0,0,0,0,6",
      outType:"bowled"
    },
    bowlingData:{
      runs:20,
      overs:3,
      trackingBalls:"2,1,0,0,4,0,0wd,0,2,0,0lb,0,2,0,0,0no,0,0,",
      noBalls:3,
      wideBalls:2
    }
  },{
    matchData:{
      tournamentYear:2022
    },
    battingData:{
      runs:17,
      balls:20,
      trackingBalls:"2,1,0,0,4,0,0,0,2,0,0,0,2,0,0,0,0,0,0,6",
      outType:"lbw"
    },
    bowlingData:{
      runs:20,
      overs:3,
      trackingBalls:"2,1,0,0,4,0,0wd,0,2,0,0lb,0,2,0,0,0no,0,0,",
      noBalls:3,
      wideBalls:2
    }
  }

]
    

 }
 
 PerformanceAnalysis.prototype.arrangeData=function(){
   let bowlerAllBalls=[]
   let bowlerDotBalls=0
   let bowlerBoundaryBalls=0
  //  let bowlerExtraBalls
  //  let bowlerWicketBalls

   let batterAllBalls=[]
   let batterDotBalls
  //  let batterSixes
  //  let batterFours
   let batterSingleRuns
   let batterDoubleOrTripleRuns
   let bowlingYearlyPerformances=[]
   this.data.forEach((match)=>{
      let bowlerBalls=match.bowlingData.trackingBalls.split(",")
      let dotBalls=0
      let boundaryes=0
      bowlerBalls.forEach((ball)=>{
        if(ball=="0"){
          dotBalls=dotBalls+1
        }
        if(ball=="4" || ball=="6"){
          boundaryes=boundaryes+1
        }
      })
      let year=match.matchData.tournamentYear
      let entered=false
      let yearIndex
      bowlingYearlyPerformances.forEach((yearly,index)=>{
        if(yearly.year==year){
          entered=true
          yearIndex=index
        }
      })
      if(entered){
        let newData={
          year:year,
          dotBalls:bowlingYearlyPerformances[yearIndex].dotBalls+dotBalls,
          boundaryes:bowlingYearlyPerformances[yearIndex].boundaryes+boundaryes
        }
        bowlingYearlyPerformances[yearIndex]=newData
      }else{
        let insertData={
          year:year,
          dotBalls:dotBalls,
          boundaryes:boundaryes
        }
        bowlingYearlyPerformances.push(insertData)
      }
      
   })
   console.log(bowlingYearlyPerformances)
 }
 module.exports=PerformanceAnalysis

//  let batterBalls=match.battingData.trackingBalls.split(",")
//       bowlerAllBalls=bowlerAllBalls.concat(bowlerBalls)
//       batterAllBalls=batterAllBalls.concat(batterBalls)
//  let yearlyPerformance=[
//    {
//      year:"2021",
//      noBalls:2,
//      wideBalls:4,
//      dotBalls:33,
//      boundaryes:4,
//      wickets:3
//    }
//  ]