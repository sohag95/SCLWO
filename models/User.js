let User=function(data){
 this.data=data
}

User.prototype.name=function(){
 return this.data
}

module.exports=User