 let checksession=(req,res,next)=>{
    if(req.session.username){
      next();
    }else{
      res.redirect("/");
    }
  }
  
  // if user is already login redirect to index
  let isLogin=(req,res,next)=>{
    if(req.session.username){
      res.redirect("/index");
    }else{
      res.render('login', { title: 'Login' });
    }
  }

  
  module.exports = {
      checksession,isLogin,
  }