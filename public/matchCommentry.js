let comments=allComments
let startIndex=comments.length-1
let lastIndex
if(comments.length>10){
  lastIndex=startIndex-10
}else{
  lastIndex=0
}

function evenComment(commentry) {
  return `<p style="background-color: rgb(195, 220, 241)"><Strong>${commentry.commentAt} : </Strong>${commentry.comment}</p>`
}
function oddComment(commentry) {
  return `<p style="background-color: rgb(217, 232, 245)"><Strong>${commentry.commentAt} : </Strong>${commentry.comment}</p>`
}
function showLastMessage() {
  return `<p class="btn btn-sm btn-danger btn-block"><Strong>No more comments available!!</Strong></p>`
}
// let commentHTML = notOutBatters.map(function(comment) {
//   return availableBatters(comment)
// }).join('')
// document.getElementById("matchCommentry").insertAdjacentHTML("beforeend", commentHTML)


function showComment(startIndex,lastIndex){
  for(let i=startIndex;i>=lastIndex;i--){
    if(i%2==0){
      document.getElementById("matchCommentry").insertAdjacentHTML("beforeend", evenComment(comments[i]))
    }else{
      document.getElementById("matchCommentry").insertAdjacentHTML("beforeend", oddComment(comments[i]))
    }
  }
  startIndex=lastIndex-1
}
showComment(startIndex,lastIndex)

let noCommentsAvailableShown=false
let loadMoreComments=document.getElementById("loadMoreComments")

loadMoreComments.addEventListener("click",function(){
  console.log("Start indexis is : ",startIndex)
  console.log("Last indexis is : ",lastIndex)
  if(lastIndex==0){
    if(!noCommentsAvailableShown){
      document.getElementById("matchCommentry").insertAdjacentHTML("beforeend", showLastMessage())
      noCommentsAvailableShown=true
      loadMoreComments.disabled=true
    }
  }else {
    if(startIndex>10){
      startIndex=lastIndex-1
      lastIndex=startIndex-10
    }else{
      startIndex=lastIndex
      lastIndex=0
    }
    showComment(startIndex,lastIndex)
  }
})