$(document).ready(() => {

  $(document).on('click','#banner', function(){
      $(".banner-holder").css({"top": "-1000px"});
      setTimeout(function () {
        $(".banner-holder").css({"display": "none"});        
      }, 2000);
  });



  // $(window).on("scroll load", function(){
  //   let start = $('nav').height() * 1.2;

  //   if($(window).scrollTop() > start){
  //     $('nav').addClass("scrolled");
  //   }else{
  //     $('nav').removeClass("scrolled");
  //   }
  // });

})