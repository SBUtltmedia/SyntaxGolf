<?php
session_start();
$user="dummyUser";
$id=$_GET['id'];
$file="./problem_sets/problem_$id.json";
if(isset($_SESSION['mail'])){
    list($user,$other)=explode("@",$_SESSION['mail']);
    $idFile=  "../data/$user/$id.json";   
}

  
if(isset($_POST["json"]) && isset($_SESSION['mail']) ){
    if (strpos($_SERVER['REQUEST_URI'], "admin")) {
      file_put_contents($file,$_POST["json"]);
    } else {
      file_put_contents($idFile,$_POST["json"]);
    }
    if(!file_exists($idFile)){
        mkdir(dirname($idFile), 0755, true);
        }

   print($_POST["json"]);
}
else{
  
  if(file_exists($idFile)){
    $file=$idFile;
  }

    $json=file_get_contents($file);
    
    print($json);

}