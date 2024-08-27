
function postLTI(ses,name){

var dfd = jQuery.Deferred();
$.post( `/LTI/postLTI.php?name=${name}`, {data:ses} ).done(function(result){

dfd.resolve(result)


});
 return dfd.promise();

}
