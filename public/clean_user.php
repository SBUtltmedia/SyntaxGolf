<?php
session_start();
$id=$_GET["id"];
if(isset($_SESSION['mail'])){
    list($user,$other)=explode("@",$_SESSION['mail']);
    $idFile=  "../data/$user/$id.json";  
    unlink($idFile);
}

  

