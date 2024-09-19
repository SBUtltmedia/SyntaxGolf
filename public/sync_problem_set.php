<?php
echo getcwd();
$problem_set=$_GET["id"];
$source_file=file_get_contents("problem_sets/problem_$problem_set.json");
$data = json_decode($source_file, true);

// print_r($data);

    // foreach ($data["holes"] as $hole) {
    //     print_r($hole['expression']);
    // }
    // print_r($hole);



// $dir="../data/";
foreach (glob("../data/*/$problem_set.json") as $filename) {
    $user_file = file_get_contents($filename);
    $user_data = json_decode($user_file, true);
    foreach($user_data["holes"] as $key=>$value) {
        $user_data["holes"][$key]['expression'] = $data["holes"][$key]['expression'];
        $user_data["holes"][$key]['notes'] = $data["holes"][$key]['notes'];
    }
    file_put_contents($filename, json_encode($user_data));
}

// $files1 = scandir($dir);
// $files2 = scandir($dir, SCANDIR_SORT_DESCENDING);

// print_r($files1);
// print_r($files2)

?>