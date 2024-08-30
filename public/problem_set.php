<?php
session_start();
$user="dummyUser";
$id=$_GET['id'];
$file="./problem_sets/problem_$id.json";
if(isset($_SESSION['mail'])){
    list($user,$other)=explode("@",$_SESSION['mail']);
    $checkFile=  "./data/$user/$id.json";
    if(!file_exists($checkFile)){
    mkdir(dirname($path), 0755, true);
    }
    else{
        $file=$checkFile;
    }
}

  
if(isset($_POST["json"]) && isset($_SESSION['mail']) ){
   file_put_contents($file,$_POST["json"]);

   print($_POST["json"]);
}
else{
  
  

    $json=file_get_contents($file);
    
    print($json);

}